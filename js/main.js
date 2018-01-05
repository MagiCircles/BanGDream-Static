function loadComingSoon(tab_name, user_id, account_id, onDone) {
    onDone('<div class="alert alert-info text-center"><i class="flaticon-idolized"></i> ' + gettext('Coming soon') + ' <i class="flaticon-idolized"></i></div>');
}


function loadCard() {
    $('[data-open-tab]').each(function() {
	$(this).unbind('click');
	$(this).click(function(e) {
	    $('[data-tabs="' + $(this).closest('.btn-group').data('control-tabs') + '"] .tab-pane').removeClass('active');
	    $('[data-tab="' + $(this).data('open-tab') + '"]').addClass('active');
	    $(this).blur();
	});
    });
}

function loadCardInList() {
    var swap = function() {
        var newSource = $(this).data('trained');
        $(this).data('trained', $(this).attr('src'));
        $(this).attr('src', newSource);
    }
    $('.card-solo').hover(swap, swap);
    directAddCollectible($('.icon-card + .below-item-buttons [data-btn-name="collectiblecard"]'));
}

function loadSongItem() {
    let height = $('.song-info .song-title-section').height();
    if (height > 0) {
        $('.song-info .top-item .song-image').css('max-height', height);
    }
    loadAlliTunesData();
}
