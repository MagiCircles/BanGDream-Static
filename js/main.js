// *****************************************
// Utils

function cuteformclearOne(cuteform) {
    cuteform.show();
    cuteform.next('.cuteform').remove();
}

// *****************************************
// Cards

// Card item
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

// Card list
function loadCardInList() {
    // Swap icons
    var swap = function() {
        var newSource = $(this).data('trained');
        $(this).data('trained', $(this).attr('src'));
        $(this).attr('src', newSource);
    }
    $('.card-solo').hover(swap, swap);

    // Show/hide gacha_type when origin = gacha
    function onOriginChange(animation) {
        if ($('#sidebar-wrapper #id_origin').val() == 'is_gacha') {
            $('#sidebar-wrapper #id_gacha_type').closest('.form-group').show(animation);
        } else {
            $('#sidebar-wrapper #id_gacha_type').closest('.form-group').hide(animation);
            $('#sidebar-wrapper #id_gacha_type').val('');
        }
    }
    if ($('#sidebar-wrapper #id_origin').length > 0 && $('#sidebar-wrapper #id_gacha_type').length > 0) {
        onOriginChange();
        $('#sidebar-wrapper #id_origin').change(function () { onOriginChange('slow') });
    }

    // Show/hide include_cameos when member_id is set
    function onMemberChange(animation) {
        if ($('#sidebar-wrapper #id_member_band').val().startsWith('member-')) {
            $('#sidebar-wrapper #id_member_includes_cameos').closest('.form-group').show(animation);
        } else {
            $('#sidebar-wrapper #id_member_includes_cameos').closest('.form-group').hide(animation);
            $('#sidebar-wrapper #id_member_includes_cameos').prop('checked', false);
        }
    }
    if ($('#sidebar-wrapper #id_member_band').length > 0 && $('#sidebar-wrapper #id_member_includes_cameos').length > 0) {
        onMemberChange();
        $('#sidebar-wrapper #id_member_band').change(function () { onMemberChange('slow') });
    }
}

// Card form
function loadCardForm() {
    var form = $('[data-form-name="edit_card"], [data-form-name="add_card"]');
    function showVariable(k, v) {
        form.find('#id_skill_' + v).closest('.form-group').show();
        form.find('#id_i_skill_' + v).closest('.form-group').show();
    }
    function onSkillChange() {
        if (!all_variables == 'undefined' || !special_cases_variables || !special_cases_template || !variables_per_skill_type || !template_per_skill_type) {
            return;
        }
        let selectedSkill = form.find('#id_i_skill_type').val();
        let selectedSideSkill = form.find('#id_i_side_skill_type').val();
        let selectedSpecial = form.find('#id_i_skill_special').val();
        // Hide all
        form.find('#id_i_side_skill_type').closest('.form-group').hide();
        form.find('#id_i_skill_type').closest('.form-group').find('.alert').hide();
        form.find('#id_i_side_skill_type').closest('.form-group').find('.alert').hide();
        form.find('#id_i_skill_special').closest('.form-group').hide();
        $.each(all_variables, function(k, v) {
            form.find('#id_skill_' + v).closest('.form-group').hide();
            form.find('#id_i_skill_' + v).closest('.form-group').hide();
        });
        // Show special case if exists
        if (special_cases_variables[selectedSkill]) {
            form.find('#id_i_skill_special').closest('.form-group').show();
        }
        // Main skill
        if (selectedSkill) {
            // Show side if main is selected
            form.find('#id_i_side_skill_type').closest('.form-group').show();
            // Show template + variables
            if (selectedSpecial != '' && special_cases_variables[selectedSkill]) {
                // Special case
                $.each(special_cases_variables[selectedSkill][selectedSpecial], showVariable);
                form.find('#id_i_skill_type').closest('.form-group').find('.alert').html(
                    special_cases_template[selectedSkill][selectedSpecial],
                );
            } else {
                // Normal case
                $.each(variables_per_skill_type['skill'][selectedSkill], showVariable);
                form.find('#id_i_skill_type').closest('.form-group').find('.alert').html(
                    template_per_skill_type['skill'][selectedSkill],
                );
            }
            form.find('#id_i_skill_type').closest('.form-group').find('.alert').show();
            // Side skill template + variable
            if (selectedSideSkill != '') {
                $.each(variables_per_skill_type['side_skill'][selectedSideSkill], showVariable);
                form.find('#id_i_side_skill_type').closest('.form-group').find('.alert').html(
                    template_per_skill_type['side_skill'][selectedSideSkill],
                );
                form.find('#id_i_side_skill_type').closest('.form-group').find('.alert').show();
            }
        }
    }
    cuteformclearOne(form.find('#id_i_skill_type'));
    // Add alert
    form.find('#id_i_skill_type').closest('.form-group').find('.alert').remove;
    form.find('#id_i_skill_type').after('<div class="alert alert-info" style="margin-top: 10px;"></div>');
    form.find('#id_i_side_skill_type').closest('.form-group').find('.alert').remove;
    form.find('#id_i_side_skill_type').after('<div class="alert alert-info" style="margin-top: 10px;"></div>');
    // Trigger on skill change
    onSkillChange();
    form.find('#id_i_skill_type').change(onSkillChange);
    form.find('#id_i_side_skill_type').change(onSkillChange);
    form.find('#id_i_skill_special').change(onSkillChange);
}

