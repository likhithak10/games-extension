chrome.runtime.onMessage.addListener(data =>{
    switch (data.event){
        case 'onClickType':
            chrome.windows.create({
                url: 'popup/typing-test.html',
                type: 'popup',
                width: 550,
                height: 500,
                left: 100,
                top: 100
            });
            break;
    }
})