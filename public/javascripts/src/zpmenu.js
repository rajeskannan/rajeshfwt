/**
 * $Id: zpmenu.js 4322 2006-09-04 08:49:33Z shacka $
 * @fileoverview Masc DHTML Menu Widget.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/**
 * Extends base Masc Widget class (utils/zpwidget.js).
 *
 * <pre>
 * <strong>In addition to config options defined in base Masc.Widget class
 * provides following config options:</strong>
 *
 * <b>container</b> [object or string] Element or id of element that will hold
 * the menu. Required when sourceType is other than "html". If sourceType is
 * "html" and "container" is not specified, menu "source" element will be
 * replaced with the menu.
 *
 * <b>dynamic</b> [boolean] If true is passed, the tree will use the
 * "dynamic initialization" technique which greatly improves generation time.
 * Some functionality is not available in this mode until all the tree was
 * generated. In "dynamic" mode the tree is initially collapsed and levels are
 * generated "on the fly" as the end user expands them. You can't retrieve nodes
 * by ID (which implies you can't synchronize to certain nodes) until they have
 * been generated.
 *
 * <b>showDelay</b> [number] Delay before a submenu is shown, in milliseconds.
 *
 * <b>hideDelay</b> [number] Delay before a submenu is hidden, in milliseconds.
 *
 * <b>onClick</b> [boolean] Top menu drops on click not on hover.
 *
 * <b>vertical</b> [boolean] Make it a vertical menu.
 *
 * <b>scrollWithWindow</b> [boolean]
 *
 * <b>dropShadow</b> [number]
 *
 * <b>drag</b> [boolean]
 *
 * <b>slide</b> [boolean]
 *
 * <b>glide</b> [boolean]
 *
 * <b>fade</b> [boolean]
 *
 * <b>wipe</b> [boolean]
 *
 * <b>unfurl</b> [boolean]
 *
 * <b>animSpeed</b> [number] percentage animation per frame.
 *
 * <b>defaultIcons</b> [string] If set, all tree items will get an additional TD
 * element containing that string in the class attribute. This helps you
 * to include custom default icons without specifying them as IMG tags in
 * the tree.
 *
 * <b>zIndex</b> [number] Can be used for two menus on the same page. Use higher
 * value for menu which must be in front of other menus.
 *
 * <b>rememberPath</b> [boolean or string] Used to keep track of previous menu
 * location. Optional if pathCookie flag value differs from "__zp_item".
 * Possible values:
 * 1) true: keep track.
 * 2) false: do not keep track.
 * 3) "expand": the menu will open expanded to this previously location.
 *
 * <b>pathCookie</b> [string] Used to keep track of previous menu location. Use
 * this option with or instead of "rememberPath" when you need to specify which
 * cookie will contain path information. This is needed e.g. when you have
 * several menus on a page. If "rememberPath" option is not false and
 * "pathCookie" option is not set, cookie name "__zp_item" will be used by
 * default.
 *
 * <b>triggerEvent</b> [string] Event that will trigger showing of the menu.
 * Possible values:
 * 1) For mouse click: 'mousedown' or 'mouseup' or 'click' (no matter which, all
 *    values treated the same).
 * 2) For keyboard: 'keydown' or 'keyup' or 'keypress' (no matter which, all
 *    values treated the same).
 *
 * <b>triggerKey</b> [number or string] Decimal keyboard scan code or mouse
 * button: "left" or "both". Default: right mouse button.
 * Requires "triggerEvent" to be set.
 * See keyboard scan codes at:
 * http://techwww.in.tu-clausthal.de/Dokumentation/Standards_Bussysteme/ASCII-Tabelle/
 * http://www.nthelp.com/charts.htm
 *
 * <b>triggerObject</b> [string or object] Element id or HTMLElement object
 * associated with the menu. E.g. div inside which user must click to open the
 * menu. Default: window.document.
 * Requires triggerEvent to be set.
 * Also can be following array (to set trigger on several elements):
 * [
 *   [object or string] HTMLElement object or element id ||
 *   {
 *     triggerObject: [object or string] HTMLElement object or element id,
 *     triggerArgs: [any] args that should be available for external scripts
 *   },
 *   ...
 * ]
 * When trigger menu is shown, its "triggerObject" property contains reference
 * to trigger object that last invoked the menu, "triggerArgs" property contains
 * corresponding arguments. External scripts can access those properties.
 * This gives ability to attach menu to several objects and to pass through some
 * piece of data from those objects to external scripts. E.g. to determine,
 * which cell of the grid was clicked, etc.
 * If array is empty (triggerObject: []), trigger objects are not set initially
 * and can be set later using setTriggerObject() method.
 *
 * <b>top</b> [string] menu initial top offset.
 * <b>right</b> [string] menu initial right offset.
 * <b>bottom</b> [string] menu initial bottom offset.
 * <b>left</b> [string] menu initial left offset.
 * If set, top_parent div will be absolute positioned. Their values will be
 * assigned to corresponding CSS properties of top_parent div.
 * Important: For drag and scroll menus set either "top" or "bottom" and
 * "right" or "left" options instead of putting menu inside absolute positioned
 * div. Otherwise menu can be wrong positioned.
 *
 * <b>onInit</b> [function] function reference to call when menu is initialized.
 * Can be used e.g. to disable certain items, etc.
 * </pre>
 *
 * @constructor
 * @extends Masc.Widget
 * @param {object} objArgs User configuration
 */
Masc.Menu = function(objArgs) {
  // For backward compatibility with v1.1
  if (arguments.length > 1) {
    var objConfig = arguments[1];
    objConfig.source = arguments[0];
    objArgs = objConfig;
  }
  // Call constructor of superclass
  Masc.Menu.SUPERconstructor.call(this, objArgs);
};

// Inherit Widget
Masc.inherit(Masc.Menu, Masc.Widget);

/**
 * Initializes menu.
 *
 * @param {object} objArgs User configuration
 */
Masc.Menu.prototype.init = function(objArgs) {
  // Define config options
  this.config.container = null;
  this.config.dynamic = false;
  this.config.showDelay = 0;
  this.config.hideDelay = 500;
  this.config.onClick = false;
  this.config.vertical = false;
  this.config.scrollWithWindow = false;
  this.config.dropShadow = 0;
  this.config.drag = false;
  this.config.slide = false;
  this.config.glide = false;
  this.config.fade = false;
  this.config.wipe = false;
  this.config.unfurl = false;
  this.config.animSpeed = 10;
  this.config.defaultIcons = null;
  this.config.zIndex = 0;
  this.config.rememberPath = false;
  this.config.pathCookie = '__zp_item';
  this.config.triggerEvent = null;
  this.config.triggerKey = null;
  this.config.triggerObject = null;
  this.config.top = null;
  this.config.right = null;
  this.config.bottom = null;
  this.config.left = null;
  this.config.onInit = null;
  // Call parent init
  Masc.Menu.SUPERclass.init.call(this, objArgs);
  // Continue initialization after theme is loaded
};

/**
 * Extends parent method.
 * @private
 */
Masc.Menu.prototype.addStandardEventListeners = function() {
  // Call parent method
  Masc.Menu.SUPERclass.addStandardEventListeners.call(this);
  // Add menu specific event listeners
  this.addEventListener('loadThemeEnd', function() {
    this.onThemeLoad();
  });
};

/**
 * Holds reference to menu object that is currently on top. When menu is
 * mouseovered, its top_parent zIndex is changed to max to put it over the rest
 * of elements. This variable is needed to be able to restore zIndex of previous
 * top menu.
 * @private
 */
Masc.Menu.onTop = null;

/**
 * Restores zIndex of this menu.
 * @private
 */
Masc.Menu.prototype.restoreZIndex = function() {
  this.top_parent.style.zIndex = this.config.zIndex;
  Masc.Menu.onTop = null;
};

/**
 * Puts this menu on top.
 * @private
 */
Masc.Menu.prototype.putOnTop = function() {
  // Restore zIndex of previous top menu
  var objOnTop = Masc.Menu.onTop;
  if (objOnTop) {
    objOnTop.restoreZIndex();
  }
  // Put this menu over the rest of elements
  // Max zIndex in IE and FF: 10737418239, in Opera: 2147483583
  this.top_parent.style.zIndex = 2147483583;
  Masc.Menu.onTop = this;
};

/**
 * Called when theme is loaded.
 * @private
 */
Masc.Menu.prototype.onThemeLoad = function() {
  // Current trigger object that launched menu (menu can be attached to several
  // objects).
  this.triggerObject = null;
  // Arguments received from current trigger object. Those arguments can be
  // accessed from external script, e.g. to determine, which cell of the grid
  // was clicked, etc.
  this.triggerArgs = null;

  this.animations = [];

  // Menu container
  this.container = Masc.Widget.getElementById(this.config.container);
  // Call parent method to load data from the specified source
  this.loadData();

  this.openMenus = [];
  this.clickDone = false;

  var objMenu = this;

  // Setup triggers
  if (this.config.triggerEvent) {
    this.setTriggerObject(this.config.triggerObject || window.document);
    // Hide menu on click
    Masc.Utils.addEvent(window.document, 'mouseup',
      function() {
        objMenu.hideMenu()
      }
    );
    // Prevent hiding on click inside menu
    Masc.Utils.addEvent(this.top_parent, 'mouseup',
      function(objEvent) {
        return Masc.Utils.stopEvent(objEvent);
      }
    );
    // Hide menu on ESC
    Masc.Utils.addEvent(window.document, 'keypress',
      function(objEvent) {
        objEvent || (objEvent = window.event);
        if (objEvent.keyCode == 27) {
          for (var i = 0; i < Masc.Menu.selectedItemsStack.length; i++) {
            if (Masc.Menu.all[Masc.Menu.selectedItemsStack[i].__zp_tree]
             == objMenu) {
              return;
            }
          }
          // No more selected items in this menu
          objMenu.hideMenu();
        }
      }
    );
  } else {
    // Dragging and scrolling can't work correctly together with triggers
    if (this.config.scrollWithWindow) {
      Masc.ScrollWithWindow.register(this.rootMenu);
    }
    if (this.config.drag) {
      var objMenu = this;
      objMenu.dragging = false;
      Masc.Utils.addEvent(window.document, "mousedown",
        function(ev) { return Masc.Menu.dragStart(ev, objMenu) });
      Masc.Utils.addEvent(window.document, "mousemove",
        function(ev) { return Masc.Menu.dragMove(ev, objMenu) });
      Masc.Utils.addEvent(window.document, "mouseup",
        function(ev) { return Masc.Menu.dragEnd(ev, objMenu) });
    }
  }
  // Enforce animation mixing rules: fade + any 1 other.
  if (this.config.fade) {
    this.addAnimation('fade');
  }
  if (this.config.slide) {
    this.addAnimation('slide');
  } else if (this.config.glide) {
    this.addAnimation('glide');
  } else if (this.config.wipe) {
    this.addAnimation('wipe');
  } else if (this.config.unfurl) {
    this.addAnimation('unfurl');
  }
  // Oninit callback
  if (typeof this.config.onInit == 'function') {
    // To be able to reference to this object from onInit function
    setTimeout(function() {
      objMenu.config.onInit();
    }, 0);
  }
};

