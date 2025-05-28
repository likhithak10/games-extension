const typeButton = document.getElementById('type-button');

if (typeButton) {
    typeButton.onclick = function() {
        chrome.runtime.sendMessage({event:"onClickType"});
    }
}
