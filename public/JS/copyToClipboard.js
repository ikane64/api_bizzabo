function copyToClipboard(event) {

  event.preventDefault();

  var copyText = document.getElementById("magicLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);

}