/**
 * Initializes a menu from the HTML source.
 *
 * @private
 * @param {object} objSource Source HTMLElement object
 */
Masc.Menu.prototype.loadDataHtml = function(objSource) {
  // Check arguments
  if (!objSource) {
    return;
  }
  this.list = objSource;
  this.items = {};
  this.trees = {};
  this.selectedItem = null;
  // Sub-menu container counter
  this.lastContainerNumber = 0;
  this.menuId = objSource.id || Masc.Utils.generateID("tree");
  var objContainer = this.top_parent = Masc.Utils.createElement("div");
  // Initially menu is hidden and will be shown on triggerEvent
  objContainer.style.display = 'none';
  // In order to work correctly when menu is put inside <center></center>
  objContainer.style.textAlign = 'left';
  objContainer.__zp_menu = Masc.Utils.createElement("div", objContainer);
  objContainer.__zp_menu.className = 'zpMenu';
  objContainer.className = "zpMenuContainer zpMenu-top";
  if (this.config.vertical) {
    // vertical:true, set top div container class to
    // NOTE:zpMenu-vertical-mode and zpMenu-level-1 defines the top vertical menu
    Masc.Utils.addClass(objContainer, "zpMenu-vertical-mode");
  } else {
    Masc.Utils.addClass(objContainer, "zpMenu-horizontal-mode");
  }
  // Create menu
  var strRootMenuId = this.createTree(objSource, objContainer, 0);
  // Reference to the root menu
  this.rootMenu = this.trees[strRootMenuId];
  // Associate menu with the theme
  var objTheme = Masc.Utils.createElement('div');
  objTheme.className = this.getClassName({prefix: 'zpMenu'});
  objTheme.appendChild(objContainer);
  // Insert menu into the page
  if (this.container) {
    // Put menu into the specified container
    this.container.appendChild(objTheme);
  } else {
    // Replace source ul element with menu
    objSource.parentNode.insertBefore(objTheme, objSource);
    objSource.parentNode.removeChild(objSource);
  }

  Masc.Menu.all[this.menuId] = this;
  // check if we have an initially selected node and sync. the tree if so
  if (this.selectedItem) {
    this.sync(this.selectedItem.__zp_item);
  }
  // Get path from cookies
  this.path = Masc.Utils.getCookie(this.config.pathCookie);
  if (this.path) {
    // Remove path from cookies
    Masc.Utils.writeCookie(this.config.pathCookie, '');
  }
  // Show menu if triggerEvent is not set
  if (!this.config.triggerEvent) {
    if (Masc.windowLoaded) {
      this.showMenu();
    } else {
      var objMenu = this;
      Masc.Utils.addEvent(window, 'load', function(){objMenu.showMenu()});
    }
  }
};

/**
 *<pre>
 * This global variable keeps a "hash table" (that is, a plain JavaScript
 * object) mapping ID-s to references to Masc.Menu objects.  It's helpful if
 * you want to operate on a tree but you don't want to keep a reference to it.
 * Example:
 *
 * // the following makes a tree for the <ul id="tree-id"> element
 * var tree = new Masc.Menu("tree-id");
 * // ... later
 * var existing_tree = Masc.Menu.all("tree-id");
 * // and now we can use existing_tree the same as we can use tree
 * // the following displays true
 * alert(existing_tree == tree);
 *
 * So in short, this variable remembers values returned by "new
 * Masc.Menu(...)" in case you didn't.
 * </pre>
 * @private
 */
Masc.Menu.all = {};

/**
 * Function that creates a (sub)tree.  This function walks the UL element,
 * computes and assigns CSS class names and creates HTML elements for a subtree.
 * Each time a LI element is encountered, createItem() is called which
 * effectively creates the item.  Beware that createItem() might call back this
 * function in order to create the item's subtree. (so createTree and createItem
 * form an indirect recursion).
 *
 * @private
 * @param {object} list UL element
 * @param {object} objContainer Parent element that should hold the (sub)tree
 * @param {number} level Level of this (sub)tree in the main tree
 * @return ID of the (sub)tree
 * @type number
 */
Masc.Menu.prototype.createTree = function(list, objContainer, level) {
  // Set id attribute of the container
  objContainer.id = 'zpMenu' + this.id + 'Container' + this.lastContainerNumber;
  this.lastContainerNumber++;

  var id;
  var intItem=1, bFirst=true;

  if (list) id=list.id; // list can be null
  if (!id)  id=Masc.Utils.generateID("tree.sub");
  var
    objMenu = this;
  function _makeIt() {
    objMenu.creating_now = true;
    var last_li = null; //previous <li>
    var next_li; //next <li>
    var i = (list ? list.firstChild : null);
    var items = objContainer.__zp_items = [];
    objMenu.trees[id] = objContainer;
    objContainer.__zp_level = level;
    objContainer.__zp_treeid = id;
    objContainer.__zp_keymap = {};
    var strOddEven;
    while (i) {
      if (last_li)
        last_li.className += " zpMenu-lines-c";
      if (i.nodeType != 1)
        i = i.nextSibling;
      else {
        next_li = Masc.Utils.getNextSibling(i, 'li');
        if (i.tagName.toLowerCase() == 'li') {
          last_li = objMenu.createItem(i, objContainer, next_li, level, intItem);
          if (last_li) { //false when webmaster creates malformed tree
            // ONLY do odd/even for NON HR items
            // If HR items had odd/even then visual odd/even themes (see zebra) look wrong
            if (!/zpMenu-item-hr/i.test(last_li.className)) 
            {
              // this previously created item is NOT in the HR class, create odd/even class
              strOddEven="zpMenu-item-" + (intItem % 2==1 ? "odd" : "even");
              Masc.Utils.addClass(last_li, strOddEven)
              intItem++
            }

            if (bFirst)
            {
              // First li for this sub-menu
              bFirst=false;
              Masc.Utils.addClass(last_li, "zpMenu-item-first");
            }
            //adds it to the parent's array of items
            items[items.length] = last_li.__zp_item;
          }
        }
        i = next_li;
      }
    }

    // Last li for this sub-menu
    if (last_li) Masc.Utils.addClass(last_li, "zpMenu-item-last");

    i = objContainer.firstChild;
    if (i && !level) {
      i.className = i.className.replace(/ zpMenu-lines-./g, "");
      i.className += (i === last_li) ? " zpMenu-lines-s" : " zpMenu-lines-t";
    }
    if (last_li && (level || last_li !=  i)) {
      last_li.className = last_li.className.replace(/ zpMenu-lines-./g, "");
      last_li.className += " zpMenu-lines-b";
    }
    objMenu.creating_now = false;
  };
  if (this.config.dynamic && level > 0)
    this.trees[id] = _makeIt;
  else
    _makeIt();
  return id;
};

/**
 * <pre>
 * Counter that is increased by 1 before each item added. Next menu item will
 * have tabIndex property value = current value of Masc.Menu.tabIndex + 1.
 *
 * Note:
 * in Opera tabIndex property value of node must be > 0, otherwise it will be
 * ignored;
 * Mozilla starts travelling from nodes with tabIndex > 0;
 * IE starts travelling from nodes with tabIndex == 0;
 * all nodes without tabIndex set explicitly have tabIndex == 0
 * </pre>
 * @private
 */
Masc.Menu.tabIndex = 1000;

/**
 * Walks through a LI element and creates the HTML elements associated with that
 * tree item. When it encounters an UL element it calls createTree() in order to
 * create the item's subtree. This function may also call item_addIcon() in
 * order to add the +/- buttons or icons present in the item definition as IMG
 * tags, or item_addDefaultIcon() if the tree configuration specifies
 * "defaultIcons" and no IMG tag was present.
 *
 * @private
 * @param {object} li LI element
 * @param {object} objContainer Parent element where the HTML elements should be
 * created
 * @param {object} next_li Next LI element, if this is not the last one
 * @param {number} level Level of this item in the main tree
 * @param {number} intItem Nth item for this sub-tree
 * @return DIV element holding the HTML elements of the created item
 * @type object
 */
