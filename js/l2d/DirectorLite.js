var LAppDefine = {
    DEBUG_LOG : true,
    DEBUG_MOUSE_LOG : false, 
    
    VIEW_LOGICAL_LEFT : -1,
    VIEW_LOGICAL_RIGHT : 1,

    VIEW_LOGICAL_MAX_LEFT : -1,
    VIEW_LOGICAL_MAX_RIGHT : 1,
    VIEW_LOGICAL_MAX_BOTTOM : -2,
    VIEW_LOGICAL_MAX_TOP : 2,

    MAX_CANVAS_INTERNAL_SIZE: 1000,

    // Decided through trial and error.
    AUTO_RESIZE_VERTICAL_DANGER_ZONE: 100,
    AUTO_RESIZE_MIN_ASPECT_RATIO: 9/16,

    // Sort of a happy medium between a tall model (Tomoe) and a short model (Ako).
    ZOOM_ADJUST_MIN_VALUE: 0.35,
}

function DirectorLite(initParams) {    
    var fsops = new ZipLoader();
    Live2DFramework.setPlatformManager(fsops)

    this.isDrawStart = false;

    this.gl = null;
    this.canvas = null;
    this.controls = document.getElementById(initParams.controlName);

    this.dragMgr = null; /*new L2DTargetPoint();*/ 
    this.viewMatrix = null; /*new L2DViewMatrix();*/
    this.projMatrix = null; /*new L2DMatrix44()*/
    this.deviceToScreen = null; /*new L2DMatrix44();*/

    this.drag = false; 
    this.oldLen = 0;    

    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.isModelShown = false;
    this.isTerminating = false;

    this.models = [];

    this.prepareCanvas(initParams.canvasName, initParams.callbackOnInitFailure);
    this.startDraw();

    if (initParams.autoResize) {
        var callout = this.reshapeWithResizeEvent.bind(this);
        this.reshapeCallout = callout;
        window.addEventListener('resize', callout, true); 
        this.reshapeWithResizeEvent();    
    }

    var that = this;
    fsops.mountArchiveAtURL(initParams.withPackageAtURL, initParams.mountedToLocation, function() {
        that.loadModel(initParams.usingInitialModelName, initParams.callbackOnFirstModelLoaded);
    });
}

DirectorLite.prototype.terminate = function() {
    for (var i = 0; i < this.models.length; ++i) {
        this.models[i].release(this.gl);
    }
    this.models = [];
    this.isTerminating = true;
    window.removeEventListener("resize", this.reshapeCallout);

    Live2D.dispose();
    Live2DFramework.setPlatformManager(null);
}

DirectorLite.prototype.loadModel = function(fromFile, callback) {
    var that = this;
    var mdl = new LAppModel();
    mdl.enableBreathing = true;
    mdl.enableSwaying = true;
    mdl.enableBlinking = true;

    this.models.push(mdl);
    var mid = this.models.length - 1;

    mdl.load(this.gl, fromFile, function() {
        mdl.modelMatrix.setY(0.7);
        mdl.startTimeMSec = UtSystem.getUserTimeMSec();
        
        if (callback) {
            callback();
        }

        that.setupControls(mid);
        that.controls.style.display = null;
    });
}

DirectorLite.prototype.setupControls = function(mid) {
    var that = this;
    var copy = this.controls.querySelector("#dltemplate").cloneNode(true);
    copy.id = null;
    copy.style.display = null;

    copy.querySelector(".dlname").textContent = this.models[mid].modelSetting.json.name;

    var exprContainer = copy.querySelector(".dlexpressions");
    for (var i in this.models[mid].modelSetting.json.expressions) {
        var e = this.models[mid].modelSetting.json.expressions[i];
        var o = document.createElement("option");
        o.textContent = e.name.split(".")[0];
        o.value = e.name;

        exprContainer.appendChild(o);
    }
    exprContainer.addEventListener("change", function(e) {
        that.models[mid].setExpression(e.target.value);
    });

    var didSelectDefaultMotion = false;
    var motionsContainer = copy.querySelector(".dlmotions");
    for (var motionName in this.models[mid].modelSetting.json.motions) {
        if (this.models[mid].modelSetting.json.motions.hasOwnProperty(motionName)) {
            var o = document.createElement("option");
            o.textContent = motionName.split(".")[0];
            o.value = motionName;

            motionsContainer.appendChild(o);

            if (!didSelectDefaultMotion && motionName.startsWith("idle")) {
                didSelectDefaultMotion = true;
                motionsContainer.value = motionName;
            }
        }
    }
    motionsContainer.addEventListener("change", function(e) {
        that.models[mid].startMotion(e.target.value, 0);
    });

    copy.querySelector(".dlvariance").addEventListener("change", function(e) {
        that.models[mid].enableSwaying = e.target.checked;
    });
    copy.querySelector(".dlbreathe").addEventListener("change", function(e) {
        that.models[mid].enableBreathing = e.target.checked;
    });
    copy.querySelector(".dlblink").addEventListener("change", function(e) {
        that.models[mid].enableBlinking = e.target.checked;
    });
    copy.querySelector(".dlloopmotions").addEventListener("change", function(e) {
        that.models[mid].repeatsMotions = e.target.checked;
    });
    copy.querySelector(".dltoggleupdates").addEventListener("click", function(e) {
        var m = that.models[mid];
        m.isFrozen = (!m.isFrozen);
        e.target.textContent = m.isFrozen? e.target.dataset.stringUnpause : e.target.dataset.stringPause;
    });

    this.controls.appendChild(copy);
}

