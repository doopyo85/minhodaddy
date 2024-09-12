// 전역 변수 선언을 파일 맨 위로 이동하고 모두 var로 변경
var currentProblemNumber = 1;
var totalProblems = 10;
var currentExamName = '';
var problemData = [];
document.addEventListener("DOMContentLoaded", function() {
    if (!window.menuLoaded) {
        const googleApiKey = document.getElementById('googleApiKey').value;
        const spreadsheetId = document.getElementById('spreadsheetId').value;

        if (googleApiKey && spreadsheetId) {
            if (typeof gapi !== 'undefined') {
                gapi.load('client', initClient);
            } else {
                console.error('Google API not loaded');
            }
        } else {
            console.error('Required elements not found');
        }

        window.menuLoaded = true;  // 메뉴가 로드된 상태로 표시
    }
});


function initClient() {
    const apiKey = document.getElementById('googleApiKey').value;
    const spreadsheetId = document.getElementById('spreadsheetId').value;
    
    if (!apiKey || !spreadsheetId) {
        console.error('API Key or Spreadsheet ID is missing');
        return;
    }

    gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        return Promise.all([
            loadMenuData(spreadsheetId),
            loadProblemData(spreadsheetId)
        ]);
    }).then(([menuData, problemData]) => {
        renderMenu(menuData);
        if (problemData && problemData.length > 0) {
            onMenuSelect(problemData[0][1]); // Assuming the exam name is in the second column
        }
    }).catch(error => console.error('Error initializing Google API client', error));
}


function setupEventListeners() {
    const runCodeBtn = document.getElementById('runCodeBtn');
    const prevButton = document.getElementById('prev-problem');
    const nextButton = document.getElementById('next-problem');

    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', runCode);
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentProblemNumber > 1) {
                navigateToProblem(currentProblemNumber - 1);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentProblemNumber < totalProblems) {
                navigateToProblem(currentProblemNumber + 1);
            }
        });
    }

    fetchUserData();
}

function fetchUserData() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        fetch('/get-user', { credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                userNameElement.innerText = data.username || "로그인 정보 미확인";
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                userNameElement.innerText = "로그인 정보 미확인";
            });
    }
}

function runCode() {
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
        const outputElement = document.getElementById('output');
        if (outputElement) {
            outputElement.innerText = data.error ? `Error: ${data.error}` : data.output;
        }
    })
    .catch(error => console.error('Error:', error));
}


  
function loadMenuData(spreadsheetId) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'menulist!A2:C',
    }).then((response) => {
        const data = response.result.values;
        if (data) {
            renderMenu(data); // 이 부분이 두 번 호출되지 않는지 확인
        }
    }).catch(error => {
        console.error('Error loading menu data:', error);
    });    
}

function loadProblemData(spreadsheetId) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: '문항정보!A:C',
    }).then((response) => {
        problemData = response.result.values;
        console.log('Problem data loaded:', problemData);
        
        if (problemData && problemData.length > 0) {
            if (problemData[0][0] === 'URL') {
                problemData.shift();
            }
            return problemData;
        } else {
            throw new Error('No problem data loaded');
        }
    });
}

function renderMenu(data) {
    const navList = document.getElementById('navList');
    if (!navList) {
        console.error('Navigation list element not found');
        return;
    }

    navList.innerHTML = ''; // Clear existing menu items

    const topLevelMenus = new Map();
    data.forEach(function(row) {
        const [topLevelMenu, subMenu, examName] = row;
        if (!topLevelMenus.has(topLevelMenu)) {
            topLevelMenus.set(topLevelMenu, []);
        }
        topLevelMenus.get(topLevelMenu).push({ subMenu, examName });
    });

    let index = 0;
    topLevelMenus.forEach(function(subMenus, topLevelMenu) {
        const topLevelMenuItem = createTopLevelMenuItem(topLevelMenu, index);
        const subMenuItems = createSubMenuItems(subMenus, index);
        navList.appendChild(topLevelMenuItem);
        navList.appendChild(subMenuItems);
        index++;
    });

    if (data.length > 0) {
        onMenuSelect(data[0][2]);
    }
}

// Bootstrap 아이콘으로 변경
function createTopLevelMenuItem(topLevelMenu) {
    const topLevelMenuItem = document.createElement('li');
    topLevelMenuItem.textContent = topLevelMenu;
    topLevelMenuItem.classList.add('menu-item', 'has-sub-menu');

    const arrow = document.createElement('i');  // span 대신 i 태그로 변경
    arrow.classList.add('bi', 'bi-chevron-down');  // Bootstrap 아이콘 추가
    topLevelMenuItem.appendChild(arrow);

    topLevelMenuItem.addEventListener('click', () => toggleSubMenu(topLevelMenuItem));

    return topLevelMenuItem;
}

function createSubMenuItems(subMenus) {
    const subMenuItems = document.createElement('ul');
    subMenuItems.className = 'sub-menu';

    subMenus.forEach(function({ subMenu, examName }) {
        const subMenuItem = document.createElement('li');
        subMenuItem.classList.add('menu-item');

        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-file-text');  // 서브메뉴에 Bootstrap 아이콘 추가
        subMenuItem.appendChild(icon);

        const text = document.createElement('span');
        text.textContent = ' ' + subMenu; // 아이콘과 텍스트 사이에 공백 추가
        subMenuItem.appendChild(text);

        subMenuItem.addEventListener('click', function(event) {
            event.stopPropagation();
            onMenuSelect(examName);
            applySubMenuHighlight(subMenuItem);
        });

        subMenuItems.appendChild(subMenuItem);
    });

    return subMenuItems;
}