Masc.Menu.prototype.createItem = function(li, objContainer, next_li, level, intItem) {
  if (!li.firstChild) {
    return;
  }
  var id = li.id || Masc.Utils.generateID("tree.item");
  var item = this.items[id] =
   Masc.Utils.createElement("div", objContainer.__zp_menu);
  var t = Masc.Utils.createElement("table", item);
  var tb = Masc.Utils.createElement("tbody", t);
  var tr = Masc.Utils.createElement("tr", tb);
  var td = Masc.Utils.createElement("td", tr);
  var has_icon = false;

  if (!level) {
    // This will allow to have correct item offsetWidth value in Opera
    td.style.whiteSpace = 'nowrap';
  }

  t.className = "zpMenu-table";
  t.cellSpacing = 0;
  t.cellPadding = 0;
  td.className = "zpMenu-label"

  //If there's a title attribute to the LI
  var title = li.getAttribute('title');
  if (title) {
    //apply it to the menu item
    td.setAttribute('title', title);
  }

  // add the LI's classname to the
  item.className = "zpMenu-item" + (li.className ? ' ' + li.className : '');
  Masc.Utils.addClass(item, "zpMenu-level-" + (level+1));  // Define the Nth level of a sub-menu, 1 based
  item.__zp_item = id;
  item.__zp_tree = this.menuId;
  item.__zp_parent = objContainer.__zp_treeid;
  item.onmouseover = Masc.Menu.onItemMouseOver;
  item.onmouseout = Masc.Menu.onItemMouseOut;
  item.onclick = Masc.Menu.onItemClick;
  Masc.Utils.addClass(item, "zpMenu-item-" + (intItem % 2==1 ? "odd" : "even"));

  // Parse li
  var fc, subtree = false, accessKey = null;

  var getAccessKey = function(node) {
    var key = null;
    if (node.nodeType == 1) { // ELEMENT_NODE
      if (key = node.getAttribute('accesskey')) {
        // Remove accesskey attribute because it will cause duplicate onclick event
        node.removeAttribute('accesskey', false);
        if (/^[a-z0-9]$/i.test(key)) {
          return key;
        } else {
          key = null;
        }
      }
      var childNodes = node.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        if (key = getAccessKey(childNodes[i])) {
          break;
        }
      }
    } else if (node.nodeType == 3) { // TEXT_NODE
      var label = node.data.replace(/(^\s+|\s+$)/g, '');
      if (/_([a-z0-9])/i.test(label)) {
        label = label.replace(/_([a-z0-9])/i, '<span style="text-decoration:underline">$1</span>');
        key = RegExp.$1;
        var span = Masc.Utils.createElement("span");
        span.innerHTML = label;
        var objParentNode = node.parentNode;
        objParentNode.insertBefore(span, node);
        objParentNode.removeChild(node);
      }
    }
    return key;
  };

  while (fc = li.firstChild) {
    if (fc.nodeType == 1 && (/^[ou]l$/i.test(fc.tagName.toLowerCase()))) {
      // Subtree
      if (!subtree) {
        this.item_addIcon(item, null);
        var np = Masc.Utils.createElement("div", objContainer);
        // The following to be able to position menu at the bottom right corner
        // of the screen without appearing of scrollbars
        // Also Opera zIndex requires absolute positioning
        np.style.position = 'absolute';
        if (!this.config.triggerEvent) {
          np.style.left = '-9999px';
          np.style.top = '-9999px';
        }
        if (this.config.dropShadow) {
          var ds = np.__zp_dropshadow = Masc.Utils.createElement('div');
          objContainer.insertBefore(ds, np);
          ds.style.position = 'absolute';
          if (!this.config.triggerEvent) {
            ds.style.left = '-9999px';
            ds.style.top = '-9999px';
          }
          ds.style.backgroundColor = '#000';
          if (window.opera) {
            ds.style.backgroundColor = '#666'; // opacity doesn't work in Opera
          } else {
            ds.style.filter = 'alpha(opacity=' + this.config.dropShadow + ')';
          }
          ds.style.opacity = this.config.dropShadow / 100;
        }
        np.__zp_item = id;
        np.__zp_menu = Masc.Utils.createElement("div", np);
        np.__zp_menu.className = 'zpMenu' + (fc.className ? ' ' + fc.className : '');
        np.className = 'zpMenuContainer';
        np.__zp_menu.onmouseover = Masc.Menu.onItemMouseOver;
        np.__zp_menu.onmouseout = Masc.Menu.onItemMouseOut;
        if (next_li) {
          np.__zp_menu.className += " zpMenu-lined";
        }
        // Will hold sub-menu icons
        np.__zp_icons = [];
        // Build submenu
        item.__zp_subtree = this.createTree(fc, np, level+1);
        // Align captions in the sub-menu
        if (np.__zp_icons.length) {
          this.alignSubMenu(np);
        }
        // We don't need this any more
        np.__zp_icons = null;
        item.className += " zpMenu-item-collapsed";
        this.toggleItem(id);
        if (/(^|\s)selected(\s|$)/i.test(li.className)) {
          this.selectedItem = item;
        }
        subtree = true;
      }
      li.removeChild(fc);
    } else {
      // Label
      li.removeChild(fc);
      if (fc.nodeType == 3) {
        // Text
        var label = fc.data.replace(/(^\s+|\s+$)/g, '');
        if (label) {
          var strInnerHtml = label;
          if (Masc.Menu.onDocumentKeyDown && !accessKey) {
            strInnerHtml = label.replace(/_([a-z0-9])/i,
             '<span style="text-decoration:underline">$1</span>');
            accessKey = RegExp.$1;
          }
          var span = Masc.Utils.createElement("span", td);
          // IE 6.0 doesn't escape correctly plain text when it is assigned to
          // innerHTML property
          if (strInnerHtml == label) {
            // Plain text
            span.appendChild(document.createTextNode(strInnerHtml));
          } else {
            // Contains <span>
            span.innerHTML = strInnerHtml;
          }
          if (title) span.setAttribute('title', title); // To make title work in Opera
        }
      } else if (fc.tagName) { // Skip comments, etc.
        if (fc.tagName.toLowerCase() == 'img') {
          // Icon
          this.item_addIcon(item, fc);
          has_icon = true;
          if (objContainer.__zp_icons instanceof Array) {
            objContainer.__zp_icons.push(fc);
          }
        } else {
          // Other stuff
          if (fc.tagName.toLowerCase() == 'hr') {
            Masc.Utils.addClass(item, "zpMenu-item-hr");
          } else if (fc.tagName.toLowerCase() == 'input' && fc.getAttribute('type') == 'checkbox') {
            fc.onmousedown = function(ev){
              if (this.checked) {
                this.checked = false;
              } else {
                this.checked = true;
              }
              return Masc.Utils.stopEvent(ev);
            };
          } else if (fc.tagName.toLowerCase() == 'input' && fc.getAttribute('type') == 'radio') {
            fc.onmousedown = function(ev){
              this.checked = true;
              return Masc.Utils.stopEvent(ev);
            };
          } else if (fc.tagName.toLowerCase() == 'a') {
            if (Masc.Menu.onDocumentKeyDown && !accessKey) {
              accessKey = getAccessKey(fc);
            }
            // Tab navigation support
            fc.tabIndex = ++Masc.Menu.tabIndex;
            fc.onfocus = Masc.Menu.onItemMouseOver;
            fc.onblur = Masc.Menu.onItemMouseOut;
          }
          td.appendChild(fc);
          if (title && !fc.getAttribute('title')) fc.setAttribute('title', title); // To make title work in Opera
        }
      }
    }
  }

  if (accessKey) {
    accessKey = accessKey.toUpperCase().charCodeAt(0);
    objContainer.__zp_keymap[accessKey] = item;
  }

  if (!has_icon && !/zpMenu-item-hr/i.test(item.className))
    // No icons for this non-HR menu item
    if (this.config.defaultIcons)
      // Use user config setting defaultIcons className
      this.item_addDefaultIcon(item, this.config.defaultIcons);
    else
      // No icons default className
      this.item_addDefaultIcon(item, "zpMenu-noicon");

  return item;
};

/**
 * Aligns captions in the sub-menu.
 *
 * @private
 * @param {object} objSubMenu Sub-menu container
 */
Masc.Menu.prototype.alignSubMenu = function(objSubMenu) {
  // Get icons array
  var arrIcons = objSubMenu.__zp_icons;
  var arrIconsSrc = [];
  for (var iIcon = 0; iIcon < arrIcons.length; iIcon++) {
    arrIconsSrc.push(arrIcons[iIcon].src);
  }
  // Wait while icons are loading
  Masc.Transport.preloadImages({
    urls: arrIconsSrc,
    onLoad: function() {
      // Get max icon width
      var iMaxIconWidth = 0;
      for (var iIcon = 0; iIcon < arrIcons.length; iIcon++) {
        var iIconWidth = arrIcons[iIcon].width;
        if (iIconWidth && iMaxIconWidth < iIconWidth) {
          iMaxIconWidth = iIconWidth;
        }
      }
      // Load StyleSheet class
      var objMenu = this;
      Masc.Transport.loadJS({
        module: 'stylesheet',
        onLoad: function() {
          // Get stylesheet
          if (!objSubMenu.syncStyleSheet) {
            objSubMenu.captionStyleSheet = new Masc.StyleSheet();
          } else {
            objSubMenu.captionStyleSheet.removeRules();
          }
          // Set caption width
          objSubMenu.captionStyleSheet.addRule('#' + objSubMenu.id +
           ' .icon div', 'width:' + iMaxIconWidth + 'px');
        }
      });
    },
    timeout: 60000 // 1 minute
  });
};

/**
 * <pre>
 * Adds a TD element having a certain class attribute which helps having a tree
 * containing icons without defining IMG tags for each item. The class name will
 * be "tgb icon className" (where "className" is the specified parameter).
 * Further, in order to customize the icons, one should add some CSS lines like
 * this:
 *
 * div.tree-item td.customIcon {
 *   background: url("themes/img/fs/document2.png") no-repeat 0 50%;
 * }
 * div.tree-item-expanded td.customIcon {
 *   background: url("themes/img/fs/folder-open.png") no-repeat 0 50%;
 * }
 * div.tree-item-collapsed td.customIcon {
 *   background: url("themes/img/fs/folder.png") no-repeat 0 50%;
 * }
 *
 * As you can see, it's very easy to customize the default icons for a normal
 * tree item (that has no subtrees) or for expanded or collapsed items.  For
 * the above example to work, one has to pass { defaultIcons: "customIcon" } in
 * the tree configuration object.
 *
 * This function does nothing if the className parameter has a false logical
 * value (i.e. is null).
 * </pre>
 *
 * @private
 * @param {object} item DIV element holding the item
 * @param {string} className Additional class name
 */
Masc.Menu.prototype.item_addDefaultIcon = function(item, className) {
  if (!className) {
    return;
  }
  var last_td = item.firstChild.firstChild.firstChild.lastChild, td;
  var td = Masc.Utils.createElement("td");
  td.className = "tgb icon " + className;
  last_td.parentNode.insertBefore(td, last_td);
  // To be able to set table cell width
  Masc.Utils.createElement('div', td);
};

/**
 * If img is passed, adds it as an icon for the given item. If not passed,
 * creates a "+/-" button for the given item.
 *
 * @private
 * @param {object} item DIV holding the item elements
 * @param {object} img Optional. IMG element; normally one found in the <LI>
 */
Masc.Menu.prototype.item_addIcon = function(item, img) {
  var last_td = item.firstChild.firstChild.firstChild;
  var td;
  last_td = img ? last_td.lastChild : last_td.firstChild;
  if (!img || !item.__zp_icon) {
    td = Masc.Utils.createElement("td");
    td.className = "tgb " + (img ? "icon" : "minus");
    last_td.parentNode.insertBefore(td, last_td);
  } else {
    td = item.__zp_icon;
    img.style.display = "none";
  }
  // To be able to set table cell width
  var objDiv = Masc.Utils.createElement('div', td);
  if (!img) {
    objDiv.innerHTML = "&nbsp;";
    item.className += " zpMenu-item-more";
    item.__zp_state = true; // expanded
    item.__zp_expand = td;
  } else {
    objDiv.appendChild(img);
    item.__zp_icon = td;
  }
};

/**
 * This function gets called from a global event handler when some item was
 * clicked.  It selects the item and toggles it if it has a subtree (expands or
 * collapses it).
 *
 * @param {string} item_id Item ID
 */
Masc.Menu.prototype.itemClicked = function(item_id) {
  this.selectedItem = this.toggleItem(item_id);
  if (this.selectedItem) {
    Masc.Menu.selectItem(this.selectedItem);
  }
  this.onItemSelect(item_id);
};

/**
 * This function toggles an item if the state parameter is not specified.
 * If state is true then it expands the item, and if state is false
 * then it collapses the item.
 *
 * @param {string} item_id Item ID
 * @param {boolean} state Optional. Desired item state
 * @return Item element if found, null otherwise
 * @type object
 */
