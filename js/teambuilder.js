$(document).ready(function() {
    // Show/hide stamina / perfect accuracy when selected skill type is score up
    function onSkillTypeChange(animation) {
        if ($('#id_i_skill_type').val() == '1') {
            $('#id_perfect_accuracy').closest('.form-group').show(animation);
            $('#id_stamina_accuracy').closest('.form-group').show(animation);
        } else {
            $('#id_perfect_accuracy').closest('.form-group').hide(animation);
            $('#id_stamina_accuracy').closest('.form-group').hide(animation);
        }
    }
    if ($('#id_i_skill_type').length > 0) {
        onSkillTypeChange();
        $('#id_i_skill_type').change(function () { onSkillTypeChange('slow') });
    }
});