DirectorLite.prototype.reshapeWithResizeEvent = function(event) {
    // We obviously can't play nice here, so play dirty.
    var container = this.canvas.parentNode;
    // If we only use the width/height, this is well-defined.
    var rect = container.getBoundingClientRect();

    var width = rect.width;
    var height = Math.min(window.innerHeight, LAppDefine.MAX_CANVAS_INTERNAL_SIZE) - LAppDefine.AUTO_RESIZE_VERTICAL_DANGER_ZONE;
    var ar = width / height;

    if (LAppDefine.DEBUG_LOG) {
        console.log("RESHAPE: ASPECT RATIO:" + ar)
    }

    // Things get weird when the window is really thin, so cap it to
    // 9:16 (widescreen but held sideways).
    // I'm not really sure how this works, and there's an ugly zone between
    // Bootstrap's max and min responsive sizes which is... self-describing.
    if (ar < LAppDefine.AUTO_RESIZE_MIN_ASPECT_RATIO) {
        ar = LAppDefine.AUTO_RESIZE_MIN_ASPECT_RATIO;
    }

    // Make sure the GL size is never more than 1000x1000.
    // The model textures are too small to look good above that, anyway.
    // (They also look ugly at smaller zoom sizes, but we can't deal with that here.)
    if (width > height) {
        this.canvas.width = LAppDefine.MAX_CANVAS_INTERNAL_SIZE;
        this.canvas.height = LAppDefine.MAX_CANVAS_INTERNAL_SIZE / ar;
    } else {
        this.canvas.height = LAppDefine.MAX_CANVAS_INTERNAL_SIZE;
        this.canvas.width = LAppDefine.MAX_CANVAS_INTERNAL_SIZE * ar;
    }

    // Then fix the position of the gear button.
    // CSS puts it at 0px relative to the container, so if the container is wider than
    // the canvas, the gear button is misplaced.
    rect = container.getBoundingClientRect();
    var r2 = this.canvas.getBoundingClientRect();
    var offsetLeft = (rect.width - r2.width) / 2;
    this.controls.style.left = offsetLeft + "px";
    
    // Update Live2D's matrices.
    this.reshape();
}

DirectorLite.prototype.reshape = function() {
    if (LAppDefine.DEBUG_LOG) {
        console.log("reshape");
    }

    var width = this.canvas.width;
    var height = this.canvas.height;

    var ratio = height / width;
    var left = -0.5;
    var right = 0.5;

    this.viewMatrix = new L2DViewMatrix();
    this.viewMatrix.setScreenRect(left, right, -ratio, ratio);
    this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT,
                                     LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
                                     LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
                                     LAppDefine.VIEW_LOGICAL_MAX_TOP); 

    this.viewMatrix.setMaxScale(4.0 * ratio);
    this.viewMatrix.setMinScale(1.4 * ratio);

    // Resizing unsets the user's zoom level, unfortunately.
    this.scaleModel(0, 0, 1.0)

    this.projMatrix = new L2DMatrix44();
    this.projMatrix.multScale(1, (width / height));

    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);
}

DirectorLite.prototype.prepareCanvas = function(named, webglFail) {
    this.canvas = document.getElementById(named);

    if (this.canvas.addEventListener) {
        var mouseEvent = this.mouseEvent.bind(this)
        var touchEvent = this.touchEvent.bind(this)

        // Firefox sends "wheel" events. There are a few people I can think of who would
        // be angry at me if this didn't work, so register both events.
        // ...Well, actually, they are angry at me regardless. But we would like it to work anyway.
        this.canvas.addEventListener("mousewheel", mouseEvent, false);
        this.canvas.addEventListener("wheel", mouseEvent, false);

        this.canvas.addEventListener("touchstart", touchEvent, false);
        this.canvas.addEventListener("touchend", touchEvent, false);
        this.canvas.addEventListener("touchmove", touchEvent, false);
    }

    this.dragMgr = new L2DTargetPoint();
    this.reshape();
    this.gl = this.getWebGLContext();
    if (!this.gl) {
        if (webglFail) {
            webglFail(100);
        }

        return;
    }
    
    Live2D.init();
    Live2D.setGL(this.gl);
}