Masc.Menu.prototype.toggleItem = function(item_id, state) {
  if (!item_id) {
    return null;
  }
  if (this.selectedItem) {
    Masc.Menu.unselectItem(this.selectedItem);
  }
  var item = this.items[item_id];
  if (typeof state == "undefined")
    state = !item.__zp_state;
  if (state != item.__zp_state) {
    var subtree = this._getTree(item.__zp_subtree, this.creating_now);
    if (subtree) {
      if (state) {
        // Unselect all children
        for (var i = 0; i < subtree.__zp_items.length; i++) {
          var subItemID = subtree.__zp_items[i];
          Masc.Menu.unselectItem(this.items[subItemID]);
          if (subtree.__zp_activeitem == subItemID) subtree.__zp_activeitem = '';
        }
      } else {
        // Recursively hide all children
        for (var i = 0; i < subtree.__zp_items.length; i++) {
          var subItemID = subtree.__zp_items[i];
          this.toggleItem(subItemID, state);
          Masc.Menu.unselectItem(this.items[subItemID]);
          if (subtree.__zp_activeitem == subItemID) subtree.__zp_activeitem = '';
        }
      }
      this.treeSetDisplay(subtree, state);
      Masc.Utils.removeClass(item, "zpMenu-item-expanded");
      Masc.Utils.removeClass(item, "zpMenu-item-collapsed");
      Masc.Utils.addClass(item, state ? "zpMenu-item-expanded" : "zpMenu-item-collapsed");
    }
    var img = item.__zp_expand;
    if (img)
      img.className = "tgb " + (state ? "minus" : "plus");
    item.__zp_state = state;
    if (state) {
      var hideItems = this._getTree(item.__zp_parent).__zp_items;
      for (var i = hideItems.length; --i >= 0;) {
        if (hideItems[i] != item_id && hideItems[i].__zp_state) {
          this.toggleItem(hideItems[i], false);
        }
      }
    }
  }
  return item;
};

/**
 * Call this function to collapse all items in the tree.
 */
Masc.Menu.prototype.collapseAll = function() {
  for (var i in this.trees)
    this.toggleItem(this._getTree(i).__zp_item, false);
};

/**
 * Call this function to expand all items in the tree.
 */
Masc.Menu.prototype.expandAll = function() {
  for (var i in this.trees)
    this.toggleItem(this._getTree(i).__zp_item, true);
};

/**
 * Call this function to toggle all items in the tree.
 */
Masc.Menu.prototype.toggleAll = function() {
  for (var i in this.trees)
    this.toggleItem(this._getTree(i).__zp_item);
};

/**
 * Call this function to synchronize the tree to a given item.  This means that
 * all items will be collapsed, except that item and the full path to it.
 *
 * @param {string} item_id ID of the item to sync to
 */
Masc.Menu.prototype.sync = function(item_id) {
  var item = this.items[item_id];
  if (item) {
    this.collapseAll();
    this.selectedItem = item;
    var path = [];
    while (item.__zp_parent) {
      path[path.length] = item;
      var parentItem = this._getTree(item.__zp_parent);
      if (parentItem.__zp_item) {
        item = this.items[parentItem.__zp_item];
      } else {
        break;
      }
    }
    for (var ii = path.length; --ii >= 0;) {
      var item = path[ii];
      var item_id = item.__zp_item;
      this.itemShow(item_id);
      var menu = this._getTree(item.__zp_parent);
      menu.__zp_activeitem = item_id;
      Masc.Menu.selectItem(item);
    }
  }
};

/**
 * Highlight specified item and all higher items.
 *
 * @param {string} item_id ID of the item
 */
Masc.Menu.prototype.highlightPath = function(item_id) {
  // Put this menu on top
  this.putOnTop();
  // Highlight path
  var item = this.items[item_id];
  if (item) {
    var a = [];
    while (item.__zp_parent) {
      a[a.length] = item;
      var pt = this._getTree(item.__zp_parent);
      if (pt.__zp_item)
        item = this.items[pt.__zp_item];
      else
        break;
    }
    for (var i = a.length; --i >= 0;) {
      Masc.Utils.addClass(a[i], 'zpMenuPath');
    }
  }
};

/**
 * Destroys the tree.  Removes all elements.  Does not destroy the Masc.Menu
 * object itself (actually there's no proper way in JavaScript to do that).
 */
Masc.Menu.prototype.destroy = function() {
  var p = this.top_parent;
  p.parentNode.removeChild(p);
};

/**
 * Used when "dynamic initialization" is on. Retrieves a reference to a subtree
 * if already created, or creates it if it wasn't yet and dont_call is false
 * (returns null in that case).
 *
 * @private
 * @param {string} tree_id ID of the subtree
 * @param {boolean} dont_call Pass true here if you don't want the subtree to be
 * created
 * @return Reference to the tree if it was found or created, null otherwise
 * @type object
 */
Masc.Menu.prototype._getTree = function(tree_id, dont_call) {
  var tree = this.trees[tree_id];
  if (typeof tree == "function") {
    if (dont_call)
      tree = null;
    else {
      tree();
      tree = this.trees[tree_id];
    }
  }
  return tree;
};

// CUSTOMIZABLE EVENT HANDLERS; default action is "do nothing"

/**
 * Third party code can override this member in order to add an event handler
 * that gets called each time a tree item is selected.  It receives a single
 * string parameter containing the item ID.
 */
Masc.Menu.prototype.onItemSelect = function() {};

// GLOBAL EVENT HANDLERS (to workaround the stupid Microsoft memory leak)

/**
 * Global event handler that gets called when a tree item is clicked.
 * @private
 */
Masc.Menu.onItemToggle = function() {
  var item = this;
  var body = document.body;
  while (item && item !=  body && !/zpMenu-item/.test(item.className))
    item = item.parentNode;
  Masc.Menu.all[item.__zp_tree].itemClicked(item.__zp_item);
};

/**
 * Sets additional trigger object or several trigger objects at once.
 *
 * @param {object} triggerObject One of the following:
 * <pre>
 * element id [string] ||
 * HTMLElement object [object] ||
 * [
 *   element id [string] ||
 *   HTMLElement object [object] ||
 *   {
 *     triggerObject: element id [string] || HTMLElement object [object],
 *     triggerArgs: any args that should be available to external scripts [any]
 *   },
 *   ...
 * ]
 * </pre>
 */
Masc.Menu.prototype.setTriggerObject = function(triggerObject) {
  if (!this.config.triggerEvent) {
    // This method is applicable only to trigger menus
    return;
  }
  var strTriggerEvent = this.config.triggerEvent;
  var strTriggerKey = this.config.triggerKey;
  // Get trigger objects
  var objTriggerElements = [];
  if (triggerObject) {
    if (typeof triggerObject == 'string') {
      // Element id
      var objElement = document.getElementById(triggerObject);
      if (objElement) {
        objTriggerElements.push({
          triggerObject: objElement,
          triggerArgs: null
        });
      }
    } else if (typeof triggerObject == 'object') {
      if (triggerObject == window.document ||
       typeof triggerObject.length == 'undefined') {
        // HTMLElement object
        objTriggerElements.push({
          triggerObject: triggerObject,
          triggerArgs: null
        });
      } else {
        // Array
        for (var iObj = 0; iObj < triggerObject.length; iObj++) {
          var triggerElement = triggerObject[iObj];
          if (triggerElement) {
            if (typeof triggerElement == 'string') {
              // Element id
              var objElement = document.getElementById(triggerElement);
              if (objElement) {
                objTriggerElements.push({
                  triggerObject: objElement,
                  triggerArgs: null
                });
              }
            } else if (typeof triggerElement == 'object') {
              if (typeof triggerElement.triggerObject != 'undefined' &&
               typeof triggerElement.triggerArgs != 'undefined') {
                // Arguments passed
                if (typeof triggerElement.triggerObject == 'string') {
                  // Element id
                  var objElement =
                   document.getElementById(triggerElement.triggerObject);
                  if (objElement) {
                    objTriggerElements.push({
                      triggerObject: objElement,
                      triggerArgs: triggerElement.triggerArgs
                    });
                  }
                } else if (typeof triggerElement.triggerObject == 'object') {
                  // HTMLElement object
                  objTriggerElements.push(triggerElement);
                }
              } else {
                // HTMLElement object
                objTriggerElements.push({
                  triggerObject: triggerElement,
                  triggerArgs: null
                });
              }
            }
          }
        }
      }
    }
  }
  if (objTriggerElements.length == 0) {
    // Nothing to set up
    return;
  }
  // Set up trigger objects
  var objMenu = this;
  if (strTriggerEvent == 'mousedown' || strTriggerEvent == 'mouseup' ||
   strTriggerEvent == 'click') {
    // Mouse trigger
    // Need this function to be able to set current trigger object and arguments
    var funcSetupTriggerEvent = function(objTriggerElement) {
      Masc.Utils.addEvent(objTriggerElement.triggerObject, 'mouseup',
        function(objEvent) {
          objEvent || (objEvent = window.event);
          // Get mouse position
          var objMousePos = Masc.Utils.getMousePos(objEvent);
          // Get mouse button
          var button;
          if (objEvent.button) {
            button = objEvent.button;
          } else {
            button = objEvent.which;
          }
          if (window.opera) {
            // Button 1 is used for both showing and hiding menu in Opera
            // because Opera doesn't allow to disable context menu
            if (button == 1 && objMenu.top_parent.style.display == 'none') {
              setTimeout(function() {
                // Set current trigger object
                objMenu.triggerObject = objTriggerElement.triggerObject;
                // Set arguments received from current trigger object
                objMenu.triggerArgs = objTriggerElement.triggerArgs;
                // Show menu at mouse position
                objMenu.popupMenu(objMousePos.pageX, objMousePos.pageY);
              }, 100);
              return Masc.Utils.stopEvent(objEvent);
            }
          } else {
            // In Safari Meta (Alt) Key + left click is used because it doesn't
            // react on right mouse button
            if (strTriggerKey == 'both' ||
             (strTriggerKey == 'left' && button == 1) ||
             ((!strTriggerKey || strTriggerKey == 'right') &&
              (button > 1 || objEvent.metaKey))) {
              setTimeout(function() {
                // Set current trigger object
                objMenu.triggerObject = objTriggerElement.triggerObject;
                // Set arguments received from current trigger object
                objMenu.triggerArgs = objTriggerElement.triggerArgs;
                // Show menu at mouse position
                objMenu.popupMenu(objMousePos.pageX, objMousePos.pageY);
              }, 100);
              Masc.Utils.stopEvent(objEvent);
              // Safari bug workaround
              objEvent.returnValue = true;
              return false;
            }
          }
        }
      );
    };
    for (var iEl = 0; iEl < objTriggerElements.length; iEl++) {
      funcSetupTriggerEvent(objTriggerElements[iEl])
    }
    // Disable context menu
    window.document.oncontextmenu = function() {return false};
  } else if (strTriggerEvent == 'keydown' || strTriggerEvent == 'keyup' ||
   strTriggerEvent == 'keypress') {
    // Keyboard trigger
    // Need this function to be able to set current trigger object and arguments
    var funcSetupTriggerEvent = function(objTriggerElement) {
      Masc.Utils.addEvent(objTriggerElement.triggerObject, 'keydown',
        function(objEvent) {
          objEvent || (objEvent = window.event);
          if (objEvent.keyCode == strTriggerKey) {
            // Set current trigger object
            objMenu.triggerObject = objTriggerElement.triggerObject;
            // Set arguments received from current trigger object
            objMenu.triggerArgs = objTriggerElement.triggerArgs;
            // Show menu
            objMenu.popupMenu();
            return Masc.Utils.stopEvent(objEvent);
          }
        }
      );
    };
    for (var iEl = 0; iEl < objTriggerElements.length; iEl++) {
      funcSetupTriggerEvent(objTriggerElements[iEl])
    }
  }
};

