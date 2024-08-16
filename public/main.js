document.addEventListener("DOMContentLoaded", function() {
    if (typeof gapi !== 'undefined') {
        gapi.load('client', initClient);
    } ealse {
        console.error('Google API not loaded');
    }
    fetch('/test')
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-content').innerHTML = data;
        })
        .catch(error => console.error('Error loading dynamic content:', error));

    // 세션 유지
    fetch('/get-user', { credentials: 'include' })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("userEmail").innerText = data.email || "로그인 정보 미확인";
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        document.getElementById("userEmail").innerText = "로그인 정보 미확인";
    });
    
    document.getElementById('runCodeBtn').addEventListener('click', function() {
        const code = document.getElementById('ide').value;

        fetch('/run-python', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('output').innerText = `Error: ${data.error}`;
            } else {
                document.getElementById('output').innerText = data.output;
            }
        })
        .catch(error => console.error('Error:', error));
    });
});

function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyAZqp7wFA6uQtlyalJMayyNffqhj1rVgLk',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        loadMenuData();
    }).catch(error => console.error('Error initializing Google API client', error));
}

function loadMenuData() {
    const spreadsheetId = '1yEb5m_fjw3msbBYLFtO55ukUI0C0XkJfLurWWyfALok';
    const range = 'A2:C';

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    }).then((response) => {
        console.log('Response from Google Sheets:', response);
        const data = response.result.values;
        if (data) {
            const navList = document.getElementById('navList');
            const contentView = document.getElementById('iframeContent');

            const topLevelMenus = new Map();
            data.forEach(function(row) {
                const topLevelMenu = row[0];
                const subMenu = row[1];
                const url = row[2];

                if (!topLevelMenus.has(topLevelMenu)) {
                    topLevelMenus.set(topLevelMenu, []);
                }

                topLevelMenus.get(topLevelMenu).push({ subMenu, url });
            });

            topLevelMenus.forEach(function(subMenus, topLevelMenu) {
                const topLevelMenuItem = document.createElement('li');
                topLevelMenuItem.textContent = topLevelMenu;
                topLevelMenuItem.classList.add('menu-item');
                topLevelMenuItem.classList.add('has-sub-menu');

                const arrow = document.createElement('span');
                arrow.classList.add('arrow', 'arrow-down');
                topLevelMenuItem.appendChild(arrow);

                topLevelMenuItem.addEventListener('click', function() {
                    toggleSubMenu(topLevelMenuItem);
                });

                const subMenuItems = document.createElement('ul');
                subMenuItems.className = 'sub-menu';
                topLevelMenuItem.appendChild(subMenuItems);

                subMenus.forEach(function(subMenuData) {
                    const subMenuItem = document.createElement('li');
                    subMenuItem.classList.add('menu-item');

                    const icon = document.createElement('i');
                    icon.classList.add('bi', 'bi-file-text');
                    subMenuItem.appendChild(icon);

                    const text = document.createElement('span');
                    text.textContent = subMenuData.subMenu;
                    subMenuItem.appendChild(text);

                    subMenuItem.addEventListener('click', function(event) {
                        event.stopPropagation();
                        showPageContent(subMenuData.url, contentView);
                        applySubMenuHighlight(subMenuItem);
                    });

                    subMenuItems.appendChild(subMenuItem);
                });

                navList.appendChild(topLevelMenuItem);
            });
        }
    }).catch(error => {
        console.error('Error loading menu data:', error);
    });
}

function toggleSubMenu(topLevelMenuItem) {
    const subMenu = topLevelMenuItem.querySelector('.sub-menu');
    const arrow = topLevelMenuItem.querySelector('.arrow');

    const allSubMenuItems = document.querySelectorAll('.sub-menu');
    const allArrows = document.querySelectorAll('.arrow');

    allSubMenuItems.forEach(function(item) {
        if (item !== subMenu) {
            item.style.maxHeight = '0px';
            item.style.display = 'none';
        }
    });

    allArrows.forEach(function(item) {
        if (item !== arrow) {
            toggleArrow(item, false);
        }
    });

    if (subMenu.style.maxHeight === '0px' || !subMenu.style.maxHeight) {
        subMenu.style.maxHeight = '1000px';
        subMenu.style.display = 'block';
        toggleArrow(arrow, true);
    } else {
        subMenu.style.maxHeight = '0px';
        subMenu.style.display = 'none';
        toggleArrow(arrow, false);
    }
}

function toggleArrow(arrow, isOpen) {
    if (isOpen) {
        arrow.className = 'arrow arrow-up';
    } else {
        arrow.className = 'arrow arrow-down';
    }
}

function showPageContent(url, contentView) {
    contentView.src = url;
}

function applySubMenuHighlight(selectedSubMenu) {
    const allSubMenus = document.querySelectorAll('.sub-menu li');
    allSubMenus.forEach(function(item) {
        item.classList.remove('selected-item');
    });

    selectedSubMenu.classList.add('selected-item');
}
