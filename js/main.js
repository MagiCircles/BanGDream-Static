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
    var swap = function() {
        var newSource = $(this).data('trained');
        $(this).data('trained', $(this).attr('src'));
        $(this).attr('src', newSource);
    }
    $('.card-solo').hover(swap, swap);
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

// *****************************************
// Events / Gachas

function loadEventGacha() {
    function toggleVersion(version, prefix, toggle, animation) {
        let caret = $('[data-field="' + prefix + 'image"] .glyphicon');
        let isOpen = $('[data-field="' + prefix + 'countdown"]').length > 0;
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