//Constants
Masc.Menu.MOUSEOUT = 0;
Masc.Menu.MOUSEOVER = 1;
Masc.Menu.CLICK = 2;

/**
 * Collection of animations (function references).
 * These are called to progressively style the DOM elements as menus show
 * and hide. They do not have to set item visibility, but may want to set DOM
 * properties like clipping, opacity and position to create custom effects.
 *
 * @param {object} ref HTMLElement object that contains the menu items
 * @param {number} counter Animation progress value, from 0 (start) to 100 (end)
 */
Masc.Menu.animations = {};

Masc.Menu.animations.fade = function(ref, counter) {
  var f = ref.filters, done = (counter==100);
  if (f) {
    if (!done && ref.style.filter.indexOf("alpha") == -1) {
      ref.style.filter += ' alpha(opacity=' + counter + ')';
    }
    else if (f.length && f.alpha) with (f.alpha) {
      if (done) enabled = false;
      else { opacity = counter; enabled=true }
    }
  }
  else {
    ref.style.opacity = ref.style.MozOpacity = counter/100.1;
  }
};

Masc.Menu.animations.slide = function(ref, counter) {
  if (counter != 100) {
    var cP = Math.pow(Math.sin(Math.PI * counter / 200), 0.75);
    if (typeof ref.__zp_origmargintop == 'undefined') {
      ref.__zp_origmargintop = ref.style.marginTop;
    }
    ref.style.marginTop = '-' + parseInt(ref.offsetHeight * (1 - cP)) + 'px';
    ref.style.clip = 'rect(' + parseInt(ref.offsetHeight * (1 - cP)) + 'px,' +
     ref.offsetWidth + 'px,' + ref.offsetHeight + 'px,0)';
  } else {
    if (typeof ref.__zp_origmargintop != 'undefined') {
      ref.style.marginTop = ref.__zp_origmargintop;
    }
    try {
      ref.style.clip = '';
    } catch (objException) {
      // IE 6.0
      ref.style.clip = 'rect(auto,auto,auto,0)';
    }
  }
};

Masc.Menu.animations.glide = function(ref, counter) {
  if (counter != 100) {
    var cP = Math.pow(Math.sin(Math.PI * counter / 200), 0.75);
    ref.style.clip = 'rect(0,' + ref.offsetWidth + 'px,' +
     parseInt(ref.offsetHeight * cP) + 'px,0)';
  } else {
    try {
      ref.style.clip = '';
    } catch (objException) {
      // IE 6.0
      ref.style.clip = 'rect(0,auto,auto,0)';
    }
  }
};

Masc.Menu.animations.wipe = function(ref, counter) {
  if (counter != 100) {
    ref.style.clip = 'rect(0,' + parseInt(ref.offsetWidth * (counter / 100)) +
     'px,' + parseInt(ref.offsetHeight * (counter / 100)) + 'px,0)';
  } else {
    try {
      ref.style.clip = '';
    } catch (objException) {
      // IE 6.0
      ref.style.clip = 'rect(0,auto,auto,0)';
    }
  }
};

Masc.Menu.animations.unfurl = function(ref, counter) {
  if (counter <= 50) {
    ref.style.clip = 'rect(0,' + parseInt(ref.offsetWidth * (counter / 50)) +
     'px,10px,0)';
  } else if (counter < 100) {
    ref.style.clip =  'rect(0,' + ref.offsetWidth + 'px,' +
     parseInt(ref.offsetHeight * ((counter - 50) / 50)) + 'px,0)';
  } else {
    try {
      ref.style.clip = '';
    } catch (objException) {
      // IE 6.0
      ref.style.clip = 'rect(0,auto,auto,0)';
    }
  }
};

/**
 * Called with the name of an animation (in the Masc.Menu.animations[] array)
 * to apply that animation to this menu object.
 *
 * @param {string} animation Name of the animation
 */
Masc.Menu.prototype.addAnimation = function(animation) {
 this.animations[this.animations.length] = Masc.Menu.animations[animation];
};

/**
 * Sets the display/visibility of a specified menu, calling defined animation
 * functions and repeatedly calling itself.
 *
 * @private
 * @param {object} menu HTMLElement object
 * @param {boolean} show True shows, false hides
 */
Masc.Menu.prototype.treeSetDisplay = function(menu, show) {
  // First pass on menu creation: just hide.
  if (!menu.__zp_initialised) {
    menu.style.visibility = 'hidden';
    menu.style.left = '-9999px';
    menu.style.top = '-9999px';
    if (menu.__zp_dropshadow) {
      menu.__zp_dropshadow.style.visibility = 'hidden';
      menu.__zp_dropshadow.style.left = '-9999px';
      menu.__zp_dropshadow.style.top = '-9999px';
    }
    menu.__zp_initialised = true;
    return;
  }

  var treeId = menu.__zp_tree || menu.__zp_menu.firstChild.__zp_tree;
  var tree;
  if (treeId) {
    tree = Masc.Menu.all[treeId];
  }
  if (!tree) {
    return;
  }
  if (tree.animations.length == 0) {
    if (show) {
      menu.style.visibility = 'inherit';
      if (menu.__zp_dropshadow) {
        menu.__zp_dropshadow.style.visibility = 'inherit';
      }
    } else {
      menu.style.visibility = 'hidden';
      menu.style.left = '-9999px';
      menu.style.top = '-9999px';
      if (menu.__zp_dropshadow) {
        menu.__zp_dropshadow.style.visibility = 'hidden';
        menu.__zp_dropshadow.style.left = '-9999px';
        menu.__zp_dropshadow.style.top = '-9999px';
      }
    }
    return;
  }

  // Otherwise animate.
  menu.__zp_anim_timer |= 0;
  clearTimeout(menu.__zp_anim_timer);
  menu.__zp_anim_counter |= 0;

  if (show && !menu.__zp_anim_counter) {
    menu.style.visibility = 'inherit';
    if (menu.__zp_dropshadow) {
      menu.__zp_dropshadow.style.visibility = 'inherit';
    }
  }

  for (var ii = 0; ii < tree.animations.length; ii++) {
    tree.animations[ii](menu, menu.__zp_anim_counter);
    if (menu.__zp_dropshadow
     && tree.animations[ii] != Masc.Menu.animations.fade) {
      tree.animations[ii](menu.__zp_dropshadow, menu.__zp_anim_counter);
    }
  }

  // Iterate
  if (!(show && menu.__zp_anim_counter == 100)) { // Prevent infinite loop
    menu.__zp_anim_counter += tree.config.animSpeed * (show ? 1 : -1);
    if (menu.__zp_anim_counter > 100) {
      // Correction to show menu properly
      menu.__zp_anim_counter = 100;
      menu.__zp_anim_timer = setTimeout(function() {
        tree.treeSetDisplay(menu, show);
      }, 50);
    } else if (menu.__zp_anim_counter <= 0) {
      // Hide menu
      menu.__zp_anim_counter = 0;
      menu.style.visibility = 'hidden';
      menu.style.left = '-9999px';
      menu.style.top = '-9999px';
      if (menu.__zp_dropshadow) {
        menu.__zp_dropshadow.style.visibility = 'hidden';
        menu.__zp_dropshadow.style.left = '-9999px';
        menu.__zp_dropshadow.style.top = '-9999px';
      }
    } else {
      // Next iteration
      menu.__zp_anim_timer = setTimeout(function() {
        tree.treeSetDisplay(menu, show);
      }, 50);
    }
  }
};

// GLOBAL EVENT HANDLERS (to workaround the stupid Microsoft memory leak)

/**
 * Global event handler that gets called when a tree item is moused over.
 * @private
 */
Masc.Menu.onItemMouseOver = function() {
  // Loop up the DOM, dispatch event to correct source item.
  var item = this, tree = null;
  while (item && item != document.body) {
    var t_id = item.__zp_tree || item.firstChild.__zp_tree;
    if (t_id) tree = Masc.Menu.all[t_id];
    var itemClassName = item.className;
    if (/zpMenu-item/.test(itemClassName) && !/zpMenu-item-hr/.test(itemClassName)) {
      tree.itemMouseHandler(item.__zp_item, Masc.Menu.MOUSEOVER);
    }
    item = tree && item.__zp_treeid ?
      tree.items[item.__zp_item] : item.parentNode;
  }
  return true; // To make tooltips work in Opera
};

/**
 * Global event handler that gets called when a tree item is moused out.
 * @private
 */
Masc.Menu.onItemMouseOut = function() {
  var item = this, tree = null;
  while (item && item != document.body) {
    var t_id = item.__zp_tree || item.firstChild.__zp_tree;
    if (t_id) tree = Masc.Menu.all[t_id];
    var itemClassName = item.className;
    if (
     /zpMenu-item/.test(itemClassName) && !/zpMenu-item-hr/.test(itemClassName) &&
     // Top item was not unselected with Esc button
     !(/zpMenu-level-1/.test(itemClassName) && !/zpMenu-item-selected/.test(itemClassName))
    ) {
      tree.itemMouseHandler(item.__zp_item, Masc.Menu.MOUSEOUT);
    }
    item = tree && item.__zp_treeid ?
      tree.items[item.__zp_item] : item.parentNode;
  }
  return false;
};

/**
 * Global event handler that gets called when a tree item is clicked, to make
 * the whole item clickable.
 * @private
 */
