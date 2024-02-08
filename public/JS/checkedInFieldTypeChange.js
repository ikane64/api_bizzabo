const updateFieldValue = () => {
    const regField = document.getElementById('regField').value;
    const fieldValueWrapper = document.getElementById('fieldValueWrapper');

    if (regField === 'checkedIn') {
        fieldValueWrapper.innerHTML = `
            <label for="fieldValue" class="form-label"><b>New value:</b></label>
            <select required class="form-select" id="fieldValue" name="fieldValue">
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        `;
    } else {
        fieldValueWrapper.innerHTML = `
            <label for="fieldValue" class="form-label"><b>New value:</b></label>
            <input required type="text" class="form-control" id="fieldValue" name="fieldValue">
        `;
    }
};

// Trigger updateFieldValue on page load and pageshow
document.addEventListener('DOMContentLoaded', updateFieldValue);
window.addEventListener('pageshow', updateFieldValue);

// Listen for change event on regField
document.getElementById('regField').addEventListener('change', updateFieldValue);