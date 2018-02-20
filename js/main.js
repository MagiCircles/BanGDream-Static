
function loadProfileComingSoon(tab_name, user_id, onDone) {
    onDone('<div class="padding20"><div class="alert alert-info text-center"><i class="flaticon-idolized"></i> ' + gettext('Coming soon') + ' <i class="flaticon-idolized"></i></div></div>');
}

function loadAccountComingSoon(tab_name, user_id, account_id, onDone) {
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
}

function loadSongItem() {
    let height = $('.song-info .song-title-section').height();
    if (height > 0) {
        $('.song-info .top-item .song-image').css('max-height', height);
    }
    loadAlliTunesData();
}

function cuteformclearOne(cuteform) {
    $('#' + cuteform).show();
    $('#' + cuteform + ' + .cuteform').remove();
}

function loadCardForm() {
    function showVariable(k, v) {
        $('#id_skill_' + v).closest('.form-group').show();
        $('#id_i_skill_' + v).closest('.form-group').show();
    }
    function onSkillChange() {
        let selectedSkill = $('#id_i_skill_type').val();
        let selectedSideSkill = $('#id_i_side_skill_type').val();
        let selectedSpecial = $('#id_i_skill_special').val();
        // Hide all
        $('#id_i_side_skill_type').closest('.form-group').hide();
        $('#id_i_skill_type').closest('.form-group').find('.alert').hide();
        $('#id_i_side_skill_type').closest('.form-group').find('.alert').hide();
        $('#id_i_skill_special').closest('.form-group').hide();
        $.each(all_variables, function(k, v) {
            $('#id_skill_' + v).closest('.form-group').hide();
            $('#id_i_skill_' + v).closest('.form-group').hide();
        });
        // Show special case if exists
        if (special_cases_variables[selectedSkill]) {
            $('#id_i_skill_special').closest('.form-group').show();
        }
        // Main skill
        if (selectedSkill != '') {
            // Show side if main is selected
            $('#id_i_side_skill_type').closest('.form-group').show();
            // Show template + variables
            if (selectedSpecial != '' && special_cases_variables[selectedSkill]) {
                // Special case
                $.each(special_cases_variables[selectedSkill][selectedSpecial], showVariable);
                $('#id_i_skill_type').closest('.form-group').find('.alert').html(
                    special_cases_template[selectedSkill][selectedSpecial],
                );
            } else {
                // Normal case
                $.each(variables_per_skill_type['skill'][selectedSkill], showVariable);
                $('#id_i_skill_type').closest('.form-group').find('.alert').html(
                    template_per_skill_type['skill'][selectedSkill],
                );
            }
            $('#id_i_skill_type').closest('.form-group').find('.alert').show();
            // Side skill template + variable
            if (selectedSideSkill != '') {
                $.each(variables_per_skill_type['side_skill'][selectedSideSkill], showVariable);
                $('#id_i_side_skill_type').closest('.form-group').find('.alert').html(
                    template_per_skill_type['side_skill'][selectedSideSkill],
                );
                $('#id_i_side_skill_type').closest('.form-group').find('.alert').show();
            }
        }
    }
    cuteformclearOne('id_i_skill_type');
    // Add alert
    $('#id_i_skill_type').closest('.form-group').find('.alert').remove;
    $('#id_i_skill_type').after('<div class="alert alert-info" style="margin-top: 10px;"></div>');
    $('#id_i_side_skill_type').closest('.form-group').find('.alert').remove;
    $('#id_i_side_skill_type').after('<div class="alert alert-info" style="margin-top: 10px;"></div>');
    // Trigger on skill change
    onSkillChange();
    $('#id_i_skill_type').change(onSkillChange);
    $('#id_i_side_skill_type').change(onSkillChange);
    $('#id_i_skill_special').change(onSkillChange);
}