Masc.Menu.onItemClick = function(ev) {
  var item = this;
  if (!/zpMenuDisabled/.test(item.className)) {
    while (item && item != document.body) {
      if (item.nodeName && item.nodeName.toLowerCase() == 'a') {
        return true;
      }
      if (/zpMenu-item/.test(item.className)) {
        var objMenu = Masc.Menu.all[item.__zp_tree];
        // Show-on-click mode
        if (objMenu.config.onClick && item.__zp_subtree &&
          (/zpMenu-top/.test(objMenu.trees[item.__zp_parent].className))) {
            objMenu.itemMouseHandler(item.__zp_item, Masc.Menu.CLICK);
            return Masc.Utils.stopEvent(ev);
        }
        // Otherwise navigate the page
        var itemLink = item.getElementsByTagName('a');
        var itemInput = item.getElementsByTagName('input');
        var itemSelect = item.getElementsByTagName('select');
        if (itemLink && itemLink.item(0)
         && itemLink.item(0).getAttribute('href')
         && itemLink.item(0).getAttribute('href') != '#'
         && itemLink.item(0).getAttribute('href') != window.document.location.href + '#'
         && itemLink.item(0).getAttribute('href') != 'javascript:void(0)') {
          var href = itemLink.item(0).getAttribute('href');
          var target = itemLink.item(0).getAttribute('target');
          if (objMenu.config.rememberPath || objMenu.config.pathCookie != '__zp_item') {
            // Save path in cookies
            Masc.Utils.writeCookie(objMenu.config.pathCookie, item.__zp_item);
          }
          try {
            if (target) {
              window.open(href, target);
            } else {
              window.location.href = href; // may raise exception in Mozilla
            }
          } catch(e) {};
          if (objMenu.config.triggerEvent) {
            objMenu.hideMenu();
          }
        } else if (itemInput && itemInput.item(0)) {
          var inp = itemInput.item(0);
          var type = inp.getAttribute('type');
          if (type == 'checkbox') {
            if (inp.checked) {
              inp.checked = false;
            } else {
              inp.checked = true;
            }
          } else if (type == 'radio') {
            inp.checked = true;
          }
        } else if (itemSelect && itemSelect.item(0)) {
          return true; // Pass through
        } else if (item.__zp_subtree) {
          objMenu.itemMouseHandler(item.__zp_item, Masc.Menu.CLICK);
        } else if (objMenu.config.triggerEvent) {
          objMenu.hideMenu();
        }
        return Masc.Utils.stopEvent(ev);
      }
      item = item.parentNode;
    }
  }
  return false;
};

/**
 * Called from the mouse over/out event handlers to process the mouse event and
 * correctly manage timers.
 *
 * @private
 * @param {string} item_id Item ID
 * @param {number} type 0 = mouseout, 1 = mouseover, 2 = click
 */
Masc.Menu.prototype.itemMouseHandler = function(item_id, type) {
  if (type) {
    // Mouseover or click
    // Put this menu on top
    this.putOnTop();
  } else {
    // Mouseout
    // Restore zIndex
    this.restoreZIndex();
  }

  var item = this.items[item_id];
  if (!item) return;
  var menu = this._getTree(item.__zp_parent);

  // If slide animation and Opera, skip mouseover and mouseout events while
  // animating subtree because current item may receive fake mouseout even when
  // mouse pointer is over it and loose cursor. Other solution is needed because
  // submenu may stay expanded due to missing real mouseout event.
  if (type < 2 && window.opera && this.config.slide) {
    var objSubtree = this._getTree(item.__zp_subtree);
    if (objSubtree && objSubtree.__zp_anim_counter &&
     objSubtree.__zp_anim_counter < 100) {
      return;
    }
  }

  // Record an item as lit/shown, and dim/hide any previously lit items.
  if (menu && menu.__zp_activeitem != item_id) {
    if (menu.__zp_activeitem) {
      var lastItem = this.items[menu.__zp_activeitem];
      clearTimeout(lastItem.__zp_dimtimer);
      clearTimeout(lastItem.__zp_mousetimer);
      var objMenu = this;
      setTimeout(function() {
        Masc.Menu.unselectItem(lastItem);
        // Threading bugfix for some menus remaining visible.
        if (lastItem.__zp_state) objMenu.toggleItem(lastItem.__zp_item, false);
        Masc.Menu.selectItem(item);
      }, 0);
    } else {
      setTimeout(function() {
        Masc.Menu.selectItem(item);
      }, 0);
    }
    menu.__zp_activeitem = item_id;
  }

  // Set a timer to dim this item when the whole menu hides.
  clearTimeout(item.__zp_dimtimer);
  if (type == Masc.Menu.MOUSEOUT) {
    item.__zp_dimtimer = setTimeout(function() {
      Masc.Menu.unselectItem(item);
      if (menu.__zp_activeitem == item_id) menu.__zp_activeitem = '';
    }, this.config.hideDelay);
  }

  // Stop any pending show/hide action.
  clearTimeout(item.__zp_mousetimer);
  // Check if this is a click on a first-level menu item.
  if (this.config.onClick && !this.clickDone) {
    if (/zpMenu-top/.test(this.trees[item.__zp_parent].className) &&
      (type == Masc.Menu.MOUSEOVER)) return;
    // Set the flag that enables further onmouseover activity.
    if (type == Masc.Menu.CLICK) this.clickDone = true;
  }

  // Setup show/hide timers.
  if (!item.__zp_state && type) {
    item.__zp_mousetimer = setTimeout('Masc.Menu.all["' +
      item.__zp_tree + '"].itemShow("' + item.__zp_item + '")',
      (this.config.showDelay || 1));
  } else if (item.__zp_state && !type) {
    item.__zp_mousetimer = setTimeout('Masc.Menu.all["' +
      item.__zp_tree + '"].itemHide("' + item.__zp_item + '")',
      (this.config.hideDelay || 1));
  }
};

/**
 * Called from the itemMouseHandler() after a timeout; positions and shows
 * a designated item's branch of the tree.
 *
 * @private
 * @param {string} item_id Item ID to show
 */
