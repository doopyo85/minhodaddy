/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/test.js":
/*!************************!*\
  !*** ./public/test.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_simple_code_editor_CodeEditor_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/simple-code-editor/CodeEditor.vue */ \"./node_modules/simple-code-editor/CodeEditor.vue\");\n/* harmony import */ var _node_modules_simple_code_editor_CodeEditor_vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_simple_code_editor_CodeEditor_vue__WEBPACK_IMPORTED_MODULE_0__);\nfunction _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\nfunction _unsupportedIterableToArray(r, a) { if (r) { if (\"string\" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return \"Object\" === t && r.constructor && (t = r.constructor.name), \"Map\" === t || \"Set\" === t ? Array.from(r) : \"Arguments\" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }\nfunction _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }\nfunction _iterableToArrayLimit(r, l) { var t = null == r ? null : \"undefined\" != typeof Symbol && r[Symbol.iterator] || r[\"@@iterator\"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t[\"return\"] && (u = t[\"return\"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }\nfunction _arrayWithHoles(r) { if (Array.isArray(r)) return r; }\n// codeeditor 가져오기\n\n //이 파일을 모듈로 만듭니다. \n\n// 전역 변수 선언을 파일 맨 위로 이동하고 모두 var로 변경\nvar currentProblemNumber = 1;\nvar totalProblems = 10;\nvar currentExamName = '';\nvar problemData = [];\ndocument.addEventListener(\"DOMContentLoaded\", function () {\n  if (!window.menuLoaded) {\n    var googleApiKey = document.getElementById('googleApiKey').value;\n    var spreadsheetId = document.getElementById('spreadsheetId').value;\n    if (googleApiKey && spreadsheetId) {\n      if (typeof gapi !== 'undefined') {\n        gapi.load('client', initClient);\n      } else {\n        console.error('Google API not loaded');\n      }\n    } else {\n      console.error('Required elements not found');\n    }\n    window.menuLoaded = true;\n  }\n  setupEventListeners(); // 여기에 추가\n});\nfunction initClient() {\n  var apiKey = document.getElementById('googleApiKey').value;\n  var spreadsheetId = document.getElementById('spreadsheetId').value;\n  if (!apiKey || !spreadsheetId) {\n    console.error('API Key or Spreadsheet ID is missing');\n    return;\n  }\n  gapi.client.init({\n    apiKey: apiKey,\n    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']\n  }).then(function () {\n    console.log('Google API client initialized');\n    return loadMenuData(spreadsheetId);\n  }).then(function (menuData) {\n    if (menuData && menuData.length > 0) {\n      renderMenu(menuData);\n      return loadProblemData(spreadsheetId);\n    } else {\n      throw new Error('No menu data loaded');\n    }\n  }).then(function (problemData) {\n    if (problemData && problemData.length > 0) {\n      console.log('Problem data loaded successfully');\n      window.problemData = problemData; // Store problem data globally\n      if (currentExamName) {\n        loadProblem(currentProblemNumber);\n      }\n    } else {\n      throw new Error('No problem data loaded');\n    }\n  })[\"catch\"](function (error) {\n    console.error('Error in initialization process:', error);\n  });\n}\nfunction setupEventListeners() {\n  console.log(\"Setting up event listeners\"); // 추가\n  var runCodeBtn = document.getElementById('runCodeBtn');\n  var prevButton = document.getElementById('prev-problem');\n  var nextButton = document.getElementById('next-problem');\n  if (runCodeBtn) {\n    runCodeBtn.addEventListener('click', runCode);\n  }\n  if (prevButton) {\n    prevButton.addEventListener('click', function () {\n      if (currentProblemNumber > 1) {\n        navigateToProblem(currentProblemNumber - 1);\n      }\n    });\n  }\n  if (nextButton) {\n    nextButton.addEventListener('click', function () {\n      if (currentProblemNumber < totalProblems) {\n        navigateToProblem(currentProblemNumber + 1);\n      }\n    });\n  }\n  fetchUserData();\n}\nfunction fetchUserData() {\n  var userNameElement = document.getElementById('userName');\n  if (userNameElement) {\n    fetch('/get-user', {\n      credentials: 'include'\n    }).then(function (response) {\n      if (!response.ok) {\n        throw new Error('Network response was not ok');\n      }\n      return response.json();\n    }).then(function (data) {\n      userNameElement.innerText = data.username || \"로그인 정보 미확인\";\n    })[\"catch\"](function (error) {\n      console.error('Error fetching user data:', error);\n      userNameElement.innerText = \"로그인 정보 미확인\";\n    });\n  }\n}\nfunction loadMenuData(spreadsheetId) {\n  return gapi.client.sheets.spreadsheets.values.get({\n    spreadsheetId: spreadsheetId,\n    range: 'menulist!A2:C'\n  }).then(function (response) {\n    var data = response.result.values;\n    if (data && data.length > 0) {\n      return data;\n    } else {\n      throw new Error('No menu data found');\n    }\n  });\n}\nfunction loadProblemData(spreadsheetId) {\n  return gapi.client.sheets.spreadsheets.values.get({\n    spreadsheetId: spreadsheetId,\n    range: '문항정보!A:C'\n  }).then(function (response) {\n    var data = response.result.values;\n    if (data && data.length > 0) {\n      // 첫 번째 행이 헤더인 경우 제거\n      if (data[0][0] === 'URL') {\n        data.shift();\n      }\n      return data;\n    } else {\n      throw new Error('No problem data found');\n    }\n  });\n}\nfunction renderMenu(data) {\n  var navList = document.getElementById('navList');\n  if (!navList) {\n    console.error('Navigation list element not found');\n    return;\n  }\n  navList.innerHTML = ''; // Clear existing menu items\n\n  if (!data || !Array.isArray(data) || data.length === 0) {\n    console.error('Invalid menu data');\n    return;\n  }\n  var topLevelMenus = new Map();\n  data.forEach(function (row) {\n    if (row && row.length >= 3) {\n      var _row = _slicedToArray(row, 3),\n        topLevelMenu = _row[0],\n        subMenu = _row[1],\n        examName = _row[2];\n      if (!topLevelMenus.has(topLevelMenu)) {\n        topLevelMenus.set(topLevelMenu, []);\n      }\n      topLevelMenus.get(topLevelMenu).push({\n        subMenu: subMenu,\n        examName: examName\n      });\n    }\n  });\n  var index = 0;\n  topLevelMenus.forEach(function (subMenus, topLevelMenu) {\n    var topLevelMenuItem = createTopLevelMenuItem(topLevelMenu, index);\n    var subMenuItems = createSubMenuItems(subMenus, index);\n    navList.appendChild(topLevelMenuItem);\n    navList.appendChild(subMenuItems);\n    index++;\n  });\n\n  // Bootstrap의 collapse 기능 초기화 및 이벤트 리스너 추가\n  var collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));\n  collapseElementList.forEach(function (collapseEl) {\n    var collapse = new bootstrap.Collapse(collapseEl, {\n      toggle: false\n    });\n    collapseEl.addEventListener('show.bs.collapse', function () {\n      // 다른 모든 열린 메뉴 닫기\n      collapseElementList.forEach(function (el) {\n        if (el !== collapseEl && el.classList.contains('show')) {\n          bootstrap.Collapse.getInstance(el).hide();\n        }\n      });\n    });\n  });\n\n  // 동일한 대메뉴를 클릭할 때 하위 메뉴 토글\n  document.querySelectorAll('[data-bs-toggle=\"collapse\"]').forEach(function (el) {\n    el.addEventListener('click', function (event) {\n      event.preventDefault();\n      var target = document.querySelector(this.getAttribute('href'));\n      var bsCollapse = bootstrap.Collapse.getInstance(target);\n      if (bsCollapse) {\n        if (target.classList.contains('show')) {\n          bsCollapse.hide();\n        } else {\n          // 다른 열린 메뉴 닫기\n          document.querySelectorAll('.collapse.show').forEach(function (openMenu) {\n            if (openMenu !== target) {\n              bootstrap.Collapse.getInstance(openMenu).hide();\n            }\n          });\n          bsCollapse.show();\n        }\n      }\n      updateToggleIcon(this);\n    });\n  });\n\n  // 아이콘 변경\n  function updateToggleIcon(element) {\n    var icon = element.querySelector('.bi');\n    if (icon) {\n      if (element.getAttribute('aria-expanded') === 'true') {\n        icon.classList.remove('bi-chevron-down');\n        icon.classList.add('bi-chevron-up');\n      } else {\n        icon.classList.remove('bi-chevron-up');\n        icon.classList.add('bi-chevron-down');\n      }\n    }\n  }\n}\nfunction createTopLevelMenuItem(topLevelMenu, index) {\n  var topLevelMenuItem = document.createElement('li');\n  topLevelMenuItem.classList.add('menu-item');\n  var link = document.createElement('a');\n  link.href = \"#collapse\".concat(index);\n  link.setAttribute('data-bs-toggle', 'collapse');\n  link.setAttribute('role', 'button');\n  link.setAttribute('aria-expanded', 'false');\n  link.setAttribute('aria-controls', \"collapse\".concat(index));\n  link.textContent = topLevelMenu;\n  link.classList.add('d-flex', 'justify-content-between', 'align-items-center');\n  var arrow = document.createElement('i');\n  arrow.classList.add('bi', 'bi-chevron-down');\n  link.appendChild(arrow);\n  topLevelMenuItem.appendChild(link);\n\n  // 화살표 아이콘 회전을 위한 이벤트 리스너 추가\n  link.addEventListener('click', function () {\n    arrow.classList.toggle('rotate');\n  });\n  return topLevelMenuItem;\n}\nfunction createSubMenuItems(subMenus, index) {\n  var subMenuContainer = document.createElement('div');\n  subMenuContainer.id = \"collapse\".concat(index);\n  subMenuContainer.classList.add('collapse');\n  var subMenuList = document.createElement('ul');\n  subMenuList.classList.add('list-unstyled', 'pl-3');\n  subMenus.forEach(function (_ref) {\n    var subMenu = _ref.subMenu,\n      examName = _ref.examName;\n    var subMenuItem = document.createElement('li');\n    subMenuItem.classList.add('menu-item');\n    var icon = document.createElement('i');\n    icon.classList.add('bi', 'bi-file-text', 'me-2');\n    subMenuItem.appendChild(icon);\n    var text = document.createTextNode(subMenu);\n    subMenuItem.appendChild(text);\n    subMenuItem.addEventListener('click', function (event) {\n      event.stopPropagation();\n      onMenuSelect(examName);\n      applySubMenuHighlight(subMenuItem);\n    });\n    subMenuList.appendChild(subMenuItem);\n  });\n  subMenuContainer.appendChild(subMenuList);\n  return subMenuContainer;\n}\n\n// 아이콘을 변경하는 함수\nfunction toggleArrow(arrow, isOpen) {\n  if (isOpen) {\n    arrow.classList.remove('bi-chevron-down');\n    arrow.classList.add('bi-chevron-up');\n  } else {\n    arrow.classList.remove('bi-chevron-up');\n    arrow.classList.add('bi-chevron-down');\n  }\n}\n\n// 하위 메뉴 클릭 시 상위 메뉴에 active 클래스 제거, 클릭된 메뉴에 active 클래스 추가\nfunction applySubMenuHighlight(selectedItem) {\n  // 모든 메뉴 아이템에서 active 클래스 제거\n  document.querySelectorAll('.nav-container .menu-item, .nav-container .sub-menu .menu-item').forEach(function (item) {\n    return item.classList.remove('active');\n  });\n\n  // 선택된 하위 메뉴 아이템에 active 클래스 추가\n  selectedItem.classList.add('active');\n\n  // 상위 메뉴 아이템에 active 클래스 제거\n  var parentCollapse = selectedItem.closest('.collapse');\n  if (parentCollapse) {\n    var parentMenuItem = document.querySelector(\"[href=\\\"#\".concat(parentCollapse.id, \"\\\"]\")).closest('.menu-item');\n    parentMenuItem.classList.remove('active');\n  }\n}\nfunction onMenuSelect(examName) {\n  currentExamName = examName;\n  currentProblemNumber = 1;\n  console.log('Selected exam:', currentExamName);\n  if (problemData && problemData.length > 0) {\n    loadProblem(currentProblemNumber);\n    renderProblemNavigation();\n  } else {\n    console.error('Problem data not loaded yet. Cannot load problem.');\n  }\n\n  // 선택된 메뉴 아이템 찾기 및 하이라이트 적용\n  var selectedMenuItem = Array.from(document.querySelectorAll('.nav-container .menu-item, .nav-container .sub-menu .menu-item')).find(function (item) {\n    return item.textContent.trim() === examName;\n  });\n  if (selectedMenuItem) {\n    applySubMenuHighlight(selectedMenuItem);\n  }\n}\nfunction renderProblemNavigation() {\n  var navContainer = document.getElementById('problem-navigation');\n  if (!navContainer) return;\n  navContainer.innerHTML = '';\n  var _loop = function _loop(i) {\n    var problemBtn = document.createElement('i');\n    problemBtn.classList.add('bi', 'problem-icon');\n    if (i === currentProblemNumber) {\n      problemBtn.classList.add(i === 10 ? 'bi-0-circle-fill' : \"bi-\".concat(i, \"-circle-fill\"));\n    } else {\n      problemBtn.classList.add(i === 10 ? 'bi-0-circle' : \"bi-\".concat(i, \"-circle\"));\n    }\n    problemBtn.addEventListener('click', function () {\n      navigateToProblem(i);\n    });\n    navContainer.appendChild(problemBtn);\n  };\n  for (var i = 1; i <= totalProblems; i++) {\n    _loop(i);\n  }\n  updateNavigationButtons();\n}\nfunction navigateToProblem(problemNumber) {\n  currentProblemNumber = problemNumber;\n  updateProblemNavigation();\n  loadProblem(currentProblemNumber);\n}\nfunction updateProblemNavigation() {\n  var icons = document.querySelectorAll('#problem-navigation .problem-icon');\n  icons.forEach(function (icon, index) {\n    var problemNumber = index + 1;\n    icon.className = \"bi problem-icon \".concat(problemNumber === currentProblemNumber ? \"bi-\".concat(problemNumber === 10 ? 0 : problemNumber, \"-circle-fill\") : \"bi-\".concat(problemNumber === 10 ? 0 : problemNumber, \"-circle\"));\n  });\n  updateNavigationButtons();\n}\nfunction updateNavigationButtons() {\n  var prevButton = document.getElementById('prev-problem');\n  var nextButton = document.getElementById('next-problem');\n  if (prevButton) prevButton.style.visibility = currentProblemNumber > 1 ? 'visible' : 'hidden';\n  if (nextButton) nextButton.style.visibility = currentProblemNumber < totalProblems ? 'visible' : 'hidden';\n}\nfunction resizeIframe(iframe) {\n  if (!iframe) return;\n  var container = document.getElementById('problem-container');\n  if (!container) return;\n  var containerHeight = container.clientHeight;\n  iframe.style.height = containerHeight + 'px';\n\n  // cross-origin 접근 시도 제거\n  iframe.onload = function () {\n    iframe.style.height = containerHeight + 'px';\n  };\n}\nfunction loadProblem(problemNumber) {\n  console.log('Loading problem:', currentExamName, problemNumber);\n  console.log('Problem data:', problemData);\n  if (!problemData || problemData.length === 0) {\n    console.error('Problem data is not loaded yet');\n    return;\n  }\n  var problemInfo = problemData.find(function (problem) {\n    return problem[1].toLowerCase() === currentExamName.toLowerCase() && problem[2].toLowerCase() === \"p\".concat(problemNumber.toString().padStart(2, '0'));\n  });\n  if (problemInfo) {\n    var _problemInfo = _slicedToArray(problemInfo, 2),\n      problemFileName = _problemInfo[0];\n    var problemUrl = \"https://educodingnplaycontents.s3.amazonaws.com/\".concat(problemFileName);\n    console.log('Problem URL:', problemUrl);\n    var iframe = document.getElementById('iframeContent');\n    if (iframe) {\n      iframe.src = problemUrl;\n      iframe.onload = function () {\n        resizeIframe(iframe);\n      };\n      console.log('iframe src set to:', problemUrl);\n    } else {\n      console.error('iframe element not found');\n    }\n    var problemTitle = \"\".concat(currentExamName, \" - \\uBB38\\uC81C \").concat(problemNumber);\n    var problemTitleElement = document.getElementById('problem-title');\n    if (problemTitleElement) {\n      problemTitleElement.textContent = problemTitle;\n    } else {\n      console.error('problem-title element not found');\n    }\n  } else {\n    console.error('문제 정보를 찾을 수 없습니다:', currentExamName, problemNumber);\n    console.log('Available problems:', problemData.map(function (p) {\n      return \"\".concat(p[1], \" \").concat(p[2]);\n    }));\n  }\n}\n\n// 창 크기가 변경될 때마다 iframe 크기를 조정합니다\nwindow.addEventListener('resize', function () {\n  var iframe = document.getElementById('iframeContent');\n  if (iframe) {\n    resizeIframe(iframe);\n  }\n});\n\n// Ensure content and IDE are loaded and displayed side by side\nwindow.addEventListener('load', function () {\n  var contentContainer = document.querySelector('.content-container');\n  if (contentContainer) {\n    contentContainer.style.display = 'flex'; // Set the display as flex for horizontal layout\n  }\n});\n\n// Vue.js 로드 확인\ndocument.addEventListener('DOMContentLoaded', function () {\n  if (typeof Vue === 'undefined') {\n    console.error('Vue is not loaded');\n    return;\n  }\n  var app = Vue.createApp({\n    components: {\n      'code-editor': (_node_modules_simple_code_editor_CodeEditor_vue__WEBPACK_IMPORTED_MODULE_0___default())\n    }\n  });\n  app.mount('#app');\n});\n\n//# sourceURL=webpack://codingnacademy/./public/test.js?");

/***/ }),

/***/ "./node_modules/simple-code-editor/CodeEditor.vue":
/*!********************************************************!*\
  !*** ./node_modules/simple-code-editor/CodeEditor.vue ***!
  \********************************************************/
/***/ (() => {

eval("throw new Error(\"Module parse failed: Unexpected token (1:0)\\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\\n> <template>\\n|   <div\\n|     :theme=\\\"theme\\\"\");\n\n//# sourceURL=webpack://codingnacademy/./node_modules/simple-code-editor/CodeEditor.vue?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/test.js");
/******/ 	
/******/ })()
;