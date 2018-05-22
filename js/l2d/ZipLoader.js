/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */
/**
 * ZipLoader loads Live2D model resources from zip files.
 * To use it, first mount some archives with mountArchiveAtURL,
 * which takes a URL of a zip file, the fs prefix to mount it to,
 * and a function which is called when the archive becomes usable.
 * 
 * Then, you can create a model by passing a string like "<fs-prefix>:director.model.json"
 * to Live2D. All resources will be read from the zip automatically.
 */

ZIPLOADER_DEBUG = false
function ZipLoaderEarlyInit(statics) {
    zip.useWebWorkers = false;
    zip.workerScripts = {
        inflater: [statics + '/z-worker.combo.js']
    };
}

function ZipFSCache(reader) {
    this.reader = reader
    this.pathCache = {}
}

ZipFSCache.prototype.loadBlob = function(path, callback) {
    this.reader.getEntries(function(ents) {
        var haveRef = false;

        for (var i = 0; i < ents.length; i++) {
            var v = ents[i];
            if (!v.directory && v.filename === path) {
                haveRef = true;
                v.getData(new zip.BlobWriter(), function(blob) {
                    callback(blob)
                })
                break;
            }
        }

        if (!haveRef) {
            throw Error("Nonexistent file requested: " + path)
        }
    })
}

ZipFSCache.prototype.loadBytes = function(path, callback, cached) {
    if (this.pathCache.hasOwnProperty(path)) {
        if (ZIPLOADER_DEBUG) {
            console.log("Short path for cached resource " + path);
        }
        callback(this.pathCache[path])
    }

    var that = this
    this.loadBlob(path, function(blob) {
        var reader = new FileReader();
        reader.onloadend = function() {
            if (cached) {
                if (ZIPLOADER_DEBUG) {
                    console.log("Cache requested for " + path);
                }
                that.pathCache[path] = reader.result;
            }
            callback(reader.result)
        }
        reader.readAsArrayBuffer(blob)
    })
}

ZipFSCache.prototype.purgeCache = function() {
    if (ZIPLOADER_DEBUG) {
        console.log("ZipFSCache: purging the cache");
    }
    this.pathCache = {}
}

//============================================================
//============================================================
//  class PlatformManager     extend IPlatformManager
//============================================================
//============================================================
function ZipLoader() {
    this._filesystem = {}
}

ZipLoader.prototype.mountArchiveAtURL = function(url, fsRoot, ready) {
    var that = this;
    zip.createReader(new zip.HttpReader(url), function(reader) {
        that._filesystem[fsRoot] = new ZipFSCache(reader);
        if (ZIPLOADER_DEBUG) {
            console.log("ZipPlatformManager mounted an archive")
        }
        ready();
    });
}

ZipLoader.prototype.mountArchiveBlob = function(blob, fsRoot, ready) {
    var that = this;
    zip.createReader(new zip.BlobReader(blob), function(reader) {
        that._filesystem[fsRoot] = new ZipFSCache(reader);
        if (ZIPLOADER_DEBUG) {
            console.log("ZipPlatformManager mounted an archive")
        }
        ready();
    });
}

//============================================================
//    PlatformManager # loadBytes()
//============================================================
ZipLoader.prototype.loadBytes = function(path, callback, cached)
{
    var arch_file = path.split(":")
    var fsObj = this._filesystem[arch_file[0]]
    if (!fsObj) {
        throw Error("Programming error: no FSObject mounted for " + path)
    }

    return fsObj.loadBytes(arch_file[1], callback, cached)
}

//============================================================
//    PlatformManager # loadLive2DModel()
//============================================================
ZipLoader.prototype.loadLive2DModel = function(path/*String*/, callback)
{
    var model = null;
    
    // load moc
    this.loadBytes(path, function(buf){
        model = Live2DModelWebGL.loadModel(buf);
        callback(model);
    });
}

//============================================================
//    PlatformManager # loadTexture()
//============================================================
ZipLoader.prototype.loadTexture     = function(model/*ALive2DModel*/, no/*int*/, path/*String*/, callback)
{ 
    var arch_file = path.split(":")
    var fsObj = this._filesystem[arch_file[0]]
    if (!fsObj) {
        throw Error("Programming error: no FSObject mounted for " + path)
    }

    fsObj.loadBlob(arch_file[1], function(blob) {
        var loadedImage = new Image();
        loadedImage.onload = function() {
            // create texture
            var gl = window.DL.gl
            var texture = gl.createTexture();	 
            if (!texture){ console.error("Failed to generate gl texture name."); return -1; }

            if(model.isPremultipliedAlpha() == false){
                // 乗算済アルファテクスチャ以外の場合
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            }
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
                          gl.UNSIGNED_BYTE, loadedImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            model.setTexture(no, texture);

            // テクスチャオブジェクトを解放
            texture = null;

            if (typeof callback == "function") callback();
        };

        loadedImage.onerror = function() { 
            console.error("Failed to load image : " + path); 
        }

        loadedImage.src = URL.createObjectURL(blob);
    })
}


//============================================================
//    PlatformManager # parseFromBytes(buf)

//============================================================
ZipLoader.prototype.jsonParseFromBytes = function(buf) {    
    var jsonStr;

    var bomCode = new Uint8Array(buf, 0, 3);
    if (bomCode[0] == 239 && bomCode[1] == 187 && bomCode[2] == 191) {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf, 3));
    } else {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf));
    }
    
    var jsonObj = JSON.parse(jsonStr);
    
    return jsonObj;
};


//============================================================
//    PlatformManager # log()
//============================================================
ZipLoader.prototype.log             = function(txt/*String*/)
{
    console.log(txt);
}