Masc.Menu.prototype.itemShow = function(item_id) {
  var item = this.items[item_id];
  if (/zpMenuDisabled/.test(item.className)) {
    return;
  }
  var subMenu = this._getTree(item.__zp_subtree);
  if (!subMenu) {
    return;
  }
  var parMenu = this._getTree(item.__zp_parent);
  // Setting visible here works around MSIE bug where
  // offsetWidth/Height are initially zero.
  if (!subMenu.offsetHeight) {
    subMenu.style.visibility = 'visible';
  }

  // In Opera z-index is not inherited by default
  if (subMenu.style.zIndex === '') {
    subMenu.style.zIndex = 'inherit';
  }

  var subMenuBorderLeft, subMenuBorderTop;
  if (typeof subMenu.clientLeft != 'undefined') { // IE & Opera
    subMenuBorderLeft = subMenu.clientLeft;
    subMenuBorderTop = subMenu.clientTop;
  } else { // Mozilla
    subMenuBorderLeft = (subMenu.offsetWidth - subMenu.clientWidth) / 2;
    subMenuBorderTop = (subMenu.offsetHeight - subMenu.clientHeight) / 2;
  }

  var fc = subMenu.firstChild;
  var subMenuMarginLeft = fc.offsetLeft;
  var subMenuMarginTop = fc.offsetTop;

  // Acquire browser dimensions
  var scrollX = window.pageXOffset || document.body.scrollLeft ||
    document.documentElement.scrollLeft || 0;
  var scrollY = window.pageYOffset || document.body.scrollTop ||
    document.documentElement.scrollTop || 0;
  var objWindowSize = Masc.Utils.getWindowSize();
  var winW = objWindowSize.width;
  var winH = objWindowSize.height;

  // Adjust sub-menu width and height
  if (!subMenu.style.width || !subMenu.style.height) {
    var maxHeight = winH - 7;
    if (subMenu.offsetHeight > maxHeight) {
      // Need scrolling
      // iSubMenuOffsetHeight is needed because IE 5.0 delays with offsetHeight
      // calculation after element is changed
      var iSubMenuOffsetHeight = subMenu.offsetHeight;
      fc.__zp_first = fc.firstChild;
      fc.__zp_last = fc.lastChild;
      var objUp = Masc.Utils.createElement("div");
      objUp.__zp_tree = fc.firstChild.__zp_tree;
      objUp.className = 'zpMenuScrollUpInactive';
      objUp.__zp_mouseover = false;
      objUp.__zp_timer = null;
      // Up arrow handler
      var funcMoveUp = function() {
        var objContainer = objUp.parentNode;
        var iContainerHeight = objContainer.parentNode.clientHeight;
        var objUpArrow = objContainer.firstChild;
        var objDownArrow = objContainer.lastChild;
        // Check if we can move up
        if (objContainer.__zp_first.previousSibling != objUpArrow) {
          // Show first item
          if (objContainer.__zp_first.style.height) {
            // Partly hidden
            objContainer.__zp_first.style.height = '';
            objContainer.__zp_first.style.overflow = '';
          } else {
            // Completely hidden
            objContainer.__zp_first = objContainer.__zp_first.previousSibling;
            objContainer.__zp_first.style.display = 'block';
          }
          var iNewHeight = objContainer.offsetHeight;
          // Hide last item
          while (iNewHeight > iContainerHeight) {
            objContainer.__zp_last.style.display = 'none';
            if (objContainer.__zp_last.style.height) {
              objContainer.__zp_last.style.height = '';
              objContainer.__zp_last.style.overflow = '';
            }
            objContainer.__zp_last = objContainer.__zp_last.previousSibling;
            iNewHeight = objContainer.offsetHeight;
          }
          // Correct height
          var iSpace = iContainerHeight - iNewHeight;
          if (iSpace > 0) {
            // Return last item back and cut it off
            objContainer.__zp_last = objContainer.__zp_last.nextSibling;
            objContainer.__zp_last.style.display = 'block';
            var iItemHeight = iSpace - (objContainer.__zp_last.offsetHeight -
             objContainer.__zp_last.clientHeight);
            if (iItemHeight >= 0) {
              objContainer.__zp_last.style.display = 'none';
              objContainer.__zp_last.style.height = iItemHeight + 'px';
              objContainer.__zp_last.style.overflow = 'hidden';
              objContainer.__zp_last.style.display = 'block';
              iNewHeight = objContainer.offsetHeight;
              // Check height
              if (iNewHeight != iContainerHeight) {
                // May be non-standards-compliant mode
                iItemHeight -= iNewHeight - iContainerHeight;
                if (iItemHeight > 0) {
                  objContainer.__zp_last.style.height = iItemHeight + 'px';
                } else {
                  objContainer.__zp_last.style.display = 'none';
                  objContainer.__zp_last.style.height = '';
                  objContainer.__zp_last.style.overflow = '';
                  objContainer.__zp_last = objContainer.__zp_last.previousSibling;
                }
              }
            } else {
              objContainer.__zp_last.style.display = 'none';
              objContainer.__zp_last = objContainer.__zp_last.previousSibling;
            }
          }
          // Show down arrow
          objDownArrow.className = 'zpMenuScrollDownActive';
          // Hide up arrow if needed
          if (objContainer.__zp_first.previousSibling == objUpArrow) {
            objUpArrow.className = 'zpMenuScrollUpInactive';
          }
          // Continue scrolling
          if (objUp.__zp_timer) clearTimeout(objUp.__zp_timer);
          if (objUp.__zp_mouseover) {
            objUp.__zp_timer = setTimeout(funcMoveUp, 50);
          }
        }
        return true;
      };
      objUp.onmouseover = function() {
        objUp.__zp_mouseover = true;
        return funcMoveUp();
      }
      objUp.onmouseout = function() {
        objUp.__zp_mouseover = false;
        if (objUp.__zp_timer) {
          clearTimeout(objUp.__zp_timer);
          objUp.__zp_timer = null;
        }
      };
      fc.insertBefore(objUp, fc.firstChild);
      var objDown = Masc.Utils.createElement("div");
      objDown.__zp_tree = fc.firstChild.__zp_tree;
      objDown.className = 'zpMenuScrollDownActive';
      objDown.__zp_mouseover = false;
      objDown.__zp_timer = null;
      // Down arrow handler
      var funcMoveDown = function() {
        var objContainer = objDown.parentNode;
        var iContainerHeight = objContainer.parentNode.clientHeight;
        var objUpArrow = objContainer.firstChild;
        var objDownArrow = objContainer.lastChild;
        // Check if we can move down
        if (objContainer.__zp_last.nextSibling != objDownArrow) {
          // Show last item
          if (objContainer.__zp_last.style.height) {
            // Partly hidden
            objContainer.__zp_last.style.height = '';
            objContainer.__zp_last.style.overflow = '';
          } else {
            // Completely hidden
            objContainer.__zp_last = objContainer.__zp_last.nextSibling;
            objContainer.__zp_last.style.display = 'block';
          }
          var iNewHeight = objContainer.offsetHeight;
          // Hide first item
          while (iNewHeight > iContainerHeight) {
            objContainer.__zp_first.style.display = 'none';
            if (objContainer.__zp_first.style.height) {
              objContainer.__zp_first.style.height = '';
              objContainer.__zp_first.style.overflow = '';
            }
            objContainer.__zp_first = objContainer.__zp_first.nextSibling;
            iNewHeight = objContainer.offsetHeight;
          }
          // Correct height
          var iSpace = iContainerHeight - iNewHeight;
          if (iSpace > 0) {
            // Return first item back and cut it off
            objContainer.__zp_first = objContainer.__zp_first.previousSibling;
            objContainer.__zp_first.style.display = 'block';
            var iItemHeight = iSpace - (objContainer.__zp_first.offsetHeight -
             objContainer.__zp_first.clientHeight);
            if (iItemHeight > 0) {
              objContainer.__zp_first.style.display = 'none';
              objContainer.__zp_first.style.height = iItemHeight + 'px';
              objContainer.__zp_first.style.overflow = 'hidden';
              objContainer.__zp_first.style.display = 'block';
              iNewHeight = objContainer.offsetHeight;
              // Check height
              if (iNewHeight != iContainerHeight) {
                // May be non-standards-compliant mode
                iItemHeight -= iNewHeight - iContainerHeight;
                if (iItemHeight > 0) {
                  objContainer.__zp_first.style.height = iItemHeight + 'px';
                } else {
                  objContainer.__zp_first.style.display = 'none';
                  objContainer.__zp_first.style.height = '';
                  objContainer.__zp_first.style.overflow = '';
                  objContainer.__zp_first = objContainer.__zp_first.nextSibling;
                }
              }
            } else {
              objContainer.__zp_first.style.display = 'none';
              objContainer.__zp_first = objContainer.__zp_first.nextSibling;
            }
          }
          // Show up arrow
          objUpArrow.className = 'zpMenuScrollUpActive';
          // Hide down arrow if needed
          if (objContainer.__zp_last.nextSibling == objDownArrow) {
            objDownArrow.className = 'zpMenuScrollDownInactive';
          }
          // Continue scrolling
          if (objDown.__zp_timer) clearTimeout(objDown.__zp_timer);
          if (objDown.__zp_mouseover) {
            objDown.__zp_timer = setTimeout(funcMoveDown, 50);
          }
        }
        return true;
      };
      objDown.onmouseover = function() {
        objDown.__zp_mouseover = true;
        return funcMoveDown();
      }
      objDown.onmouseout = function() {
        objDown.__zp_mouseover = false;
        if (objDown.__zp_timer) {
          clearTimeout(objDown.__zp_timer);
          objDown.__zp_timer = null;
        }
      };
      fc.appendChild(objDown);
      var lc = fc.__zp_last;
      iSubMenuOffsetHeight += objUp.offsetHeight + objDown.offsetHeight;
      while (iSubMenuOffsetHeight > maxHeight) {
        iSubMenuOffsetHeight -= lc.offsetHeight;
        lc.style.display = 'none';
        lc = lc.previousSibling;
        fc.__zp_last = lc;
      }
    }
    var width = fc.offsetWidth;
    var height = fc.offsetHeight;
    if (typeof subMenu.clientLeft != 'undefined' && !window.opera &&
     !(document.compatMode && document.compatMode == 'CSS1Compat')) {
      // IE in non-standards-compliant mode
      width += subMenuBorderLeft * 2 + subMenuMarginLeft * 2;
      height += subMenuBorderTop * 2 + subMenuMarginTop * 2;
    }
    subMenu.style.width = width + 'px';
    subMenu.style.height = height + 'px';
    if (subMenu.__zp_dropshadow) {
      subMenu.__zp_dropshadow.style.width = subMenu.offsetWidth + 'px';
      subMenu.__zp_dropshadow.style.height = subMenu.offsetHeight + 'px';
    }
    fc.style.position = 'absolute';
    fc.style.visibility = 'inherit';
  }

  // Calculate new menu position & check document boundaries.
  var newLeft = 0, newTop = 0;
  var menuPos = Masc.Utils.getAbsolutePos(parMenu);
  if ((/zpMenu-top/.test(this.trees[item.__zp_parent].className)) && (!(this.config.vertical))) {
    // Drop Down menus
    newLeft = item.offsetLeft;
    newTop = item.offsetHeight;
    // Adjust menu direction if it will display outside visible area
    if (menuPos.x + newLeft + subMenu.offsetWidth + subMenuMarginLeft + 7 > scrollX + winW) {
      newLeft += item.offsetWidth - subMenu.offsetWidth - subMenuMarginLeft;
      if (subMenu.__zp_dropshadow) newLeft -= 6;
    } else {
      newLeft -= subMenuBorderLeft;
    }
    if (menuPos.y + newTop + subMenu.offsetHeight + subMenuMarginTop + 7 > scrollY + winH) {
      newTop = -subMenu.offsetHeight;
      if (subMenu.__zp_dropshadow) newTop -= 5;
    }
  } else {
    // Vertical menus
    newLeft = item.offsetWidth;
    newTop = item.offsetTop;
    // Adjust menu direction if it will display outside visible area
    if (menuPos.x + newLeft + subMenu.offsetWidth + subMenuMarginLeft + 7 > scrollX + winW) {
      newLeft = -subMenu.offsetWidth;
      if (subMenu.__zp_dropshadow) newLeft -= 5;
    }
    if (menuPos.y + newTop + subMenu.offsetHeight + subMenuMarginTop + 7 > scrollY + winH) {
      newTop -= subMenu.offsetHeight - item.offsetHeight;
      if (subMenu.__zp_dropshadow) newTop -= 5;
    } else {
      newTop -= subMenuBorderTop;
    }
  }
  if (menuPos.x + newLeft < 0) {
    newLeft = 0 - menuPos.x;
  }
  if (menuPos.y + newTop < 0) {
    newTop = 0 - menuPos.y;
  }
  subMenu.style.left = newLeft + 'px';
  subMenu.style.top = newTop + 'px';
  if (subMenu.__zp_dropshadow) {
    subMenu.__zp_dropshadow.style.left = newLeft + 5 + 'px';
    subMenu.__zp_dropshadow.style.top = newTop + 5 + 'px';
  }

  // Apply MSIE 5.5+ Select Box fix last, so it corrects the dropshadow.
  if (Masc.is_ie && !Masc.is_ie5) {
    if (!subMenu.__zp_wch) {
      subMenu.__zp_wch = Masc.Utils.createWCH(subMenu);
    }
    subMenu.__zp_wch.style.zIndex = -1;
    if (this.config.dropShadow) {
      Masc.Utils.setupWCH(subMenu.__zp_wch, -subMenuBorderLeft, -subMenuBorderTop, subMenu.offsetWidth + 6, subMenu.offsetHeight + 5);
    } else {
      Masc.Utils.setupWCH(subMenu.__zp_wch, -subMenuBorderLeft, -subMenuBorderTop, subMenu.offsetWidth, subMenu.offsetHeight);
    }
  }

  this.toggleItem(item_id, true);
};

/**
 * Called from the itemMouseHandler() after a timeout; hides a designated item's
 * branch of the tree.
 *
 * @private
 * @param {string} item_id Item ID to hide
 */
Masc.Menu.prototype.itemHide = function(item_id) {
  var item = this.items[item_id];
  var subMenu = this._getTree(item.__zp_subtree);
  var parMenu = this._getTree(item.__zp_parent);
  if (subMenu) {
    this.toggleItem(item_id, false);
    parMenu.__zp_activeitem = '';
    subMenu.__zp_activeitem = '';
    // Go no further if some items are still expanded.
    for (var i in this.items) {
      if (this.items[i].__zp_state) return;
    }
    // Another click is necessary to activate menu again.
    this.clickDone = false;
  }
};

/*
 * dndmove Drag'n'drop (move menu) functions
 *
 * Contains some functions that implement menu "drag'n'drop" facility which
 * allows one to move the menu around the browser's view.
 *
 */
//@{

/**
 * Starts dragging the element.
 *
 * @private
 * @param {object} ev Event object
 * @param {object} menu Masc.Menu object
 * @return Always true
 * @type boolean
 */
Masc.Menu.dragStart = function (ev, menu) {
  ev || (ev = window.event);
  if (menu.dragging) {
    return true;
  }
  var rootMenu = menu.rootMenu;
  if (!(/(absolute|fixed)/).test(rootMenu.style.position)) {
    rootMenu.style.position = 'absolute';
    var pos = Masc.Utils.getAbsolutePos(rootMenu);
    rootMenu.style.left = pos.x + 'px';
    rootMenu.style.top = pos.y + 'px';
  }
  var testElm = ev.srcElement || ev.target;
  while (1) {
    if (testElm == rootMenu) break;
    else testElm = testElm.parentNode;
    if (!testElm) return true;
  }
  menu.dragging = true;
  var posX = ev.pageX || ev.clientX + window.document.body.scrollLeft || 0;
  var posY = ev.pageY || ev.clientY + window.document.body.scrollTop || 0;
  var L = parseInt(rootMenu.style.left) || 0;
  var T = parseInt(rootMenu.style.top) || 0;
  menu.xOffs = (posX - L);
  menu.yOffs = (posY - T);
  // Unregister from scroll
  if (menu.config.scrollWithWindow) {
    Masc.ScrollWithWindow.unregister(menu.rootMenu);
  }
};