// 메뉴 펼치기/접기 기능
function toggleSubMenu(topLevelMenuItem) {
    const subMenu = topLevelMenuItem.querySelector('.sub-menu');
    if (subMenu.classList.contains('show')) {
        subMenu.classList.remove('show');
        topLevelMenuItem.querySelector('i').classList.replace('bi-chevron-up', 'bi-chevron-down'); // 아이콘을 아래로
    } else {
        subMenu.classList.add('show');
        topLevelMenuItem.querySelector('i').classList.replace('bi-chevron-down', 'bi-chevron-up'); // 아이콘을 위로
    }
}



// 아이콘을 변경하는 함수
function toggleArrow(arrow, isOpen) {
    if (isOpen) {
        arrow.classList.remove('bi-chevron-down');
        arrow.classList.add('bi-chevron-up');
    } else {
        arrow.classList.remove('bi-chevron-up');
        arrow.classList.add('bi-chevron-down');
    }
}

function applySubMenuHighlight(selectedItem) {
    document.querySelectorAll('.sub-menu .menu-item').forEach(item => item.classList.remove('active'));
    selectedItem.classList.add('active');
}

function onMenuSelect(examName) {
    currentExamName = examName;
    currentProblemNumber = 1;
    console.log('Selected exam:', currentExamName);
    
    if (problemData && problemData.length > 0) {
        loadProblem(currentProblemNumber);
        renderProblemNavigation();
    } else {
        console.error('Problem data not loaded yet. Cannot load problem.');
    }
}
function renderProblemNavigation() {
    const navContainer = document.getElementById('problem-navigation');
    if (!navContainer) return;

    navContainer.innerHTML = '';

    for (let i = 1; i <= totalProblems; i++) {
        const problemBtn = document.createElement('i');
        problemBtn.classList.add('bi', 'problem-icon');
        
        if (i === currentProblemNumber) {
            problemBtn.classList.add(i === 10 ? 'bi-0-circle-fill' : `bi-${i}-circle-fill`);
        } else {
            problemBtn.classList.add(i === 10 ? 'bi-0-circle' : `bi-${i}-circle`);
        }
        
        problemBtn.addEventListener('click', function() {
            navigateToProblem(i);
        });

        navContainer.appendChild(problemBtn);
    }

    updateNavigationButtons();
}

function navigateToProblem(problemNumber) {
    currentProblemNumber = problemNumber;
    updateProblemNavigation();
    loadProblem(currentProblemNumber);
}

function updateProblemNavigation() {
    const icons = document.querySelectorAll('#problem-navigation .problem-icon');
    
    icons.forEach((icon, index) => {
        const problemNumber = index + 1;
        icon.className = `bi problem-icon ${problemNumber === currentProblemNumber ? `bi-${problemNumber === 10 ? 0 : problemNumber}-circle-fill` : `bi-${problemNumber === 10 ? 0 : problemNumber}-circle`}`;
    });
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-problem');
    const nextButton = document.getElementById('next-problem');

    if (prevButton) prevButton.style.visibility = currentProblemNumber > 1 ? 'visible' : 'hidden';
    if (nextButton) nextButton.style.visibility = currentProblemNumber < totalProblems ? 'visible' : 'hidden';
}

function resizeIframe(iframe) {
    if (!iframe) return;

    const container = document.getElementById('problem-container');
    if (!container) return;

    const containerHeight = container.clientHeight;
    iframe.style.height = containerHeight + 'px';

    // cross-origin 접근 시도 제거
    iframe.onload = function() {
        iframe.style.height = containerHeight + 'px';
    };
}


function loadProblem(problemNumber) {
    console.log('Loading problem:', currentExamName, problemNumber);
    console.log('Problem data:', problemData);
    
    if (!problemData || problemData.length === 0) {
        console.error('Problem data is not loaded yet');
        return;
    }

    const problemInfo = problemData.find(problem => 
        problem[1].toLowerCase() === currentExamName.toLowerCase() && 
        problem[2].toLowerCase() === `p${problemNumber.toString().padStart(2, '0')}`
    );

    if (problemInfo) {
        const [problemFileName, , ] = problemInfo;
        const problemUrl = `https://educodingnplaycontents.s3.amazonaws.com/${problemFileName}`;
        console.log('Problem URL:', problemUrl);

        const iframe = document.getElementById('iframeContent');
        if (iframe) {
            iframe.src = problemUrl;
            iframe.onload = function() {
                resizeIframe(iframe);
            };
            console.log('iframe src set to:', problemUrl);
        } else {
            console.error('iframe element not found');
        }

        const problemTitle = `${currentExamName} - 문제 ${problemNumber}`;
        const problemTitleElement = document.getElementById('problem-title');
        if (problemTitleElement) {
            problemTitleElement.textContent = problemTitle;
        } else {
            console.error('problem-title element not found');
        }
    } else {
        console.error('문제 정보를 찾을 수 없습니다:', currentExamName, problemNumber);
        console.log('Available problems:', problemData.map(p => `${p[1]} ${p[2]}`));
    }
}

// 창 크기가 변경될 때마다 iframe 크기를 조정합니다
window.addEventListener('resize', function() {
    const iframe = document.getElementById('iframeContent');
    if (iframe) {
        resizeIframe(iframe);
    }
});

// Ensure content and IDE are loaded and displayed side by side
window.addEventListener('load', function() {
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
        contentContainer.style.display = 'flex'; // Set the display as flex for horizontal layout
    }
});