DirectorLite.prototype.startDraw = function() {
    var raf = window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;

    if (!this.isDrawStart) {
        this.isDrawStart = true;
        var that = this;
        (function tick() {
            if (that.isTerminating) {
                return;
            }
            that.draw(); 
            raf(tick, that.canvas);
        })();
    }
}


DirectorLite.prototype.draw = function() {
    MatrixStack.reset();
    MatrixStack.loadIdentity();
    
    this.dragMgr.update(); 
    var dmX = this.dragMgr.getX();
    var dmY = this.dragMgr.getY();
    
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    MatrixStack.multMatrix(this.projMatrix.getArray());
    MatrixStack.multMatrix(this.viewMatrix.getArray());
    MatrixStack.push();
    
    for (var i = 0; i < this.models.length; i++) {
        var model = this.models[i];
        this.models[i].setDrag(dmX, dmY);

        if (!model) {
            return;
        }
        
        if (model.initialized && !model.updating) {
            if (!model.isFrozen) {
                model.update();
            }
            model.draw(this.gl);
        }
    }
    
    MatrixStack.pop();
}

DirectorLite.prototype.scaleModel = function(scale) {
    // adjustScale has been modified to return the absolute scale value
    // that was set.
    var absoluteScaleNow = this.viewMatrix.adjustScale(0, 0, scale);

    // Gradually shift the model down as we zoom. The idea is to
    // eventually focus on the head as we get to max scale, so
    // we aren't awkwardly zooming into her chest.
    var mmin = this.viewMatrix.getMinScale();
    var mmax = this.viewMatrix.getMaxScale();

    var where = (absoluteScaleNow - mmin) / (mmax - mmin);
    where = Math.min(1.0, Math.max(where, 0.0));

    // FIXME: multi-model
    if (this.models[0]) {
        this.models[0].modelMatrix.setY(Math.max((1 - where) * 0.7, 
            LAppDefine.ZOOM_ADJUST_MIN_VALUE));
    }
}

DirectorLite.prototype.lookFront = function()
{   
    if (this.drag) {
        this.drag = false;
    }

    this.dragMgr.setPoint(0, 0);
}


DirectorLite.prototype.mouseEvent = function(e) {
    e.preventDefault();
    
    if (e.type == "mousewheel" || e.type == "wheel") {
        var mybox = this.canvas.getBoundingClientRect();
        if (e.clientX < mybox.left || mybox.right < e.clientX || 
            e.clientY < mybox.top || mybox.bottom < e.clientY) {
            return;
        }
        
        if (e.wheelDelta > 0 || (-e.deltaY) > 0) this.scaleModel(1.1); 
        else this.scaleModel(0.9); 
    }
}


DirectorLite.prototype.touchEvent = function(e)
{
    if (e.type == "touchmove") {
        if (e.touches.length == 2) {
            e.preventDefault();

            var touch1 = e.touches[0];
            var touch2 = e.touches[1];
            
            var len = Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2);
            if (this.oldLen - len < 0) this.scaleModel(1.025); 
            else this.scaleModel(0.975); 
            
            this.oldLen = len;
        }
    }
}

DirectorLite.prototype.transformViewX = function(deviceX)
{
    var screenX = this.deviceToScreen.transformX(deviceX); 
    return this.viewMatrix.invertTransformX(screenX); 
}


DirectorLite.prototype.transformViewY = function(deviceY)
{
    var screenY = this.deviceToScreen.transformY(deviceY); 
    return this.viewMatrix.invertTransformY(screenY); 
}


DirectorLite.prototype.transformScreenX = function(deviceX)
{
    return this.deviceToScreen.transformX(deviceX);
}


DirectorLite.prototype.transformScreenY = function(deviceY)
{
    return this.deviceToScreen.transformY(deviceY);
}



DirectorLite.prototype.getWebGLContext = function()
{
    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    for( var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = this.canvas.getContext(NAMES[i], {premultipliedAlpha : true});
            if(ctx) return ctx;
        }
        catch(e){}
    }
    return null;
};

function DLToggleControls(e) {
    var ctl = e.target.parentNode;
    if (ctl.tagName == "BUTTON") {
        ctl = ctl.parentNode;
    }
    if (ctl.className === "dlexpanded") {
        ctl.className = "dlhidden";
    } else {
        ctl.className = "dlexpanded";
    }
}
