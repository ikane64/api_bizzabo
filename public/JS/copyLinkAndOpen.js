function copyLinkAndOpen(event) {

    event.preventDefault();

    const textarea = document.getElementById('magicLink');
    const link = textarea.value;

    if (link) {
        window.open(link, '_blank');
    }
}