// Collectible card form
function loadCollecticleCardForm() {
    var trainedCheckbox = $('[data-form-name$="_collectiblecard"] #id_trained');
    var preferUntrainedCheckbox = $('[data-form-name$="_collectiblecard"] #id_prefer_untrained');
    var preferUntrainedField = preferUntrainedCheckbox.closest('.form-group');
    function showHidePreferUntrained() {
        if (trainedCheckbox.prop('checked') === true) {
            preferUntrainedField.show();
        } else {
            preferUntrainedCheckbox.prop('checked', false);
            preferUntrainedField.hide();
        }
    }
    showHidePreferUntrained();
    trainedCheckbox.change(showHidePreferUntrained);
}

// *****************************************
// Song

function loadSongItem() {
    let height = $('.song-info .song-title-section').height();
    if (height > 0) {
        $('.song-info .top-item .song-image').css('max-height', height);
    }
    loadAlliTunesData();
}

function onBandChange(form, animation) {
    form.find('#id_special_band').closest('.form-group').hide(animation);
    if (form.find('#id_i_band').val() == '6') {
        form.find('#id_special_band').closest('.form-group').show(animation);
    }
}

function loadSongForm() {
    let form = $('[data-form-name$="_song"]');
    onBandChange(form);
    form.find('#id_i_band').change(function () { onBandChange(form, 'slow'); });
}

// *****************************************
// Events / Gachas

function loadEventGachaInList() {
    // Show/hide status when version is set
    function onMemberChange(animation) {
        if ($('#sidebar-wrapper #id_version').val()) {
            $('#sidebar-wrapper #id_status').closest('.form-group').show(animation);
        } else {
            $('#sidebar-wrapper #id_status').closest('.form-group').hide(animation);
            $('#sidebar-wrapper #id_status').prop('checked', false);
        }
    }
    if ($('#sidebar-wrapper #id_version').length > 0 && $('#sidebar-wrapper #id_status').length > 0) {
        onMemberChange();
        $('#sidebar-wrapper #id_version').change(function () { onMemberChange('slow') });
    }
}

function loadEventGacha() {
    function showClose(caret, text, original_name) {
        caret.removeClass('glyphicon-triangle-bottom');
        caret.addClass('glyphicon-triangle-top');
        text.text(gettext('Close'));
    }
    function showOpen(caret, text, original_name) {
        caret.removeClass('glyphicon-triangle-top');
        caret.addClass('glyphicon-triangle-bottom');
        text.text(gettext('Open {thing}').replace('{thing}', original_name));
    }
    function toggleVersion(version, prefix, toggle, original_name, animation) {
        let caret = $('[data-field="' + prefix + 'image"] .glyphicon');
        let text = $('[data-field="' + prefix + 'image"] .text-open');
        let isOpen = ($('[data-field="' + prefix + 'countdown"]').length > 0
                      || $('[data-field="' + prefix + 'rerun"] .countdown').length > 0);
        if (toggle) {
            if (caret.hasClass('glyphicon-triangle-bottom')) {
                showClose(caret, text, original_name);
            } else {
                showOpen(caret, text, original_name);
            }
        } else {
            if (isOpen) {
                showClose(caret, text, original_name);
            } else {
                showOpen(caret, text, original_name);
            }
        }
        $.each(fields_per_version, function(_, field_name) {
            let field = $('[data-field="' + prefix + field_name + '"]');
            if (field_name != 'image') {
                field.find('td').first().css('border-left', '1px solid #ddd');
                field.find('td').last().css('border-right', '1px solid #ddd');
                if (toggle) {
                    field.toggle(animation);
                } else {
                    if (isOpen) {
                        field.show(animation);
                    } else {
                        field.hide(animation);
                    }
                }
            }
        });
    }
    if (typeof versions_prefixes != 'undefined' && typeof fields_per_version != 'undefined') {
        $.each(versions_prefixes, function(version, prefix) {
            let field = $('[data-field="' + prefix + 'image"]');
            let last_field = $('[data-field^="' + prefix + '"]').last();
            if (last_field.data('field') == prefix + 'image') {
                return ;
            }
            let original_name = field.find('th').last().text();
            field.find('th').last().html('<h3>' + original_name + '</h3>');
            field.find('th').last().append('<small class="text-muted"><span class="glyphicon glyphicon-triangle-bottom"></span> <span class="text-open"></span></small>');
            field.css('cursor', 'pointer');
            field.unbind('click');
            field.click(function(e) {
                e.preventDefault();
                toggleVersion(version, prefix, true, original_name, 'fast');
                return false;
            });
            toggleVersion(version, prefix, false, original_name);
        });
    }
}

