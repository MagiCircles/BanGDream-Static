// *****************************************
// Utils

function cuteformclearOne(cuteform) {
    cuteform.show();
    cuteform.next('.cuteform').remove();
}

// *****************************************
// Index

function loadIndex() {
    let home = $('.home-wrapper[data-hd-art]');
    if (home.length > 0 && $(document).width() > 992) {
        home.css('background-image', 'url(\'' + home.data('hd-art') + '\')');
    }
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

    // Show/hide limited when origin = gacha
    function onOriginChange(animation) {
        if ($('#sidebar-wrapper #id_origin').val() == 'is_gacha') {
            $('#sidebar-wrapper #id_is_limited').closest('.form-group').show(animation);
        } else {
            $('#sidebar-wrapper #id_is_limited').closest('.form-group').hide(animation);
            $('#sidebar-wrapper #id_is_limited').val('1');
        }
    }
    if ($('#sidebar-wrapper #id_origin').length > 0 && $('#sidebar-wrapper #id_is_limited').length > 0) {
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

function loadEventGacha() {
    function toggleVersion(version, prefix, toggle, animation) {
        let caret = $('[data-field="' + prefix + 'image"] .glyphicon');
        let isOpen = ($('[data-field="' + prefix + 'countdown"]').length > 0
                      || $('[data-field="' + prefix + 'rerun"] .countdown').length > 0);
        if (toggle) {
            if (caret.hasClass('glyphicon-triangle-bottom')) {
                caret.removeClass('glyphicon-triangle-bottom');
                caret.addClass('glyphicon-triangle-top');
            } else {
                caret.removeClass('glyphicon-triangle-top');
                caret.addClass('glyphicon-triangle-bottom');
            }
        } else {
            if (isOpen) {
                caret.removeClass('glyphicon-triangle-bottom');
                caret.addClass('glyphicon-triangle-top');
            } else {
                caret.removeClass('glyphicon-triangle-top');
                caret.addClass('glyphicon-triangle-bottom');
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
            field.find('th').first().append('&nbsp;&nbsp;<span class="glyphicon glyphicon-triangle-bottom"></span>');
            field.css('cursor', 'pointer');
            field.unbind('click');
            field.click(function(e) {
                e.preventDefault();
                toggleVersion(version, prefix, true, 'fast');
                return false;
            });
            toggleVersion(version, prefix, false);
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
// Loaded in all pages

function displayBandMemberFilter() {
    $('#cuteform-modal').on('show.bs.modal', function() {
        $('#cuteform-modal [data-cuteform-val^="member-"').last().after('<br style="display: block;"><br style="display: block;">');
        $('#cuteform-modal [data-cuteform-val^="band-"').eq(2).after('<br style="display: block;">');
    });
}

$(document).ready(function() {
    displayBandMemberFilter();
});