/**
 * Called at mouseover and/or mousemove on document, this function repositions
 * the menu according to the current mouse position.
 *
 * @private
 * @param {object} ev Event object
 * @param {object} menu Masc.Menu object
 * @return Always false
 * @type boolean
 */
Masc.Menu.dragMove = function (ev, menu) {
  ev || (ev = window.event);
  var rootMenu = menu.rootMenu;
  if (!(menu && menu.dragging)) {
    return false;
  }
  var posX = ev.pageX || ev.clientX + window.document.body.scrollLeft || 0;
  var posY = ev.pageY || ev.clientY + window.document.body.scrollTop || 0;
  var st = rootMenu.style, L = posX - menu.xOffs, T = posY - menu.yOffs;
  st.left = L + "px";
  st.top = T + "px";
  return Masc.Utils.stopEvent(ev);
};

/**
 * Gets called when the drag and drop operation is finished; thus, at onmouseup
 *
 * @private
 * @param {object} ev Event object
 * @param {object} menu Masc.Menu object
 */
Masc.Menu.dragEnd = function (ev, menu) {
  if (!menu) {
    return false;
  }
  if (menu.dragging) {
    menu.dragging = false;
    // Adjust menu position if it will display outside visible area
    var rootMenu = menu.rootMenu;
    var st = rootMenu.style, L = parseInt(st.left), T = parseInt(st.top);
    var scrollX = window.pageXOffset || document.body.scrollLeft ||
      document.documentElement.scrollLeft || 0;
    var scrollY = window.pageYOffset || document.body.scrollTop ||
      document.documentElement.scrollTop || 0;
    var objWindowSize = Masc.Utils.getWindowSize();
    var winW = objWindowSize.width;
    var winH = objWindowSize.height;
    if (L < 0) {
      st.left = '0px';
    } else if (L + rootMenu.offsetWidth > scrollX + winW) {
      st.left = scrollX + winW - rootMenu.offsetWidth + 'px';
    }
    if (T < 0) {
      st.top = '0px';
    } else if (T + rootMenu.offsetHeight > scrollY + winH) {
      st.top = scrollY + winH - rootMenu.offsetHeight + 'px';
    }
    // Restore to scroll
    if (menu.config.scrollWithWindow) {
      Masc.ScrollWithWindow.register(rootMenu);
    }
  }
};

//@}

/**
 * Disables item from an external script.
 *
 * <xmp>
 * Example:
 * <ul id="myMenu">
 *  <li id="itemToDisable">Menu Item</li>
 * </ul>
 * <script type="text/javascript">
 *  var menu = new Masc.Menu('myMenu', {});
 *  menu.itemDisable('itemToDisable');
 * </script>
 * </xmp>
 *
 * @param {string} item_id Item ID to disable
 */
Masc.Menu.prototype.itemDisable = function(item_id) {
  var item = this.items[item_id];
  if (item) {
    // item_id exists
    Masc.Utils.addClass(item, "zpMenuDisabled");
  }
};

/**
 * Enables previously disabled item from an external script.
 *
 * @param {string} item_id Item ID to enable
 */
Masc.Menu.prototype.itemEnable = function(item_id) {
  var item = this.items[item_id];
  if (item) {
    // item_id exists
    Masc.Utils.removeClass(item, "zpMenuDisabled");
  }
};

/**
 * Hides previously open trigger menu and shows trigger menu. Called from
 * trigger event handler.
 *
 * @private
 * @param {number} iLeft Optional. Left position of trigger menu
 * @param {number} iTop Optional. Top position of trigger menu
 */
Masc.Menu.prototype.popupMenu = function(iLeft, iTop) {
  // Hide previously open trigger menu
  for (var menuId in Masc.Menu.all) {
    // Needed for IE 5.0
    if (!Masc.Menu.all.hasOwnProperty(menuId)) {
      continue;
    }
    var menu = Masc.Menu.all[menuId];
    if (menu.config.triggerEvent) { // Is trigger menu
      menu.hideMenu();
    }
  }
  // Show trigger menu
  if (arguments.length > 1) {
    this.showMenu(iLeft, iTop);
  } else {
    this.showMenu();
  }
};

/**
 * Shows menu.
 *
 * @private
 * @param {number} iLeft Optional. Left position of trigger menu
 * @param {number} iTop Optional. Top position of trigger menu
 */
Masc.Menu.prototype.showMenu = function(iLeft, iTop) {
  var objTopParent = this.top_parent;
  var objMenu = objTopParent.__zp_menu;
  // Get window dimensions
  var objWindowSize = Masc.Utils.getWindowSize();
  var iScrollX = Masc.Utils.getPageScrollX();
  var iScrollY = Masc.Utils.getPageScrollY();
  // Set position
  if (arguments.length > 1) {
    objTopParent.style.position = 'absolute';
    objTopParent.style.left = iLeft + 'px';
    objTopParent.style.top = iTop + 'px';
  }
  // Show menu
  objTopParent.style.display = 'block';
  // Prevent showing of horizontal menu in several lines
  // and fix different items width in vertical menu Mozilla issue
  if (!objMenu.style.width) {
    if (objMenu.childNodes) {
      // Calculate menu width
      var iMenuWidth = 0;
      for (var iItem = 0; iItem < objMenu.childNodes.length; iItem++) {
        var objItem = objMenu.childNodes[iItem];
        var iItemMargin = 0;
        if (iItem == 0) {
          // Assume margin-right is 0 because we can't determine it
          iItemMargin = objItem.offsetLeft;
        }
        if (this.config.vertical) {
          if (objItem.offsetWidth > iMenuWidth) {
            iMenuWidth = objItem.offsetWidth + iItemMargin;
          }
        } else {
          iMenuWidth += objItem.offsetWidth + iItemMargin;
        }
      }
      // + menu border
      if (typeof objMenu.clientLeft != 'undefined') { // IE & Opera
        iMenuWidth += objMenu.clientLeft * 2;
      } else { // Mozilla
        iMenuWidth += objMenu.offsetWidth - objMenu.clientWidth;
      }
      // Set menu width
      if (objMenu.clientWidth > iMenuWidth) {
        objMenu.style.width = objMenu.clientWidth + 'px';
      } else {
        objMenu.style.width = iMenuWidth + 'px';
      }
    }
  }
  // Adjust position
  if (arguments.length > 1) {
    if (iLeft + objTopParent.offsetWidth > iScrollX + objWindowSize.width) {
      objTopParent.style.left =
       iScrollX + objWindowSize.width - objTopParent.offsetWidth + 'px';
    }
    if (iTop + objTopParent.offsetHeight > iScrollY + objWindowSize.height) {
      objTopParent.style.top =
       iScrollY + objWindowSize.height - objTopParent.offsetHeight + 'px';
    }
  } else {
    if (typeof this.config.top != 'object' ||
     typeof this.config.right != 'object' ||
     typeof this.config.bottom != 'object' ||
     typeof this.config.left != 'object') { // null is of object type 
      objTopParent.style.position = 'absolute';
      if (typeof this.config.top != 'object') {
        objTopParent.style.top = parseInt(this.config.top) + 'px';
      } else if (typeof this.config.bottom != 'object') {
        objTopParent.style.top =
         (objWindowSize.height - parseInt(this.config.bottom) -
         objMenu.offsetHeight -
         (objTopParent.offsetHeight - objTopParent.clientHeight)) + 'px';
      }
      if (typeof this.config.left != 'object') {
        objTopParent.style.left = parseInt(this.config.left) + 'px';
      } else if (typeof this.config.right != 'object') {
        objTopParent.style.left =
         (objWindowSize.width - parseInt(this.config.right) -
         objMenu.offsetWidth -
         (objTopParent.offsetWidth - objTopParent.clientWidth)) + 'px';
      }
    } else if (window.opera &&
     (this.config.drag || this.config.scrollWithWindow)) {
      objTopParent.style.position = 'absolute';
      var pos = Masc.Utils.getAbsolutePos(objTopParent);
      objTopParent.style.left = pos.x + 'px';
      objTopParent.style.top = pos.y + 'px';
    }
  }
  // Set z-index
  objTopParent.style.zIndex = this.config.zIndex;
  // Highlight path
  if ((this.config.rememberPath || this.config.pathCookie != '__zp_item') &&
   this.path) {
    this.highlightPath(this.path);
    if (this.config.rememberPath == 'expand') {
      this.sync(this.path);
    }
  }
  // Apply MSIE 5.5+ Select Box fix
  if (Masc.is_ie && !Masc.is_ie5) {
    if (!objTopParent.__zp_wch) {
      objTopParent.__zp_wch = Masc.Utils.createWCH(objTopParent);
    }
    objTopParent.__zp_wch.style.zIndex = -1;
    Masc.Utils.setupWCH(objTopParent.__zp_wch,
     -objTopParent.clientLeft, -objTopParent.clientTop,
     objTopParent.offsetWidth, objTopParent.offsetHeight);
  }
};

/**
 * Hides trigger menu.
 * @private
 */
Masc.Menu.prototype.hideMenu = function() {
  this.collapseAll();
  this.top_parent.style.display = 'none';
};

/**
 * Array that keeps mouseovered items of all menus on the page. It is used to
 * determine which menu and which item is active now to be able to use keyboard
 * arrows, Enter, Esc buttons for menu navigation. Used in keyboard navigation
 * module.
 * @private
 */
Masc.Menu.selectedItemsStack = [];

/**
 * Adds item to zpMenu-item-selected class and selectedItemsStack.
 *
 * @private
 * @param {object} item DIV element holding the item
 */
Masc.Menu.selectItem = function(item) {
  Masc.Utils.addClass(item, "zpMenu-item-selected");
  if (/zpMenu-item-collapsed/i.test(item.className)) {
    Masc.Utils.addClass(item, "zpMenu-item-selected-collapsed");
  }
  // Remove item from stack
  for (var i = Masc.Menu.selectedItemsStack.length - 1; i >= 0; i--) {
    if (Masc.Menu.selectedItemsStack[i] == item) {
      Masc.Menu.selectedItemsStack.splice(i, 1);
    }
  }
  // Add item to stack
  Masc.Menu.selectedItemsStack.push(item);
};

/**
 * Removes item from zpMenu-item-selected class and selectedItemsStack.
 *
 * @private
 * @param {object} item DIV element holding the item
 */
Masc.Menu.unselectItem = function(item) {
  Masc.Utils.removeClass(item, "zpMenu-item-selected");
  Masc.Utils.removeClass(item, "zpMenu-item-selected-collapsed");
  // Remove item from stack
  for (var i = Masc.Menu.selectedItemsStack.length - 1; i >= 0; i--) {
    if (Masc.Menu.selectedItemsStack[i] == item) {
      Masc.Menu.selectedItemsStack.splice(i, 1);
    }
  }
};