// Show/hide status when version is set
function onVersionChange(animation) {
    if ($('#sidebar-wrapper #id_version').val()) {
        $('#sidebar-wrapper #id_status').closest('.form-group').show(animation);
    } else {
        $('#sidebar-wrapper #id_status').closest('.form-group').hide(animation);
        $('#sidebar-wrapper #id_status').prop('checked', false);
    }
}

function loadGachaInList() {
    if ($('#sidebar-wrapper #id_version').length > 0 && $('#sidebar-wrapper #id_status').length > 0) {
        onVersionChange();
        $('#sidebar-wrapper #id_version').change(function () { onVersionChange('slow') });
    }
}

function loadEventInList() {
    if ($('#sidebar-wrapper #id_version').length > 0 && $('#sidebar-wrapper #id_status').length > 0) {
        onVersionChange();
        $('#sidebar-wrapper #id_version').change(function () { onVersionChange('slow') });
    }
    //Show/hide stat boost filter
    function onTypeChange(animation) {
        if ($('#sidebar-wrapper #id_i_type').val() == '1' || $('#sidebar-wrapper #id_i_type').val() == '2') {
            $('#sidebar-wrapper #id_i_boost_stat').closest('.form-group').show(animation);
        } else {
            $('#sidebar-wrapper #id_i_boost_stat').closest('.form-group').hide(animation);
            $('#sidebar-wrapper #id_i_boost_stat').val('');
        }
    }
    if ($('#sidebar-wrapper #id_i_type').length > 0 && $('#sidebar-wrapper #id_i_boost_stat').length > 0) {
        onTypeChange();
        $('#sidebar-wrapper #id_i_type').change(function () { onTypeChange('slow') });
    }
}

function onEventTypeChange(form, animation) {
    if (form.find('#id_i_type').val() == '1' || form.find('#id_i_type').val() == '2') {
        form.find('#id_i_boost_stat').closest('.form-group').show(animation);
    } else{
        form.find('#id_i_boost_stat').closest('.form-group').hide(animation);
    }
}

function loadEventForm() {
    let form = $('[data-form-name$="_event"]');
    onEventTypeChange(form);
    form.find('#id_i_type').change(function () { onEventTypeChange(form, 'slow'); });
}

// *****************************************

function injectStyles(rule) {
  var div = $("<div />", {
    html: '&shy;<style>' + rule + '</style>'
  }).appendTo("body");
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function aprilFoolsGame() {
    let today = new Date();
    // Check it\'s april 1st
    if ((today.getMonth() + 1) == 4 && today.getDate() == 1) {

        let whiteCat = 'https://i.imgur.com/rNwhPvb.png';
        let blackCat = 'https://i.imgur.com/fQpzPKC.png';
        let conf = {
            'startImage': 'https://i.imgur.com/cVPYABX.png',
            'startText': '<div class="speech-bubble">Kanae? Who\'s  that? We don\'t know who you\'re talking about 😈<br><br><p>We are</p><img src="https://i.imgur.com/tO7ih1A.png" alt="RAISE A SUILEN" class="img-responsive" /><p> and we\'re taking over this community today.</p></div><br><quote class="fontx1-5">Looks like Kanae is in trouble 😰<br><br>If you want to save Bandori Party, you\'ll have  to find all the <img src="https://i.imgur.com/fQpzPKC.png" alt="cat headphones" /> of RAISE A SUILEN hidden around the website.<br><br>If you manage to finish before the end of April 1st, you\'ll earn a badge! 🏅</quote>',
            'startButton': 'Find all the <img src="https://i.imgur.com/rNwhPvb.png" alt="cat headphones" />',
            'takeOverDivs': function() {
                $('.home-site-logo img').prop('src', 'https://i.imgur.com/ro41zfs.png');
                let ras = 'https://i.imgur.com/u3MjoNt.png';
                $('.home-wrapper.with-background').css('background-image', 'url(\'' + ras + '\')')
                $('.site-name').text('RAISE A SUILEN Party');
            },
            'hiddenAfterDivs': [
                ['.home-site-donate-message .btn', blackCat],
                ['[data-cuteform-val="tr"]', blackCat],
                ['[for="id_c_tags_23"]', whiteCat],
                ['#sidebar-wrapper .sticky-buttons .btn .flaticon-search', whiteCat],
                ['[data-item="asset"][data-item-id="1130"] h3', blackCat],
                ['body.current-gallery figure', blackCat],
                ['[data-item="gacha"] div', blackCat],
                ['[data-item="event"] div', blackCat],
                ['[data-item="song"] div', blackCat],
                ['[data-item="item"] div', blackCat],
                ['[data-item="areaitem"] div', blackCat],
                ['[data-item="account"] div', blackCat],
                ['[data-item="area"] h5', whiteCat],
                ['[for="id_i_attribute"]', whiteCat],
                ['[for="id_gacha_type"]', whiteCat],
                ['.card-wrapper', blackCat],
                ['.col-xs-2[data-item="card"] .icon-card', blackCat],
                ['[data-item="card"] .panel-content', blackCat],
                ['#alternative-donations a', blackCat],
                ['[data-item="donate"] .donate-month', blackCat],
                ['body.current-notification_list h1', blackCat],
                ['[for="id_i_message"]', whiteCat],
                ['.current-about .text-Power', blackCat],
                ['.current-about .padding50 [href="https://facebook.com/BandoriParty/"]', blackCat],
                ['.current-about #icons', blackCat],
                ['.current-about #developers', blackCat],
                ['.area_see_all', whiteCat],
                ['.current-about #contributors', blackCat],
                ['.follow-buttons', whiteCat],
                ['.text-right.badges a', whiteCat],
                ['.staff-status', whiteCat],
                ['.current-privatemessage_list h1', blackCat],
                ['[name="d_hidden_tags-cosplay"]', blackCat],
                ['#donationLink .flaticon-promo', blackCat],
                ['.glyphicon.glyphicon-chevron-up', blackCat],
                ['#wiki-title', blackCat],
                ['#wiki-content', blackCat],
                ['#wiki-sidebar', whiteCat],
                ['.navbar-brand', whiteCat],
                ['[for="id_status"]', whiteCat],
                ['[for="id_i_boost_stat"]', whiteCat],
                ['[data-link-name="more"] .dropdown-header', blackCat],
            ],
            'toFind': '<img src="' + blackCat + '" alt="cat hearphones" />',
            'endText': '<div class="speech-bubble end" style="background-color: #E40046;">Thank you so much!<br>You saved me!</div><br><div class="fontx1-5">You gave all the <img src="' + blackCat +'" alt="cat hearphones"> you collected to RAISE A SUILEN, so they freed Kanae 🎉<br><br><div class="alert alert-warning">Don\'t know who Kanae is?<br><a href="/about/">→ Read more about her!</a></div><div class="afterbadge" style="display: none;">To thank you for your help, Kanae just gave you a badge!<br><br><div class="text-center"><a href="/me/?open=badge" class="btn btn-main btn-xl">Check it out <i class="flaticon-link fontx0-5"></i></a></div></div></div>',
            'endImage': 'https://i.bandori.party/static/img/chibi_kanae.png',
        };

        let css = '.speech-bubble {\
	position: relative;\
	background: #942192;\
	border-radius: .4em;\
    color: white;\
    padding: 10px;\
    text-align: center;\
    font-size: 1.5em;\
}\
\
.speech-bubble:after {\
	content: \'\';\
	position: absolute;\
	right: 0;\
	top: 50%;\
	width: 0;\
	height: 0;\
	border: 47px solid transparent;\
	border-left-color: #942192;\
	border-right: 0;\
	border-bottom: 0;\
	margin-top: -23.5px;\
	margin-right: -47px;\
}\
.speech-bubble.end {\
    background: #E40046;\
    padding: 30px 10px;\
}\
.speech-bubble.end:after {\
    border-left-color: #E40046;\
}\
.aprilFoolsPopup {\
    position: fixed;\
    z-index: 3000;\
    bottom: 20px;\
    left: 20px;\
    max-width: 100%;\
    background-color: rgba(255, 255, 255, 0.95);\
    border-radius: 10px;\
    padding: 20px 30px;\
    border: 2px solid white;\
    box-shadow: 0px 0px 30px 2px rgba(0, 0, 0, 0.2);\
}\
';
        injectStyles(css);

        let gameDismissed = localStorage['aprilFoolDismissed' + today.getYear()] || false;
        let gameEnded = localStorage['aprilFoolEnded' + today.getYear()] || false;
        if (gameDismissed || gameEnded) {
            return;
        }
        conf.takeOverDivs();

        function gameStartedPop() {
            let totalFound = 0;
            $.each(conf.hiddenAfterDivs, function(i, d) {
                let wasFound = localStorage['aprilFoolFound' + today.getYear() + '' + i] || false;
                if (wasFound) {
                    totalFound += 1;
                } else {
                    let toClick = $('<a href="#" class="padding10"><img src="' + d[1] + '" alt="to find" /></a>');
                    toClick.click(function(e) {
                        e.preventDefault();
                        toClick.remove();
                        localStorage['aprilFoolFound' + today.getYear() + '' + i] = true;
                        totalFound += 1;
                        $('.aprilFoolsPopup .found').text(totalFound);
                        if (totalFound == totalToFind) {
                            // End of game!
                            localStorage['aprilFoolEnded' + today.getYear()] = true;
                            $.ajax({
                                url: '/ajax/endaprilfool/',
                                success: function(data) {
                                    if (data.already_got) {
                                        $('#freeModal .afterbadge').show();
                                        $('#freeModal .afterbadge').after(
                                            '<br><p class="alert alert-info fontx0-8">\
Congratulations, you\'re the <b>' + ordinal_suffix_of(data['already_got'] + 1)
                                                + '</b> player who completed this challenge!</p>');
                                    }
                                },
                            });
                            let modalEndContent = $('\
<div class="row">\
<div class="col-md-6 col-xs-8">\
<p class="endText">' + conf.endText + '</p>\
</div>\
<div class="col-md-6 col-xs-4">\
<img src="' + conf.endImage + '" alt="April fools" class="img-responsive" />\
</div>\
</div>\
');
                            freeModal('April fools!', modalEndContent, 0, 'lg');
                            $('#freeModal').on('hidden.bs.modal', function() {
                                location.reload();
                            });
                        }
                        return false;
                    });
                    $(d[0]).first().after(toClick);
                }
            });
            let totalToFind = conf.hiddenAfterDivs.length;
            let popup = $('<div class="aprilFoolsPopup">\
You found <span class="found">' + totalFound + '</span> / <span>' + totalToFind + '</span> ' + conf.toFind + '\
</div>');
            $('body').append(popup);
        }

        let gameStarted = localStorage['aprilFoolStarted' + today.getYear()] || false;
        if (gameStarted) {
            gameStartedPop();
        } else {
            let buttons = '<div class="text-center">\
<a href="#play" class="btn btn-main btn-xl">' + conf.startButton + '</a><br>\
<a href="#dismiss" class="btn btn-link-muted">Not interested</a></div>';
            let modalContent = $('\
<div class="row">\
<div class="col-md-6 col-xs-8">\
<p>' + conf.startText + '<br><br><br>' + buttons + '</p>\
</div>\
<div class="col-md-6 col-xs-4">\
<img src="' + conf.startImage + '" alt="April fools" class="img-responsive" />\
</div>\
</div>\
');
            modalContent.find('[href="#dismiss"]').click(function(e) {
                e.preventDefault();
                localStorage['aprilFoolDismissed' + today.getYear()] = true;
                location.reload();
                return false;
            });
            modalContent.find('[href="#play"]').click(function(e) {
                e.preventDefault();
                localStorage['aprilFoolStarted' + today.getYear()] = true;
                gameStarted = true;
                gameStartedPop();
                $('#freeModal').modal('hide');
                return false;
            });
            freeModal('April fools!', modalContent, 0, 'lg');
        }
    }
}

// *****************************************
// Loaded in all pages

function displayBandMemberFilter() {
    $('#cuteform-modal').on('show.bs.modal', function() {
        $('#cuteform-modal [data-cuteform-val^="member-"]').last().after('<br style="display: block;"><br style="display: block;">');
        $('#cuteform-modal [data-cuteform-val^="band-"]').eq(2).after('<br style="display: block;">');
    });
}

$(document).ready(function() {
    displayBandMemberFilter();
    aprilFoolsGame();
});
