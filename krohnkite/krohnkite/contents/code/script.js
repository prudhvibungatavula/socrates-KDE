"use strict";
const WindowState = {
    Unmanaged: 1,
    NativeFullscreen: 2,
    NativeMaximized: 3,
    Floating: 4,
    Maximized: 5,
    Tiled: 6,
    TiledAfloat: 7,
    Undecided: 8,
    Dragging: 9,
    Docked: 10,
};
const WindowStateKeys = Object.keys(WindowState);
let windowStateStr = (state) => {
    return WindowStateKeys[state - 1];
};
const Shortcut = {
    FocusNext: "FocusNext",
    FocusPrev: "FocusPrev",
    DWMLeft: "DWMLeft",
    DWMRight: "DWMRight",
    FocusUp: "FocusUp",
    FocusDown: "FocusDown",
    FocusLeft: "FocusLeft",
    FocusRight: "FocusRight",
    ShiftLeft: "ShiftLeft",
    ShiftRight: "ShiftRight",
    ShiftUp: "ShiftUp",
    ShiftDown: "ShiftDown",
    SwapUp: "SwapUp",
    SwapDown: "SwapDown",
    SwapLeft: "SwapLeft",
    SwapRight: "SwapRight",
    GrowWidth: "GrowWidth",
    GrowHeight: "GrowHeight",
    ShrinkWidth: "ShrinkWidth",
    ShrinkHeight: "ShrinkHeight",
    Increase: "Increase",
    Decrease: "Decrease",
    ShiftIncrease: "ShiftIncrease",
    ShiftDecrease: "ShiftDecrease",
    ToggleFloat: "ToggleFloat",
    ToggleFloatAll: "ToggleFloatAll",
    SetMaster: "SetMaster",
    NextLayout: "NextLayout",
    PreviousLayout: "PreviousLayout",
    SetLayout: "SetLayout",
    Rotate: "Rotate",
    RotatePart: "RotatePart",
    ToggleDock: "ToggleDock",
    RaiseSurfaceCapacity: "RaiseSurfaceCapacity",
    LowerSurfaceCapacity: "LowerSurfaceCapacity",
    KrohnkiteMeta: "KrohnkiteMeta",
    ResetSurfaceCapacity: "ResetSurfaceCapacity",
};
const LogModules = {
    newWindowAdded: "newWindowAdded",
    newWindowFiltered: "newWindowFiltered",
    newWindowUnmanaged: "newWindowUnmanaged",
    screensChanged: "screensChanged",
    virtualScreenGeometryChanged: "virtualScreenGeometryChanged",
    currentActivityChanged: "currentActivityChanged",
    currentDesktopChanged: "currentDesktopChanged",
    windowAdded: "windowAdded",
    windowActivated: "windowActivated",
    windowRemoved: "windowRemoved",
    surfaceChanged: "surfaceChanged",
    activitiesChanged: "activitiesChanged",
    bufferGeometryChanged: "bufferGeometryChanged",
    desktopsChanged: "desktopsChanged",
    fullScreenChanged: "fullScreenChanged",
    interactiveMoveResizeStepped: "interactiveMoveResizeStepped",
    maximizedAboutToChange: "maximizedAboutToChange",
    minimizedChanged: "minimizedChanged",
    moveResizedChanged: "moveResizedChanged",
    outputChanged: "outputChanged",
    shortcut: "shortcut",
    arrangeScreen: "arrangeScreen",
    printConfig: "printConfig",
    setTimeout: "setTimeout",
    window: "window",
};
const LogPartitions = {
    newWindow: {
        number: 100,
        name: "newWindow",
        modules: [
            LogModules.newWindowAdded,
            LogModules.newWindowFiltered,
            LogModules.newWindowUnmanaged,
        ],
    },
    workspaceSignals: {
        number: 200,
        name: "workspaceSignal",
        modules: [
            LogModules.screensChanged,
            LogModules.virtualScreenGeometryChanged,
            LogModules.currentActivityChanged,
            LogModules.currentDesktopChanged,
            LogModules.windowAdded,
            LogModules.windowActivated,
            LogModules.windowRemoved,
            LogModules.surfaceChanged,
        ],
    },
    windowSignals: {
        number: 300,
        name: "windowSignal",
        modules: [
            LogModules.activitiesChanged,
            LogModules.bufferGeometryChanged,
            LogModules.desktopsChanged,
            LogModules.fullScreenChanged,
            LogModules.interactiveMoveResizeStepped,
            LogModules.maximizedAboutToChange,
            LogModules.minimizedChanged,
            LogModules.moveResizedChanged,
            LogModules.outputChanged,
        ],
    },
    other: {
        number: 1000,
        name: "other",
        modules: [
            LogModules.shortcut,
            LogModules.arrangeScreen,
            LogModules.printConfig,
            LogModules.setTimeout,
            LogModules.window,
        ],
    },
};
let CONFIG;
let LOG;
class Dock {
    constructor(cfg, priority = 0) {
        this.renderedOutputId = "";
        this.renderedTime = null;
        this.priority = priority;
        this.position = null;
        this.cfg = Object.assign({}, cfg);
        this.autoDock = false;
    }
    clone() {
        let dock = new Dock(this.cfg, this.priority);
        dock.renderedOutputId = this.renderedOutputId;
        dock.renderedTime = this.renderedTime;
        dock.position = this.position;
        dock.autoDock = this.autoDock;
        return dock;
    }
}
const DockPosition = {
    left: 1,
    right: 2,
    top: 3,
    bottom: 4,
};
const HDockAlignment = {
    center: 1,
    left: 2,
    right: 3,
};
const VDockAlignment = {
    center: 1,
    top: 2,
    bottom: 3,
};
const EdgeAlignment = {
    outside: 1,
    middle: 2,
    inside: 3,
};
class DefaultDockCfg {
    constructor() {
        let hHeight = validateNumber(CONFIG.dockHHeight, 1, 50);
        if (hHeight instanceof Err) {
            warning(`getDefaultCfg: hHeight: ${hHeight}`);
            this.hHeight = 25;
        }
        else
            this.hHeight = hHeight;
        let hWide = validateNumber(CONFIG.dockHWide, 1, 100);
        if (hWide instanceof Err) {
            warning(`getDefaultCfg: hWide: ${hWide}`);
            this.hWide = 100;
        }
        else
            this.hWide = hWide;
        let vHeight = validateNumber(CONFIG.dockVHeight, 1, 100);
        if (vHeight instanceof Err) {
            warning(`getDefaultCfg: vHeight: ${vHeight}`);
            this.vHeight = 100;
        }
        else
            this.vHeight = vHeight;
        let vWide = validateNumber(CONFIG.dockVWide, 1, 50);
        if (vWide instanceof Err) {
            warning(`getDefaultCfg: vWide: ${vWide}`);
            this.vWide = 25;
        }
        else
            this.vWide = vWide;
        let hGap = validateNumber(CONFIG.dockHGap);
        if (hGap instanceof Err) {
            warning(`getDefaultCfg: hGap: ${hGap}`);
            this.hGap = 0;
        }
        else
            this.hGap = hGap;
        let hEdgeGap = validateNumber(CONFIG.dockHEdgeGap);
        if (hEdgeGap instanceof Err) {
            warning(`getDefaultCfg: hEdgeGap: ${hEdgeGap}`);
            this.hEdgeGap = 0;
        }
        else
            this.hEdgeGap = hEdgeGap;
        let vGap = validateNumber(CONFIG.dockVGap);
        if (vGap instanceof Err) {
            warning(`getDefaultCfg: vGap: ${vGap}`);
            this.vGap = 0;
        }
        else
            this.vGap = vGap;
        let vEdgeGap = validateNumber(CONFIG.dockVEdgeGap);
        if (vEdgeGap instanceof Err) {
            warning(`getDefaultCfg: vEdgeGap: ${vEdgeGap}`);
            this.vEdgeGap = 0;
        }
        else
            this.vEdgeGap = vEdgeGap;
        let hAlignmentNumber = validateNumber(CONFIG.dockHAlignment);
        if (hAlignmentNumber instanceof Err) {
            warning(`getDefaultCfg: hAlignment: ${hAlignmentNumber}`);
            this.hAlignment = HDockAlignment.center;
        }
        else {
            switch (hAlignmentNumber) {
                case 0:
                    this.hAlignment = HDockAlignment.center;
                    break;
                case 1:
                    this.hAlignment = HDockAlignment.left;
                    break;
                case 2:
                    this.hAlignment = HDockAlignment.right;
                    break;
                default:
                    warning(`getDefaultCfg: hAlignment:${hAlignmentNumber} is not a valid alignment`);
                    this.hAlignment = HDockAlignment.center;
                    break;
            }
        }
        let hEdgeAlignmentNumber = validateNumber(CONFIG.dockHEdgeAlignment);
        if (hEdgeAlignmentNumber instanceof Err) {
            warning(`getDefaultCfg: hEdgeAlignment: ${hEdgeAlignmentNumber}`);
            this.hEdgeAlignment = EdgeAlignment.outside;
        }
        else {
            switch (hEdgeAlignmentNumber) {
                case 0:
                    this.hEdgeAlignment = EdgeAlignment.outside;
                    break;
                case 1:
                    this.hEdgeAlignment = EdgeAlignment.middle;
                    break;
                case 2:
                    this.hEdgeAlignment = EdgeAlignment.inside;
                    break;
                default:
                    warning(`getDefaultCfg: hEdgeAlignment:${hEdgeAlignmentNumber} is not a valid alignment`);
                    this.hEdgeAlignment = EdgeAlignment.outside;
                    break;
            }
        }
        let vAlignmentNumber = validateNumber(CONFIG.dockVAlignment);
        if (vAlignmentNumber instanceof Err) {
            warning(`getDefaultCfg: vAlignment: ${vAlignmentNumber}`);
            this.vAlignment = VDockAlignment.center;
        }
        else {
            switch (vAlignmentNumber) {
                case 0:
                    this.vAlignment = VDockAlignment.center;
                    break;
                case 1:
                    this.vAlignment = VDockAlignment.top;
                    break;
                case 2:
                    this.vAlignment = VDockAlignment.bottom;
                    break;
                default:
                    warning(`getDefaultCfg: vAlignment: ${vAlignmentNumber} is not valid alignment`);
                    this.vAlignment = VDockAlignment.center;
                    break;
            }
        }
        let vEdgeAlignmentNumber = validateNumber(CONFIG.dockVEdgeAlignment);
        if (vEdgeAlignmentNumber instanceof Err) {
            warning(`getDefaultCfg: vEdgeAlignment: ${vEdgeAlignmentNumber}`);
            this.vEdgeAlignment = EdgeAlignment.outside;
        }
        else {
            switch (vEdgeAlignmentNumber) {
                case 0:
                    this.vEdgeAlignment = EdgeAlignment.outside;
                    break;
                case 1:
                    this.vEdgeAlignment = EdgeAlignment.middle;
                    break;
                case 2:
                    this.vEdgeAlignment = EdgeAlignment.inside;
                    break;
                default:
                    warning(`getDefaultCfg: vEdgeAlignment:${vEdgeAlignmentNumber} is not a valid alignment`);
                    this.vEdgeAlignment = EdgeAlignment.outside;
                    break;
            }
        }
    }
    static get instance() {
        if (!DefaultDockCfg._dockInstance) {
            DefaultDockCfg._dockInstance = new DefaultDockCfg();
        }
        return DefaultDockCfg._dockInstance;
    }
    cloneAndUpdate(cfg) {
        return Object.assign({}, DefaultDockCfg.instance, cfg);
    }
}
class DockEntry {
    constructor(cfg, id) {
        this.surfaceCfg = cfg;
        this._slots = this.parseSlots();
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get slots() {
        return this._slots;
    }
    remove(window) {
        for (let slot of this.slots) {
            if (slot.window === window) {
                slot.window = null;
                break;
            }
        }
    }
    arrange(dockedWindows, workingArea) {
        const IS_WIDE = workingArea.width > workingArea.height;
        let dockCfg;
        let renderedTime = new Date().getTime();
        let renderedOutputId = this.id;
        this.arrangeSlots(dockedWindows);
        this.assignSizes(workingArea);
        const leftSlot = this.getSlot(DockPosition.left);
        const rightSlot = this.getSlot(DockPosition.right);
        const topSlot = this.getSlot(DockPosition.top);
        const bottomSlot = this.getSlot(DockPosition.bottom);
        let leftBorder = workingArea.x;
        let width = workingArea.width;
        let topBorder = workingArea.y;
        let height = workingArea.height;
        function leftSlotArrange() {
            if (leftSlot !== null) {
                dockCfg = leftSlot.window.dock.cfg;
                let leftSlotHeight = Math.min((workingArea.height * dockCfg.vHeight) / 100, height);
                let initRect = new Rect(leftBorder, topBorder, (workingArea.width * dockCfg.vWide) / 100, leftSlotHeight);
                leftBorder = leftBorder + initRect.width;
                width = width - initRect.width;
                leftSlot.window.geometry = DockEntry.align(initRect, leftSlot.position, dockCfg, height);
                leftSlot.window.dock.renderedTime = renderedTime;
                leftSlot.window.dock.renderedOutputId = renderedOutputId;
            }
        }
        function rightSlotArrange() {
            if (rightSlot !== null) {
                dockCfg = rightSlot.window.dock.cfg;
                let rightSlotHeight = Math.min((workingArea.height * dockCfg.vHeight) / 100, height);
                let initRect = new Rect(workingArea.x +
                    workingArea.width -
                    (workingArea.width * dockCfg.vWide) / 100, topBorder, (workingArea.width * dockCfg.vWide) / 100, rightSlotHeight);
                width = width - initRect.width;
                rightSlot.window.geometry = DockEntry.align(initRect, rightSlot.position, dockCfg, height);
                rightSlot.window.dock.renderedTime = renderedTime;
                rightSlot.window.dock.renderedOutputId = renderedOutputId;
            }
        }
        function topSlotArrange() {
            if (topSlot !== null) {
                dockCfg = topSlot.window.dock.cfg;
                let topSlotWidth = Math.min((workingArea.width * dockCfg.hWide) / 100, width);
                let initRect = new Rect(leftBorder, topBorder, topSlotWidth, (workingArea.height * dockCfg.hHeight) / 100);
                topBorder = topBorder + initRect.height;
                height = height - initRect.height;
                topSlot.window.geometry = DockEntry.align(initRect, topSlot.position, dockCfg, width);
                topSlot.window.dock.renderedTime = renderedTime;
                topSlot.window.dock.renderedOutputId = renderedOutputId;
            }
        }
        function bottomSlotArrange() {
            if (bottomSlot !== null) {
                dockCfg = bottomSlot.window.dock.cfg;
                let bottomSlotWidth = Math.min((workingArea.width * dockCfg.hWide) / 100, width);
                let initRect = new Rect(leftBorder, workingArea.y +
                    workingArea.height -
                    (workingArea.height * dockCfg.hHeight) / 100, bottomSlotWidth, (workingArea.height * dockCfg.hHeight) / 100);
                height = height - initRect.height;
                bottomSlot.window.geometry = DockEntry.align(initRect, bottomSlot.position, dockCfg, width);
                bottomSlot.window.dock.renderedTime = renderedTime;
                bottomSlot.window.dock.renderedOutputId = renderedOutputId;
            }
        }
        if (IS_WIDE) {
            leftSlotArrange();
            rightSlotArrange();
            topSlotArrange();
            bottomSlotArrange();
        }
        else {
            topSlotArrange();
            bottomSlotArrange();
            leftSlotArrange();
            rightSlotArrange();
        }
        return new Rect(leftBorder, topBorder, width, height);
    }
    handleShortcut(window, shortcut) {
        const slot = this.getSlotByWindow(window);
        let desiredPosition;
        if (!slot || !window.dock) {
            return false;
        }
        switch (shortcut) {
            case Shortcut.SwapLeft:
                desiredPosition = DockPosition.left;
                break;
            case Shortcut.SwapUp:
                desiredPosition = DockPosition.top;
                break;
            case Shortcut.SwapRight:
                desiredPosition = DockPosition.right;
                break;
            case Shortcut.SwapDown:
                desiredPosition = DockPosition.bottom;
                break;
            default:
                return false;
        }
        if (slot.position !== desiredPosition) {
            const desiredSlot = this.getSlotByPosition(desiredPosition);
            if (desiredSlot !== null && desiredSlot.window === null) {
                window.dock.position = desiredPosition;
                return true;
            }
        }
        return false;
    }
    static align(initRect, position, cfg, wholeSize) {
        let leftBorder = initRect.x;
        let topBorder = initRect.y;
        let width = initRect.width;
        let height = initRect.height;
        switch (position) {
            case DockPosition.left:
            case DockPosition.right:
                [width, leftBorder] = DockEntry.alignEdge(width, leftBorder, cfg.vEdgeGap, position, cfg.vEdgeAlignment);
                if (2 * cfg.vGap < height) {
                    if (wholeSize - height < 2 * cfg.vGap) {
                        topBorder = topBorder + cfg.vGap;
                        height = height - 2 * cfg.vGap;
                    }
                    else if (cfg.vAlignment === VDockAlignment.top) {
                        topBorder = topBorder + cfg.vGap;
                    }
                    else if (cfg.vAlignment === VDockAlignment.center) {
                        topBorder = topBorder + (wholeSize - height) / 2;
                    }
                    else if (cfg.vAlignment === VDockAlignment.bottom) {
                        topBorder = topBorder + (wholeSize - height - cfg.vGap);
                    }
                }
                return new Rect(leftBorder, topBorder, width, height);
            case DockPosition.top:
            case DockPosition.bottom:
                [height, topBorder] = DockEntry.alignEdge(height, topBorder, cfg.hEdgeGap, position, cfg.hEdgeAlignment);
                if (2 * cfg.hGap < width) {
                    if (wholeSize - width < 2 * cfg.hGap) {
                        leftBorder = leftBorder + cfg.hGap;
                        width = width - 2 * cfg.hGap;
                    }
                    else if (cfg.hAlignment === HDockAlignment.left) {
                        leftBorder = leftBorder + cfg.hGap;
                    }
                    else if (cfg.hAlignment === HDockAlignment.center) {
                        leftBorder = leftBorder + (wholeSize - width) / 2;
                    }
                    else if (cfg.hAlignment === HDockAlignment.right) {
                        leftBorder = leftBorder + (wholeSize - width - cfg.hGap);
                    }
                }
                return new Rect(leftBorder, topBorder, width, height);
        }
    }
    static alignEdge(dimension, sideBorder, gap, position, alignment) {
        if (2 * gap > dimension)
            return [dimension, sideBorder];
        switch (alignment) {
            case EdgeAlignment.outside:
                if (position === DockPosition.right || position === DockPosition.bottom)
                    sideBorder = sideBorder + gap;
                return [dimension - gap, sideBorder];
            case EdgeAlignment.middle:
                return [dimension - 2 * gap, sideBorder + gap];
            case EdgeAlignment.inside:
                if (position === DockPosition.left || position === DockPosition.top)
                    sideBorder = sideBorder + gap;
                return [dimension - gap, sideBorder];
        }
    }
    getSlot(position) {
        let slot = this.slots.find((slot) => slot.position === position) || null;
        if (slot === null || slot.window === null) {
            return null;
        }
        else if (slot.window.state !== WindowState.Docked ||
            slot.window.dock.position !== position) {
            slot.window = null;
            return null;
        }
        else {
            return slot;
        }
    }
    getSlotByPosition(position) {
        return this.slots.find((slot) => slot.position === position) || null;
    }
    getSlotByWindow(window) {
        let slot = this.slots.find((slot) => slot.window === window) || null;
        if (slot === null || slot.window === null) {
            return null;
        }
        else if (slot.window.state !== WindowState.Docked) {
            slot.window = null;
            return null;
        }
        else {
            return slot;
        }
    }
    arrangeSlots(dockedWindows) {
        let contenders = this.arrangeContenders(dockedWindows, true);
        if (contenders.length !== 0 && this.isHasEmptySlot()) {
            contenders.forEach((w) => (w.dock.position = null));
            contenders = this.arrangeContenders(contenders, false);
        }
        contenders.forEach((w) => {
            w.state = WindowState.Tiled;
        });
    }
    arrangeContenders(windows, init) {
        let contenders = [];
        for (const slot of this.slots) {
            if (!init && slot.window !== null)
                continue;
            if (windows.length === 0 && contenders.length === 0) {
                slot.window = null;
                continue;
            }
            let tempDockedWindows = [];
            contenders.push(...windows.filter((w) => {
                if (w.dock === null) {
                    w.dock = new Dock(this.surfaceCfg.cfg);
                    return true;
                }
                if (w.dock.position === slot.position) {
                    return true;
                }
                if (w.dock.position === null)
                    return true;
                tempDockedWindows.push(w);
            }));
            windows = tempDockedWindows;
            if (contenders.length !== 0) {
                this.contendersSort(contenders, slot.position, this.id);
                slot.window = contenders.pop();
                slot.window.dock.position = slot.position;
            }
            else {
                slot.window = null;
            }
        }
        return contenders;
    }
    assignSizes(workingArea) {
        const MAX_SIZE = 50;
        const MAX_GAPS = {
            width: workingArea.width * 0.05,
            height: workingArea.height * 0.05,
        };
        let oppositeSlot = null;
        let donePositions = [];
        let dockCfg;
        let oppositeDockCfg;
        for (const slot of this.slots) {
            if (slot.window === null)
                continue;
            dockCfg = slot.window.dock.cfg;
            const minSize = {
                width: Math.max((slot.window.minSize.width * 100) / workingArea.width, 5),
                height: Math.max((slot.window.minSize.height * 100) / workingArea.height, 5),
            };
            if (donePositions.indexOf(slot.position) >= 0)
                continue;
            switch (slot.position) {
                case DockPosition.top:
                    oppositeSlot = this.getSlot(DockPosition.bottom);
                    break;
                case DockPosition.bottom:
                    oppositeSlot = this.getSlot(DockPosition.top);
                    break;
                case DockPosition.left:
                    oppositeSlot = this.getSlot(DockPosition.right);
                    break;
                case DockPosition.right:
                    oppositeSlot = this.getSlot(DockPosition.left);
                    break;
                default:
                    warning("DockEntry assignSizes - invalid position");
                    break;
            }
            switch (slot.position) {
                case DockPosition.left:
                case DockPosition.right:
                    if (dockCfg.vGap > MAX_GAPS.width)
                        dockCfg.vGap = MAX_GAPS.width;
                    if (dockCfg.vWide <
                        minSize.width + (200 * dockCfg.vGap) / workingArea.width)
                        dockCfg.vWide =
                            minSize.width + (200 * dockCfg.vGap) / workingArea.width;
                    if (oppositeSlot !== null) {
                        oppositeDockCfg = oppositeSlot.window.dock.cfg;
                        let opMinSize = {
                            width: Math.max((oppositeSlot.window.minSize.width * 100) / workingArea.width, 5),
                            height: Math.max((oppositeSlot.window.minSize.height * 100) /
                                workingArea.height, 5),
                        };
                        if (oppositeDockCfg.vGap > MAX_GAPS.width)
                            oppositeDockCfg.vGap = MAX_GAPS.width;
                        if (oppositeDockCfg.vWide <
                            opMinSize.width + (200 * oppositeDockCfg.vGap) / workingArea.width)
                            oppositeDockCfg.vWide =
                                opMinSize.width +
                                    (200 * oppositeDockCfg.vGap) / workingArea.width;
                        if (dockCfg.vWide + oppositeDockCfg.vWide > MAX_SIZE) {
                            if (dockCfg.vWide > MAX_SIZE / 2 &&
                                oppositeDockCfg.vWide > MAX_SIZE / 2) {
                                dockCfg.vWide = MAX_SIZE / 2;
                                oppositeDockCfg.vWide = MAX_SIZE / 2;
                            }
                            else if (dockCfg.vWide > MAX_SIZE / 2) {
                                dockCfg.vWide = MAX_SIZE - oppositeDockCfg.vWide;
                            }
                            else {
                                oppositeDockCfg.vWide = MAX_SIZE - dockCfg.vWide;
                            }
                        }
                        if (oppositeDockCfg.vHeight > 100)
                            oppositeDockCfg.vHeight = 100;
                        if (oppositeDockCfg.vHeight < minSize.height)
                            oppositeDockCfg.vHeight = minSize.height;
                        donePositions.push(oppositeSlot.position);
                    }
                    else {
                        if (dockCfg.vWide > MAX_SIZE) {
                            dockCfg.vWide = MAX_SIZE;
                        }
                    }
                    if (dockCfg.vHeight > 100)
                        dockCfg.vHeight = 100;
                    if (dockCfg.vHeight < minSize.height)
                        dockCfg.vHeight = minSize.height;
                    break;
                case DockPosition.top:
                case DockPosition.bottom:
                    if (dockCfg.hGap > MAX_GAPS.height)
                        dockCfg.hGap = MAX_GAPS.height;
                    if (dockCfg.hHeight <
                        minSize.height + (200 * dockCfg.hGap) / workingArea.height)
                        dockCfg.hHeight =
                            minSize.height + (200 * dockCfg.hGap) / workingArea.height;
                    if (oppositeSlot !== null) {
                        oppositeDockCfg = oppositeSlot.window.dock.cfg;
                        let opMinSize = {
                            width: Math.max((oppositeSlot.window.minSize.width * 100) / workingArea.width, 5),
                            height: Math.max((oppositeSlot.window.minSize.height * 100) /
                                workingArea.height, 5),
                        };
                        if (oppositeDockCfg.hGap > MAX_GAPS.height)
                            oppositeDockCfg.hGap = MAX_GAPS.height;
                        if (oppositeDockCfg.hHeight <
                            opMinSize.height +
                                (200 * oppositeDockCfg.hGap) / workingArea.height)
                            oppositeDockCfg.hHeight =
                                opMinSize.height +
                                    (200 * oppositeDockCfg.hGap) / workingArea.height;
                        if (dockCfg.hHeight + oppositeDockCfg.hHeight > MAX_SIZE) {
                            if (dockCfg.hHeight > MAX_SIZE / 2 &&
                                oppositeDockCfg.hHeight > MAX_SIZE / 2) {
                                dockCfg.hHeight = MAX_SIZE / 2;
                                oppositeDockCfg.hHeight = MAX_SIZE / 2;
                            }
                            else if (dockCfg.hHeight > MAX_SIZE / 2) {
                                dockCfg.hHeight = MAX_SIZE - oppositeDockCfg.hHeight;
                            }
                            else {
                                oppositeDockCfg.hHeight = MAX_SIZE - dockCfg.hHeight;
                            }
                        }
                        if (oppositeDockCfg.hWide > 100)
                            oppositeDockCfg.hWide = 100;
                        if (oppositeDockCfg.hWide < opMinSize.width)
                            oppositeDockCfg.hWide = opMinSize.width;
                        donePositions.push(oppositeSlot.position);
                    }
                    else {
                        if (dockCfg.hHeight > MAX_SIZE) {
                            dockCfg.hHeight = MAX_SIZE;
                        }
                    }
                    if (dockCfg.hWide > 100)
                        dockCfg.hWide = 100;
                    if (dockCfg.hWide < minSize.width)
                        dockCfg.hWide = minSize.width;
                    break;
            }
        }
    }
    contendersSort(contenders, position, id) {
        function compare(a, b) {
            if (a.dock === null && b.dock === null)
                return 0;
            else if (a.dock === null)
                return -1;
            else if (b.dock === null)
                return 1;
            else if (a.dock.position === position && b.dock.position !== position)
                return 1;
            else if (b.dock.position === position && a.dock.position !== position)
                return -1;
            else if (a.dock.priority > b.dock.priority)
                return 1;
            else if (b.dock.priority > a.dock.priority)
                return -1;
            else if (a.dock.renderedTime === null && b.dock.renderedTime === null)
                return 0;
            else if (a.dock.renderedTime === null)
                return -1;
            else if (b.dock.renderedTime === null)
                return 1;
            else if (a.dock.renderedOutputId === id && b.dock.renderedOutputId !== id)
                return 1;
            else if (b.dock.renderedOutputId === id && a.dock.renderedOutputId !== id)
                return -1;
            else if (a.dock.renderedTime > b.dock.renderedTime)
                return 1;
            else if (b.dock.renderedTime > a.dock.renderedTime)
                return -1;
            else
                return 0;
        }
        contenders.sort(compare);
    }
    parseSlots() {
        const slots = [];
        if (CONFIG.dockOrder[0] !== 0)
            slots.push(new DockSlot(DockPosition.left, CONFIG.dockOrder[0]));
        if (CONFIG.dockOrder[1] !== 0)
            slots.push(new DockSlot(DockPosition.top, CONFIG.dockOrder[1]));
        if (CONFIG.dockOrder[2] !== 0)
            slots.push(new DockSlot(DockPosition.right, CONFIG.dockOrder[2]));
        if (CONFIG.dockOrder[3] !== 0)
            slots.push(new DockSlot(DockPosition.bottom, CONFIG.dockOrder[3]));
        slots.sort((a, b) => a.order - b.order);
        return slots;
    }
    isHasEmptySlot() {
        return !this.slots.every((slot) => slot.window !== null);
    }
}
function parseDockUserSurfacesCfg() {
    let surfacesCfg = [];
    getSurfacesCfg(CONFIG.dockSurfacesConfig).forEach((srf) => {
        let partialDockCfg = parseSplittedUserCfg(srf.unvalidatedCfg);
        if (partialDockCfg instanceof Err) {
            warning(`Invalid User surface config: ${srf}. ${partialDockCfg}`);
            return;
        }
        if (Object.keys(partialDockCfg).length > 0) {
            surfacesCfg.push(new SurfaceCfg(srf.outputName, srf.activityId, srf.vDesktopName, DefaultDockCfg.instance.cloneAndUpdate(partialDockCfg)));
        }
    });
    return surfacesCfg;
}
function parseDockUserWindowClassesCfg() {
    let userWindowClassesCfg = {};
    if (CONFIG.dockWindowClassConfig.length === 0)
        return userWindowClassesCfg;
    CONFIG.dockWindowClassConfig.forEach((cfg) => {
        let windowCfgString = cfg.split(":").map((part) => part.trim());
        if (windowCfgString.length !== 3) {
            warning(`Invalid window class config: "${cfg}" should have two colons`);
            return;
        }
        let splittedUserCfg = windowCfgString[2]
            .split(",")
            .map((part) => part.trim().toLowerCase());
        let partialDockCfg;
        if (splittedUserCfg[0] !== "") {
            partialDockCfg = parseSplittedUserCfg(splittedUserCfg);
            if (partialDockCfg instanceof Err) {
                warning(`Invalid User window class config: ${cfg}. ${partialDockCfg}`);
                return;
            }
        }
        else
            partialDockCfg = {};
        let splittedSpecialFlags = windowCfgString[1]
            .split(",")
            .map((part) => part.trim().toLowerCase());
        let dock = parseSpecialFlags(splittedSpecialFlags, partialDockCfg);
        if (dock instanceof Err) {
            warning(`Invalid User window class config: ${cfg}. ${dock}`);
            return;
        }
        userWindowClassesCfg[windowCfgString[0]] = dock;
    });
    return userWindowClassesCfg;
}
function parseSpecialFlags(splittedSpecialFlags, partialDockCfg) {
    let dock = new Dock(DefaultDockCfg.instance.cloneAndUpdate(partialDockCfg));
    splittedSpecialFlags.forEach((flag) => {
        switch (flag) {
            case "auto":
            case "a":
                dock.autoDock = true;
                break;
            case "pin":
            case "p":
                dock.priority = 5;
                break;
            case "left":
            case "l":
                dock.position = DockPosition.left;
                break;
            case "right":
            case "r":
                dock.position = DockPosition.right;
                break;
            case "top":
            case "t":
                dock.position = DockPosition.top;
                break;
            case "bottom":
            case "b":
                dock.position = DockPosition.bottom;
                break;
            default:
                warning(`parse Special Flags: ${splittedSpecialFlags}.Unknown special flag: ${flag}`);
        }
    });
    return dock;
}
function parseSplittedUserCfg(splittedUserCfg) {
    let errors = [];
    const shortNames = {
        hh: "hHeight",
        hw: "hWide",
        hgv: "hEdgeGap",
        hgh: "hGap",
        ha: "hAlignment",
        he: "hEdgeAlignment",
        vh: "vHeight",
        vw: "vWide",
        vgh: "vEdgeGap",
        vgv: "vGap",
        ve: "vEdgeAlignment",
        va: "vAlignment",
    };
    let dockCfg = {};
    splittedUserCfg.forEach((part) => {
        let splittedPart = part.split("=").map((part) => part.trim());
        if (splittedPart.length !== 2) {
            errors.push(`"${part}" can have only one equal sign`);
            return;
        }
        if (splittedPart[0].length === 0 || splittedPart[1].length === 0) {
            errors.push(`"${part}" can not have empty shortname or value`);
            return;
        }
        if (shortNames[splittedPart[0]] in dockCfg) {
            errors.push(`"${part}" has duplicate shortname`);
            return;
        }
        if (!(splittedPart[0] in shortNames)) {
            errors.push(`"${part}" has unknown shortname`);
            return;
        }
        if (["he", "ve"].indexOf(splittedPart[0]) >= 0) {
            switch (splittedPart[1]) {
                case "outside":
                case "o":
                case "0":
                    dockCfg[shortNames[splittedPart[0]]] = EdgeAlignment.outside;
                    break;
                case "middle":
                case "m":
                case "1":
                    dockCfg[shortNames[splittedPart[0]]] = EdgeAlignment.middle;
                    break;
                case "inside":
                case "i":
                case "2":
                    dockCfg[shortNames[splittedPart[0]]] = EdgeAlignment.inside;
                    break;
                default:
                    errors.push(` "${part}" value can be o,m or i or output,middle,input or 0,1,2`);
                    return;
            }
        }
        else if (splittedPart[0] === "va") {
            switch (splittedPart[1]) {
                case "center":
                case "c":
                case "0":
                    dockCfg[shortNames[splittedPart[0]]] = VDockAlignment.center;
                    break;
                case "1":
                case "top":
                case "t":
                    dockCfg[shortNames[splittedPart[0]]] = VDockAlignment.top;
                    break;
                case "2":
                case "bottom":
                case "b":
                    dockCfg[shortNames[splittedPart[0]]] = VDockAlignment.bottom;
                    break;
                default:
                    errors.push(` "${part}" value can be c,t or b or center,top,bottom or 0,1,2`);
                    return;
            }
        }
        else if (splittedPart[0] === "ha") {
            switch (splittedPart[1]) {
                case "center":
                case "c":
                case "0":
                    dockCfg[shortNames[splittedPart[0]]] = HDockAlignment.center;
                    break;
                case "1":
                case "left":
                case "l":
                    dockCfg[shortNames[splittedPart[0]]] = HDockAlignment.left;
                    break;
                case "2":
                case "right":
                case "r":
                    dockCfg[shortNames[splittedPart[0]]] = HDockAlignment.right;
                    break;
                default:
                    errors.push(`"${part}" value can be c,l or r or center,left,right or 0,1,2`);
                    return;
            }
        }
        else {
            let value;
            switch (splittedPart[0]) {
                case "hw":
                case "vh":
                    value = validateNumber(splittedPart[1], 1, 100);
                    break;
                case "hh":
                case "vw":
                    value = validateNumber(splittedPart[1], 1, 50);
                    break;
                case "hgh":
                case "vgv":
                case "vgh":
                case "vgv":
                    value = validateNumber(splittedPart[1]);
                    break;
                default:
                    errors.push(`unknown shortname ${splittedPart[0]}`);
                    return;
            }
            if (value instanceof Err)
                errors.push(`splittedPart[0]: ${value}`);
            else
                dockCfg[shortNames[splittedPart[0]]] = value;
        }
    });
    if (errors.length > 0) {
        return new Err(errors.join("\n"));
    }
    return dockCfg;
}
class DockSlot {
    get position() {
        return this._position;
    }
    get order() {
        return this._order;
    }
    constructor(position, order) {
        this._position = position;
        this._order = order;
        this.window = null;
    }
}
class DockStore {
    constructor() {
        this.store = {};
        this.defaultCfg = null;
        this.surfacesCfg = [];
        this.windowClassesCfg = {};
    }
    render(srf, visibles, workingArea) {
        if (this.defaultCfg === null) {
            this.defaultCfg = DefaultDockCfg.instance;
            this.surfacesCfg = parseDockUserSurfacesCfg();
            this.windowClassesCfg = parseDockUserWindowClassesCfg();
        }
        if (!this.store[srf.id]) {
            this.store[srf.id] = new DockEntry(this.getSurfaceCfg(srf), srf.id);
        }
        let dockedWindows = visibles.filter((w) => {
            if (w.state === WindowState.Docked) {
                if (w.dock === null && w.windowClassName in this.windowClassesCfg) {
                    w.dock = this.windowClassesCfg[w.windowClassName].clone();
                }
                return true;
            }
        });
        if (dockedWindows.length === 0)
            return workingArea;
        return this.store[srf.id].arrange(dockedWindows, workingArea);
    }
    remove(window) {
        for (let key in this.store) {
            this.store[key].remove(window);
        }
    }
    handleShortcut(ctx, window, shortcut) {
        switch (shortcut) {
            case Shortcut.SwapLeft:
            case Shortcut.SwapUp:
            case Shortcut.SwapRight:
            case Shortcut.SwapDown:
                const srf = ctx.currentSurface;
                if (this.store[srf.id]) {
                    return this.store[srf.id].handleShortcut(window, shortcut);
                }
                return false;
            default:
                return false;
        }
    }
    isNewWindowHaveDocked(window) {
        if (window.windowClassName in this.windowClassesCfg &&
            this.windowClassesCfg[window.windowClassName].autoDock === true)
            return true;
        return false;
    }
    getSurfaceCfg(srf) {
        let dockCfg = null;
        for (let surfaceCfg of this.surfacesCfg) {
            if (surfaceCfg.isFit(srf.output, srf.activity, srf.vDesktop)) {
                dockCfg = Object.assign({}, surfaceCfg.cfg);
                break;
            }
        }
        if (dockCfg === null)
            dockCfg = this.defaultCfg.cloneAndUpdate({});
        let [outputName, activityId, vDesktopName] = srf.getParams();
        return new SurfaceCfg(outputName, activityId, vDesktopName, dockCfg);
    }
}
class KWinConfig {
    constructor() {
        function separate(str, separator) {
            if (!str || typeof str !== "string")
                return [];
            return str
                .split(separator)
                .map((part) => part.trim())
                .filter((part) => part != "");
        }
        this.tileLayoutInitialAngle = KWIN.readConfig("tileLayoutInitialRotationAngle", "0");
        this.monocleMaximize = KWIN.readConfig("monocleMaximize", true);
        this.monocleMinimizeRest = KWIN.readConfig("monocleMinimizeRest", false);
        this.quarterLayoutReset = KWIN.readConfig("quarterLayoutReset", false);
        this.columnsLayoutInitialAngle = KWIN.readConfig("columnsLayoutInitialRotationAngle", "0");
        this.columnsBalanced = KWIN.readConfig("columnsBalanced", false);
        this.columnsLayerConf = separate(KWIN.readConfig("columnsLayerConf", ""), ",");
        this.stairReverse = KWIN.readConfig("stairReverse", false);
        const layoutsList = [
            [TileLayout, true],
            [MonocleLayout, false],
            [ThreeColumnLayout, true],
            [SpiralLayout, true],
            [QuarterLayout, false],
            [StackedLayout, true],
            [ColumnsLayout, true],
            [SpreadLayout, true],
            [FloatingLayout, true],
            [StairLayout, true],
            [BinaryTreeLayout, true],
            [CascadeLayout, true],
        ];
        const sortedLayouts = KWinConfig.getSortedLayouts(layoutsList);
        this.layoutOrder = KWinConfig.getLayoutOrder(sortedLayouts);
        this.layoutFactories = KWinConfig.getLayoutFactories(sortedLayouts);
        sortedLayouts.forEach(({ layoutClass, isCapacity }) => {
            this.layoutOrder.push(layoutClass.id);
        });
        this.surfacesDefaultConfig = separate(KWIN.readConfig("surfacesDefaultConfig", ""), "\n");
        this.surfacesIsMoveWindows = KWIN.readConfig("surfacesIsMoveWindows", true);
        this.surfacesIsMoveOldestWindows = KWIN.readConfig("surfacesIsMoveOldestWindows", false);
        this.screenGapTop = KWIN.readConfig("screenGapTop", 0);
        this.screenGapLeft = KWIN.readConfig("screenGapLeft", 0);
        this.screenGapBetween = KWIN.readConfig("screenGapBetween", 0);
        this.screenGapRight = KWIN.readConfig("screenGapRight", 0);
        this.screenGapBottom = KWIN.readConfig("screenGapBottom", 0);
        this.gapsOverrideConfig = separate(KWIN.readConfig("gapsOverrideConfig", ""), "\n");
        this.limitTileWidthRatio = 0;
        if (KWIN.readConfig("limitTileWidth", false))
            this.limitTileWidthRatio = KWIN.readConfig("limitTileWidthRatio", 1.6);
        this.adjustLayout = KWIN.readConfig("adjustLayout", true);
        this.adjustLayoutLive = KWIN.readConfig("adjustLayoutLive", true);
        this.directionalKeyMode = KWIN.readConfig("directionalKeyFocus", true)
            ? "focus"
            : "dwm";
        this.metaConfig = separate(KWIN.readConfig("metaConfig", "RaiseSurfaceCapacity=ResetSurfaceCapacity\nFocusDown=FocusNext"), "\n");
        this.metaTimeout = validateNumberWithDefault(KWIN.readConfig("metaTimeout", 3000), 3000, "metaTimeout", 100, 9999);
        this.metaIsToggle = KWIN.readConfig("metaIsToggle", false);
        this.metaIsPushedTwice = KWIN.readConfig("metaIsPushedTwice", false);
        this.newWindowPosition = KWIN.readConfig("newWindowPosition", 0);
        this.ignoreClass = separate(KWIN.readConfig("ignoreClass", "krunner,yakuake,spectacle,kded5,xwaylandvideobridge,plasmashell,ksplashqml,org.kde.plasmashell,org.kde.polkit-kde-authentication-agent-1,org.kde.kruler,kruler,kwin_wayland,ksmserver-logout-greeter"), ",");
        this.ignoreTitle = separate(KWIN.readConfig("ignoreTitle", ""), ",");
        this.ignoreRole = separate(KWIN.readConfig("ignoreRole", "quake"), ",");
        this.floatingClass = separate(KWIN.readConfig("floatingClass", ""), ",");
        this.floatingTitle = separate(KWIN.readConfig("floatingTitle", ""), ",");
        this.floatDefault = KWIN.readConfig("floatDefault", false);
        this.floatUtility = KWIN.readConfig("floatUtility", true);
        this.ignoreActivity = separate(KWIN.readConfig("ignoreActivity", ""), ",");
        this.ignoreScreen = separate(KWIN.readConfig("ignoreScreen", ""), ",");
        this.ignoreVDesktop = separate(KWIN.readConfig("ignoreVDesktop", ""), ",");
        this.tileNothing = KWIN.readConfig("tileNothing", false);
        this.tilingClass = separate(KWIN.readConfig("tilingClass", ""), ",");
        this.screenDefaultLayout = separate(KWIN.readConfig("screenDefaultLayout", ""), ",");
        this.dockOrder = [
            KWIN.readConfig("dockOrderLeft", 1),
            KWIN.readConfig("dockOrderTop", 2),
            KWIN.readConfig("dockOrderRight", 3),
            KWIN.readConfig("dockOrderBottom", 4),
        ];
        this.dockHHeight = KWIN.readConfig("dockHHeight", 15);
        this.dockHWide = KWIN.readConfig("dockHWide", 100);
        this.dockHGap = KWIN.readConfig("dockHGap", 0);
        this.dockHEdgeGap = KWIN.readConfig("dockHEdgeGap", 0);
        this.dockHAlignment = KWIN.readConfig("dockHAlignment", 0);
        this.dockHEdgeAlignment = KWIN.readConfig("dockHEdgeAlignment", 0);
        this.dockVHeight = KWIN.readConfig("dockVHeight", 100);
        this.dockVWide = KWIN.readConfig("dockVWide", 15);
        this.dockVEdgeGap = KWIN.readConfig("dockVEdgeGap", 0);
        this.dockVGap = KWIN.readConfig("dockVGap", 0);
        this.dockVAlignment = KWIN.readConfig("dockVAlignment", 0);
        this.dockVEdgeAlignment = KWIN.readConfig("dockVEdgeAlignment", 0);
        this.dockSurfacesConfig = separate(KWIN.readConfig("dockSurfacesConfig", ""), "\n");
        this.dockWindowClassConfig = separate(KWIN.readConfig("dockWindowClassConfig", ""), "\n");
        this.tiledWindowsLayer = getWindowLayer(KWIN.readConfig("tiledWindowsLayer", 0));
        this.floatedWindowsLayer = getWindowLayer(KWIN.readConfig("floatedWindowsLayer", 1));
        this.soleWindowWidth = KWIN.readConfig("soleWindowWidth", 100);
        this.soleWindowHeight = KWIN.readConfig("soleWindowHeight", 100);
        this.soleWindowNoBorders = KWIN.readConfig("soleWindowNoBorders", false);
        this.soleWindowNoGaps = KWIN.readConfig("soleWindowNoGaps", false);
        if (KWIN.readConfig("floatEnable", true)) {
            let windowWidth = validateNumberWithDefault(KWIN.readConfig("floatInitWindowWidth", 50), 50, "floatInitWindowWidth", 1, 100);
            let windowHeight = validateNumberWithDefault(KWIN.readConfig("floatInitWindowHeight", 50), 50, "floatInitWindowHeight", 1, 100);
            let randomize = KWIN.readConfig("floatRandomize", true);
            let randomWidth = validateNumberWithDefault(KWIN.readConfig("floatRandomWidth", 15), 15, "floatRandomWidth", 1, 100);
            let randomHeight = validateNumberWithDefault(KWIN.readConfig("floatRandomHeight", 15), 15, "floatRandomHeight", 1, 100);
            this.floatInit = {
                windowHeight,
                windowWidth,
                randomHeight,
                randomWidth,
                randomize,
            };
        }
        else
            this.floatInit = null;
        this.unfitGreater = KWIN.readConfig("unfitGreater", true);
        this.unfitLess = KWIN.readConfig("unfitLess", true);
        this.notificationDuration = KWIN.readConfig("notificationDuration", 1000);
        this.layoutPerActivity = KWIN.readConfig("layoutPerActivity", true);
        this.layoutPerDesktop = KWIN.readConfig("layoutPerDesktop", true);
        this.noTileBorder = KWIN.readConfig("noTileBorder", false);
        this.keepTilingOnDrag = KWIN.readConfig("keepTilingOnDrag", true);
        this.preventMinimize = KWIN.readConfig("preventMinimize", false);
        if (this.preventMinimize && this.monocleMinimizeRest) {
            this.preventMinimize = false;
        }
        this.preventProtrusion = KWIN.readConfig("preventProtrusion", true);
        this.floatSkipPager = KWIN.readConfig("floatSkipPagerWindows", false);
        if (KWIN.readConfig("logging", false)) {
            let logParts = [];
            let newWindowSubmodules = [];
            if (KWIN.readConfig("logNewWindows", false))
                newWindowSubmodules.push("1");
            if (KWIN.readConfig("logFilteredWindows", false))
                newWindowSubmodules.push("2");
            if (KWIN.readConfig("logUnmanagedWindows", false))
                newWindowSubmodules.push("3");
            if (newWindowSubmodules.length > 0)
                logParts.push([LogPartitions.newWindow, newWindowSubmodules]);
            if (KWIN.readConfig("logWorkspaceSignals", false)) {
                let workspaceSignalsSubmodules = separate(KWIN.readConfig("logWorkspaceSignalsSubmodules", ""), ",");
                logParts.push([
                    LogPartitions.workspaceSignals,
                    workspaceSignalsSubmodules,
                ]);
            }
            if (KWIN.readConfig("logWindowSignals", false)) {
                let windowSignalsSubmodules = separate(KWIN.readConfig("logWindowSignalsSubmodules", ""), ",");
                logParts.push([LogPartitions.windowSignals, windowSignalsSubmodules]);
            }
            if (KWIN.readConfig("logOther", false)) {
                let otherSubmodules = separate(KWIN.readConfig("logOtherSubmodules", ""), ",");
                logParts.push([LogPartitions.other, otherSubmodules]);
            }
            const logFilters = KWIN.readConfig("logFilter", false)
                ? separate(KWIN.readConfig("logFilterStr", ""), ",")
                : [];
            LOG = new Logging(logParts, logFilters);
        }
        else
            LOG = undefined;
    }
    static getSortedLayouts(layoutsList) {
        let sortedLayouts = [];
        for (const [idx, [layoutClass, isCapacity]] of layoutsList.entries()) {
            let orderConfigKey = `${unCapitalize(layoutClass.id)}Order`;
            let validatedOrder = validateNumber(KWIN.readConfig(orderConfigKey, idx + 1), 0, 12);
            if (validatedOrder instanceof Err) {
                validatedOrder = idx + 1;
                warning(`kwinconfig: layout order for ${layoutClass.id} is invalid, using default value ${validatedOrder}`);
            }
            if (validatedOrder === 0)
                continue;
            sortedLayouts.push({
                order: validatedOrder,
                layoutClass: layoutClass,
                isCapacity: isCapacity,
            });
        }
        sortedLayouts.sort((a, b) => a.order - b.order);
        if (sortedLayouts.length === 0) {
            sortedLayouts.push({
                order: 1,
                layoutClass: TileLayout,
                isCapacity: false,
            });
        }
        return sortedLayouts;
    }
    static getLayoutOrder(sortedLayouts) {
        let layoutOrder = [];
        sortedLayouts.forEach(({ layoutClass }) => {
            layoutOrder.push(layoutClass.id);
        });
        return layoutOrder;
    }
    static getLayoutFactories(sortedLayouts) {
        let layoutFactories = {};
        sortedLayouts.forEach(({ layoutClass, isCapacity }) => {
            if (isCapacity) {
                const capacityConfigKey = `${unCapitalize(layoutClass.id)}Capacity`;
                let capacity = validateNumber(KWIN.readConfig(capacityConfigKey, 99), 0, 99);
                if (capacity instanceof Err) {
                    warning(`kwinconfig: layout capacity for ${layoutClass.id} is invalid: ${capacity}`);
                    layoutFactories[layoutClass.id] = () => new layoutClass(null);
                }
                else if (capacity === 0 || capacity > 98) {
                    layoutFactories[layoutClass.id] = () => new layoutClass(null);
                }
                else {
                    layoutFactories[layoutClass.id] = () => new layoutClass(capacity);
                }
            }
            else {
                layoutFactories[layoutClass.id] = () => new layoutClass();
            }
        });
        return layoutFactories;
    }
    toString() {
        return "Config(" + JSON.stringify(this, undefined, 2) + ")";
    }
}
var KWINCONFIG;
var KWIN;
class KWinDriver {
    get backend() {
        return KWinDriver.backendName;
    }
    get currentSurface() {
        return this._surfaceStore.getSurface(this.workspace.activeWindow
            ? this.workspace.activeWindow.output
            : this.workspace.activeScreen, this.workspace.currentActivity, this.workspace.currentDesktop);
    }
    set currentSurface(value) {
        const ksrf = value;
        if (this.workspace.currentDesktop.id !== ksrf.vDesktop.id)
            this.workspace.currentDesktop = ksrf.vDesktop;
        if (this.workspace.currentActivity !== ksrf.activity)
            this.workspace.currentActivity = ksrf.activity;
    }
    get currentWindow() {
        const client = this.workspace.activeWindow;
        return client ? this.windowMap.get(client) : null;
    }
    set currentWindow(window) {
        if (window !== null) {
            window.timestamp = new Date().getTime();
            this.workspace.activeWindow = window.window.window;
        }
    }
    get currentSurfaces() {
        const currentSurfaces = [];
        this.workspace.screens.forEach((output) => {
            currentSurfaces.push(this._surfaceStore.getSurface(output, this.workspace.currentActivity, this.workspace.currentDesktop));
        });
        return currentSurfaces;
    }
    get cursorPosition() {
        const workspacePos = this.workspace.cursorPos;
        return workspacePos !== null ? [workspacePos.x, workspacePos.y] : null;
    }
    get isMetaMode() {
        return this._isMetaMode.state;
    }
    constructor(api) {
        KWIN = api.kwin;
        CONFIG = KWINCONFIG = new KWinConfig();
        this.workspace = api.workspace;
        this.shortcuts = api.shortcuts;
        this.engine = new TilingEngine();
        this.control = new TilingController(this.engine);
        this.windowMap = new WrapperMap((client) => KWinWindow.generateID(client), (client) => new WindowClass(new KWinWindow(client, this.workspace, this._surfaceStore)));
        this.entered = false;
        this._surfaceStore = new KWinSurfaceStore(this.workspace);
        this._isMetaMode = {
            state: false,
            lastPushed: 0,
            toggleMode: CONFIG.metaIsToggle,
        };
    }
    main() {
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.printConfig, undefined, `Config: ${CONFIG}`);
        this.bindEvents();
        this.bindShortcut();
        const clients = this.workspace.stackingOrder;
        for (let i = 0; i < clients.length; i++) {
            this.addWindow(clients[i]);
        }
    }
    addWindow(client) {
        if (!client.deleted &&
            client.pid >= 0 &&
            !client.popupWindow &&
            client.normalWindow &&
            !client.hidden &&
            client.width * client.height > 10) {
            const window = this.windowMap.add(client);
            if (client.maximizeMode > 0) {
                window.window.maximized = true;
            }
            this.control.onWindowAdded(this, window);
            if (window.state !== WindowState.Unmanaged) {
                this.bindWindowEvents(window, client);
                LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.newWindowAdded, "", debugWin(client), {
                    winClass: [`${client.resourceClass}`],
                });
                return window;
            }
            else {
                this.windowMap.remove(client);
                LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.newWindowUnmanaged, "", debugWin(client), {
                    winClass: [`${client.resourceClass}`],
                });
            }
        }
        else {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.newWindowFiltered, "", debugWin(client), {
                winClass: [`${client.resourceClass}`],
            });
        }
        return null;
    }
    setTimeout(func, timeout) {
        KWinSetTimeout(() => this.enter(func), timeout);
    }
    showNotification(text) {
        if (CONFIG.notificationDuration > 0)
            popupDialog.showNotification(text, CONFIG.notificationDuration);
    }
    metaPushed() {
        if (CONFIG.metaIsToggle) {
            this._isMetaMode.state = !this._isMetaMode.state;
            this.showNotification(`Meta toggled ${this._isMetaMode.state ? "on" : "off"}`);
        }
        else if (CONFIG.metaIsPushedTwice) {
            let pushedTime = new Date().getTime();
            if (pushedTime - this._isMetaMode.lastPushed < CONFIG.metaTimeout - 200) {
                this._isMetaMode.toggleMode = !this._isMetaMode.toggleMode;
                this._isMetaMode.state = this._isMetaMode.toggleMode;
                this.showNotification(`Meta toggled ${this._isMetaMode.state ? "on" : "off"}`);
            }
            else {
                if (!this._isMetaMode.state) {
                    this._isMetaMode.state = true;
                    this.showNotification(`Meta on`);
                    this.setTimeout(() => {
                        if (!this._isMetaMode.toggleMode) {
                            this._isMetaMode.state = false;
                        }
                    }, CONFIG.metaTimeout);
                }
            }
            this._isMetaMode.lastPushed = pushedTime;
        }
        else {
            if (!this._isMetaMode.state) {
                this._isMetaMode.state = true;
                this.showNotification(`Meta on`);
                this.setTimeout(() => {
                    this._isMetaMode.state = false;
                }, CONFIG.notificationDuration);
            }
        }
    }
    moveWindowsToScreen(windowsToScreen) {
        let clients = [];
        windowsToScreen.forEach(([targetOutput, windows]) => {
            windows.forEach((window) => {
                let client = window.window.window;
                clients.push(client);
                client.minimized = true;
                this.workspace.sendClientToScreen(client, targetOutput);
            });
        });
        if (clients.length === 0)
            return;
        this.setTimeout(() => {
            clients.forEach((client) => {
                client.minimized = false;
            });
            this.workspace.activeWindow = clients[clients.length - 1];
            this.control.engine.arrange(this, "moveWindowsToScreen");
        }, 100);
    }
    moveToScreen(window, direction) {
        let client = window.window.window;
        let output = client.output;
        let neighbor = this.getNeighborOutput(direction, output);
        if (neighbor === null || neighbor === undefined)
            return false;
        client.minimized = true;
        this.workspace.sendClientToScreen(client, neighbor);
        this.setTimeout(() => {
            client.minimized = false;
            this.workspace.activeWindow = client;
            this.control.engine.arrange(this, "moveToScreen");
        }, 100);
        return true;
    }
    getNeighborOutput(direction, source) {
        let retOutput = null;
        let intersection = 0;
        let sourceRect = toRect(source.geometry);
        function isOutputCandidate(targetRect, coordinate) {
            let currentIntersection = sourceRect.intersection(targetRect, coordinate);
            if (currentIntersection > intersection) {
                intersection = currentIntersection;
                return true;
            }
            return false;
        }
        for (let target of this.workspace.screens) {
            if (target === source)
                continue;
            let targetRect = toRect(target.geometry);
            switch (direction) {
                case "left": {
                    if (sourceRect.x === targetRect.maxX) {
                        if (isOutputCandidate(targetRect, "y"))
                            retOutput = target;
                    }
                    break;
                }
                case "right": {
                    if (sourceRect.maxX === targetRect.x) {
                        if (isOutputCandidate(targetRect, "y"))
                            retOutput = target;
                    }
                    break;
                }
                case "up": {
                    if (sourceRect.y === targetRect.maxY) {
                        if (isOutputCandidate(targetRect, "x"))
                            retOutput = target;
                    }
                    break;
                }
                case "down": {
                    if (sourceRect.maxY === targetRect.y) {
                        if (isOutputCandidate(targetRect, "x"))
                            retOutput = target;
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
        return retOutput;
    }
    moveToVDesktop(window, direction, across = true) {
        let targetVDesktop = this.getNeighborVirtualDesktop(direction);
        if (targetVDesktop === null)
            return false;
        let client = window.window.window;
        this.workspace.currentDesktop = targetVDesktop;
        client.desktops = [targetVDesktop];
        this.workspace.activeWindow = client;
        if (across) {
            let oppositeDirection;
            let currentOutput = this.workspace.activeScreen;
            let sourceOutput = currentOutput;
            let targetOutput;
            switch (direction) {
                case "right":
                    oppositeDirection = "left";
                    break;
                case "left":
                    oppositeDirection = "right";
                    break;
                case "up":
                    oppositeDirection = "down";
                    break;
                case "down":
                    oppositeDirection = "up";
                    break;
                default:
                    return false;
            }
            while ((targetOutput = this.getNeighborOutput(oppositeDirection, sourceOutput)) !== null) {
                sourceOutput = targetOutput;
            }
            if (sourceOutput !== currentOutput) {
                this.moveWindowsToScreen([[sourceOutput, [window]]]);
                return false;
            }
        }
        return true;
    }
    getNeighborVirtualDesktop(direction) {
        let currentVDesktop = this.workspace.currentDesktop;
        let vDesktops = this.workspace.desktops;
        let netSize = this.workspace.desktopGridSize;
        function getVDesktopPosition(idx) {
            idx++;
            switch (direction) {
                case "left":
                case "right": {
                    if (netSize.width === 1 ||
                        (idx === vDesktops.length && idx % netSize.width === 1))
                        return "single";
                    if (idx === vDesktops.length)
                        return "right";
                    let pos_number = idx % netSize.width;
                    if (pos_number === 0) {
                        return "right";
                    }
                    else if (pos_number === 1) {
                        return "left";
                    }
                    else
                        return "middle";
                }
                case "up":
                case "down": {
                    if (netSize.height === 1)
                        return "single";
                    if (idx + netSize.width > vDesktops.length)
                        return "bottom";
                    let floor = Math.floor(idx / netSize.height) +
                        Number(Boolean(idx / netSize.height));
                    if (floor === 1) {
                        return "upper";
                    }
                    else if (floor === netSize.height)
                        return "bottom";
                    else
                        return "middle";
                }
            }
        }
        for (let i = 0; i < vDesktops.length; i++) {
            let vDesktop = vDesktops[i];
            if (vDesktop !== currentVDesktop)
                continue;
            let position = getVDesktopPosition(i);
            switch (direction) {
                case "left": {
                    if (position === "left" || position === "single")
                        return null;
                    else
                        return vDesktops[i - 1];
                }
                case "right": {
                    if (position === "right" || position === "single")
                        return null;
                    else
                        return vDesktops[i + 1];
                }
                case "up": {
                    if (position === "upper" || position === "single")
                        return null;
                    else
                        return vDesktops[i - netSize.width];
                }
                case "down": {
                    if (position === "bottom" || position === "single")
                        return null;
                    else
                        return vDesktops[i + netSize.width];
                }
            }
        }
        return null;
    }
    bindShortcut() {
        const callbackShortcut = (shortcut) => {
            return () => {
                LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.shortcut, `Shortcut pressed:`, `${shortcut}`);
                this.enter(() => this.control.onShortcut(this, shortcut));
            };
        };
        this.shortcuts
            .getToggleDock()
            .activated.connect(callbackShortcut(Shortcut.ToggleDock));
        this.shortcuts
            .getFocusNext()
            .activated.connect(callbackShortcut(Shortcut.FocusNext));
        this.shortcuts
            .getFocusPrev()
            .activated.connect(callbackShortcut(Shortcut.FocusPrev));
        this.shortcuts
            .getFocusDown()
            .activated.connect(callbackShortcut(Shortcut.FocusDown));
        this.shortcuts
            .getFocusUp()
            .activated.connect(callbackShortcut(Shortcut.FocusUp));
        this.shortcuts
            .getFocusLeft()
            .activated.connect(callbackShortcut(Shortcut.FocusLeft));
        this.shortcuts
            .getFocusRight()
            .activated.connect(callbackShortcut(Shortcut.FocusRight));
        this.shortcuts
            .getShiftDown()
            .activated.connect(callbackShortcut(Shortcut.ShiftDown));
        this.shortcuts
            .getShiftUp()
            .activated.connect(callbackShortcut(Shortcut.ShiftUp));
        this.shortcuts
            .getShiftLeft()
            .activated.connect(callbackShortcut(Shortcut.ShiftLeft));
        this.shortcuts
            .getShiftRight()
            .activated.connect(callbackShortcut(Shortcut.ShiftRight));
        this.shortcuts
            .getGrowHeight()
            .activated.connect(callbackShortcut(Shortcut.GrowHeight));
        this.shortcuts
            .getShrinkHeight()
            .activated.connect(callbackShortcut(Shortcut.ShrinkHeight));
        this.shortcuts
            .getShrinkWidth()
            .activated.connect(callbackShortcut(Shortcut.ShrinkWidth));
        this.shortcuts
            .getGrowWidth()
            .activated.connect(callbackShortcut(Shortcut.GrowWidth));
        this.shortcuts
            .getIncrease()
            .activated.connect(callbackShortcut(Shortcut.Increase));
        this.shortcuts
            .getDecrease()
            .activated.connect(callbackShortcut(Shortcut.Decrease));
        this.shortcuts
            .getToggleFloat()
            .activated.connect(callbackShortcut(Shortcut.ToggleFloat));
        this.shortcuts
            .getFloatAll()
            .activated.connect(callbackShortcut(Shortcut.ToggleFloatAll));
        this.shortcuts
            .getNextLayout()
            .activated.connect(callbackShortcut(Shortcut.NextLayout));
        this.shortcuts
            .getPreviousLayout()
            .activated.connect(callbackShortcut(Shortcut.PreviousLayout));
        this.shortcuts
            .getRotate()
            .activated.connect(callbackShortcut(Shortcut.Rotate));
        this.shortcuts
            .getRotatePart()
            .activated.connect(callbackShortcut(Shortcut.RotatePart));
        this.shortcuts
            .getSetMaster()
            .activated.connect(callbackShortcut(Shortcut.SetMaster));
        this.shortcuts
            .getRaiseSurfaceCapacity()
            .activated.connect(callbackShortcut(Shortcut.RaiseSurfaceCapacity));
        this.shortcuts
            .getLowerSurfaceCapacity()
            .activated.connect(callbackShortcut(Shortcut.LowerSurfaceCapacity));
        this.shortcuts
            .getKrohnkiteMeta()
            .activated.connect(callbackShortcut(Shortcut.KrohnkiteMeta));
        const callbackShortcutLayout = (layoutClass) => {
            return () => {
                LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.shortcut, "shortcut layout", `${layoutClass.id}`);
                this.enter(() => this.control.onShortcut(this, Shortcut.SetLayout, layoutClass.id));
            };
        };
        this.shortcuts
            .getTileLayout()
            .activated.connect(callbackShortcutLayout(TileLayout));
        this.shortcuts
            .getMonocleLayout()
            .activated.connect(callbackShortcutLayout(MonocleLayout));
        this.shortcuts
            .getThreeColumnLayout()
            .activated.connect(callbackShortcutLayout(ThreeColumnLayout));
        this.shortcuts
            .getSpreadLayout()
            .activated.connect(callbackShortcutLayout(SpreadLayout));
        this.shortcuts
            .getStairLayout()
            .activated.connect(callbackShortcutLayout(StairLayout));
        this.shortcuts
            .getFloatingLayout()
            .activated.connect(callbackShortcutLayout(FloatingLayout));
        this.shortcuts
            .getQuarterLayout()
            .activated.connect(callbackShortcutLayout(QuarterLayout));
        this.shortcuts
            .getStackedLayout()
            .activated.connect(callbackShortcutLayout(StackedLayout));
        this.shortcuts
            .getColumnsLayout()
            .activated.connect(callbackShortcutLayout(ColumnsLayout));
        this.shortcuts
            .getSpiralLayout()
            .activated.connect(callbackShortcutLayout(SpiralLayout));
        this.shortcuts
            .getBTreeLayout()
            .activated.connect(callbackShortcutLayout(BinaryTreeLayout));
    }
    connect(signal, handler) {
        const wrapper = (...args) => {
            if (typeof this.workspace === "undefined")
                signal.disconnect(wrapper);
            else
                this.enter(() => handler.apply(this, args));
        };
        signal.connect(wrapper);
        return wrapper;
    }
    enter(callback) {
        if (this.entered)
            return;
        this.entered = true;
        try {
            callback();
        }
        catch (e) {
            warning(`ProtectFunc: Error raised line: ${e.lineNumber}. Error: ${e}`);
        }
        finally {
            this.entered = false;
        }
    }
    bindEvents() {
        this.connect(this.workspace.screensChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.screensChanged, "eventFired");
            this.control.onSurfaceUpdate(this);
        });
        this.connect(this.workspace.virtualScreenGeometryChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.virtualScreenGeometryChanged, "eventFired");
            this.control.onSurfaceUpdate(this);
        });
        this.connect(this.workspace.currentActivityChanged, (activityId) => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.currentActivityChanged, "eventFired", `Activity ID:${activityId}`);
            this.control.onCurrentActivityChanged(this);
        });
        this.connect(this.workspace.currentDesktopChanged, (virtualDesktop) => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.currentDesktopChanged, "eventFired", `Virtual Desktop. name:${virtualDesktop.name}, id:${virtualDesktop.id}`);
            this.control.onSurfaceUpdate(this);
        });
        this.connect(this.workspace.windowAdded, (client) => {
            if (!client)
                return;
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.windowAdded, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}`, { winClass: [`${client.resourceClass}`] });
            const window = this.addWindow(client);
            if (client.active && window !== null)
                this.control.onWindowFocused(this, window);
        });
        this.connect(this.workspace.windowActivated, (client) => {
            if (!client)
                return;
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.windowActivated, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}`, { winClass: [`${client.resourceClass}`] });
            const window = this.windowMap.get(client);
            if (client.active && window !== null)
                this.control.onWindowFocused(this, window);
        });
        this.connect(this.workspace.windowRemoved, (client) => {
            if (!client)
                return;
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.windowRemoved, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}`, { winClass: [`${client.resourceClass}`] });
            const window = this.windowMap.get(client);
            if (window) {
                this.control.onWindowRemoved(this, window);
                this.windowMap.remove(client);
            }
        });
        this.connect(this.workspace.activityRemoved, (id) => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.surfaceChanged, "eventFired", `Activity: id: ${id} has been removed.`);
            this._surfaceStore.removeByActivity(id);
        });
        this.connect(this.workspace.desktopsChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.surfaceChanged, "eventFired", `Virtual Desktops Changed`);
            this._surfaceStore.checkVirtualDesktops();
        });
    }
    bindWindowEvents(window, client) {
        let moving = false;
        let resizing = false;
        this.connect(client.activitiesChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.activitiesChanged, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}, activities: ${client.activities.join(",")}`, { winClass: [`${client.resourceClass}`] });
            this.control.onWindowChanged(this, window, "activity=" + client.activities.join(","));
        });
        this.connect(client.bufferGeometryChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.bufferGeometryChanged, "eventFired", `Window: caption:${client.caption} internalId:${client.internalId}, moving:${moving}, resizing:${resizing}, actualGeometry: ${window.actualGeometry}, commitGeometry:${window.geometry}`, { winClass: [`${client.resourceClass}`] });
            if (moving)
                this.control.onWindowMove(window);
            else if (resizing)
                this.control.onWindowResize(this, window);
            else {
                if (!window.actualGeometry.equals(window.geometry))
                    this.control.onWindowGeometryChanged(this, window);
            }
        });
        this.connect(client.desktopsChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.desktopsChanged, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}, desktops: ${client.desktops}`, { winClass: [`${client.resourceClass}`] });
            this.control.onWindowChanged(this, window, "Window's desktop changed.");
        });
        this.connect(client.fullScreenChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.fullScreenChanged, "eventFired", `window: caption:${client.caption} internalID:${client.internalId}, fullscreen: ${client.fullScreen}`, { winClass: [`${client.resourceClass}`] });
            this.control.onWindowChanged(this, window, "fullscreen=" + client.fullScreen);
        });
        this.connect(client.interactiveMoveResizeStepped, (geometry) => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.interactiveMoveResizeStepped, "eventFired", `window: caption:${client.caption} internalID:${client.internalId},interactiveMoveResizeStepped:${geometry}`, { winClass: [`${client.resourceClass}`] });
            if (client.resize)
                return;
            this.control.onWindowDragging(this, window, geometry);
        });
        this.connect(client.maximizedAboutToChange, (mode) => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.maximizedAboutToChange, "eventFired", `window: caption:${client.caption} internalID:${client.internalId},maximizedAboutToChange:${mode}`, { winClass: [`${client.resourceClass}`] });
            window.window.maximized = mode > 0;
            this.control.onWindowMaximizeChanged(this, window);
        });
        this.connect(client.minimizedChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.minimizedChanged, "eventFired", `window: caption:${client.caption} internalID:${client.internalId},minimized:${client.minimized}`, { winClass: [`${client.resourceClass}`] });
            if (KWINCONFIG.preventMinimize) {
                client.minimized = false;
                this.workspace.activeWindow = client;
            }
            else {
                var comment = client.minimized ? "minimized" : "unminimized";
                this.control.onWindowChanged(this, window, comment);
            }
        });
        this.connect(client.moveResizedChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.moveResizedChanged, "eventFired", `Window: caption:${client.caption} internalId:${client.internalId}, moving:${moving}, resizing:${resizing}`, { winClass: [`${client.resourceClass}`] });
            if (moving !== client.move) {
                moving = client.move;
                if (moving) {
                    this.control.onWindowMoveStart(window);
                }
                else {
                    this.control.onWindowMoveOver(this, window);
                }
            }
            if (resizing !== client.resize) {
                resizing = client.resize;
                if (resizing)
                    this.control.onWindowResizeStart(window);
                else
                    this.control.onWindowResizeOver(this, window);
            }
        });
        this.connect(client.outputChanged, () => {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.outputChanged, "eventFired", `window: caption:${client.caption} internalID:${client.internalId} output: ${client.output.name}`, { winClass: [`${client.resourceClass}`] });
            this.control.onWindowChanged(this, window, "screen=" + client.output.name);
        });
        if (CONFIG.floatSkipPager) {
            this.connect(client.skipPagerChanged, () => {
                this.control.onWindowSkipPagerChanged(this, window, client.skipPager);
            });
        }
    }
}
KWinDriver.backendName = "kwin";
class KWinTimerPool {
    constructor() {
        this.timers = [];
        this.numTimers = 0;
    }
    setTimeout(func, timeout) {
        if (this.timers.length === 0) {
            this.numTimers++;
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.setTimeout, "setTimeout/newTimer", `numTimers: ${this.numTimers}`);
        }
        const timer = this.timers.pop() ||
            Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);
        const callback = () => {
            try {
                timer.triggered.disconnect(callback);
            }
            catch (e) {
            }
            try {
                func();
            }
            catch (e) {
            }
            this.timers.push(timer);
        };
        timer.interval = timeout;
        timer.repeat = false;
        timer.triggered.connect(callback);
        timer.start();
    }
}
KWinTimerPool.instance = new KWinTimerPool();
function KWinSetTimeout(func, timeout) {
    KWinTimerPool.instance.setTimeout(func, timeout);
}
class KWinSurfaceStore {
    constructor(workspace) {
        this._store = {};
        this._userSurfacesCfg = KWinSurfaceStore.getSurfacesUserCfg();
        this.workspace = workspace;
        this._vDesktopsIds = new Set();
    }
    checkVirtualDesktops() {
        let desktops = new Set();
        this.workspace.desktops.forEach((desktop) => {
            desktops.add(desktop.id);
        });
        let removeIds = [...this._vDesktopsIds].filter((x) => !desktops.has(x));
        for (let id of removeIds) {
            LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.surfaceChanged, "checkVirtualDesktops", `The Virtual Desktop with id:${id} was deleted.`);
            this._removeById(id, "vDesktopId");
            this._vDesktopsIds.delete(id);
        }
    }
    removeByActivity(id) {
        this._removeById(id, "activityId");
    }
    getSurface(output, activity, vDesktop) {
        var _a;
        const id = KWinSurface.generateId(output, activity, vDesktop);
        if (!(id in this._store)) {
            let surfaceCfg = this._surfaceCfg(output, activity, vDesktop);
            this._store[id] = new KWinSurface(output, activity, vDesktop, this.workspace, surfaceCfg);
            this._vDesktopsIds.has(vDesktop.id) ||
                this._vDesktopsIds.add(vDesktop.id);
        }
        else if (((_a = this._store[id].output) === null || _a === void 0 ? void 0 : _a.name) === undefined) {
            this._store[id].output = output;
        }
        return this._store[id];
    }
    _surfaceCfg(output, activity, vDesktop) {
        for (let i = 0; i < this._userSurfacesCfg.length; i++) {
            let userCfg = this._userSurfacesCfg[i];
            if (userCfg.isFit(output, activity, vDesktop))
                return userCfg.cfg;
        }
        return null;
    }
    _removeById(sourceId, byType) {
        let removeIds = [];
        for (let id of Object.keys(this._store)) {
            if ((byType === "vDesktopId" && this._store[id].vDesktop.id === sourceId) ||
                (byType === "activityId" && this._store[id].activity === sourceId))
                removeIds.push(id);
        }
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.surfaceChanged, "removeById", `remove from surface store by ${byType} next surfaces: ${removeIds.map((id) => this._store[id].toString()).join("#")}`);
        removeIds.forEach((id) => {
            delete this._store[id];
        });
    }
    static getSurfacesUserCfg() {
        let userCfg = [];
        getSurfacesCfg(CONFIG.surfacesDefaultConfig).forEach((srf) => {
            let validatedCfg = KWinSurfaceStore.validateUserCfg(srf.unvalidatedCfg);
            userCfg.push(new SurfaceCfg(srf.outputName, srf.activityId, srf.vDesktopName, validatedCfg));
        });
        return userCfg;
    }
    static validateUserCfg(rawCfg) {
        let errors = [];
        const cfgFields = ["cp", "capacity"];
        let surfaceCfg = { capacity: 99 };
        rawCfg.forEach((part) => {
            let splittedPart = part.split("=").map((p) => p.trim());
            if (splittedPart.length !== 2) {
                errors.push(`"${part}" have to has the one equal sign`);
                return;
            }
            const [userCfgField, userValue] = splittedPart;
            if (userCfgField.length === 0 || userValue.length === 0) {
                errors.push(`"${part}" can not have empty field or value`);
                return;
            }
            if (cfgFields.indexOf(userCfgField) < 0) {
                errors.push(`"${userCfgField}" has unknown parameter. Possible parameters: ${cfgFields.join(",")}`);
                return;
            }
            let value;
            let key;
            switch (userCfgField) {
                case "cp":
                case "capacity":
                    value = validateNumber(userValue, 1, 99);
                    key = "capacity";
                    break;
                default:
                    errors.push(`"${part}" has unknown parameter. Possible parameters: ${cfgFields.join(",")}`);
                    return;
            }
            if (value instanceof Err)
                errors.push(`splittedPart[0]: ${value}`);
            else
                surfaceCfg[key] = value;
        });
        if (errors.length > 0) {
            warning(errors.join("\n"));
        }
        return surfaceCfg;
    }
}
class KWinSurface {
    static getHash(s) {
        let hash = 0;
        if (s.length == 0)
            return `0`;
        for (let i = 0; i < s.length; i++) {
            let charCode = s.charCodeAt(i);
            hash = (hash << 5) - hash + charCode;
            hash = hash & hash;
        }
        return `${hash}`;
    }
    static generateId(output, activity, vDesktop, isLayoutId = false) {
        let path = output.name;
        if (isLayoutId) {
            if (KWINCONFIG.layoutPerActivity)
                path += "@" + activity;
            if (KWINCONFIG.layoutPerDesktop)
                path += "#" + vDesktop.id;
        }
        else {
            path += "@" + activity;
            path += "#" + vDesktop.id;
        }
        return KWinSurface.getHash(path);
    }
    get workingArea() {
        const area = this._workspace.clientArea(0, this.output, this.vDesktop);
        return toRect(area);
    }
    get capacity() {
        return this._capacity;
    }
    set capacity(capacity) {
        this._capacity = capacity;
    }
    constructor(output, activity, vDesktop, workspace, surfaceConfig) {
        this.id = KWinSurface.generateId(output, activity, vDesktop);
        this.layoutId = KWinSurface.generateId(output, activity, vDesktop, true);
        this.ignore =
            KWINCONFIG.ignoreActivity.indexOf(activity) >= 0 ||
                KWINCONFIG.ignoreScreen.indexOf(output.name) >= 0 ||
                KWINCONFIG.ignoreVDesktop.indexOf(vDesktop.name) >= 0;
        this.output = output;
        this.activity = activity;
        this.vDesktop = vDesktop;
        this._workspace = workspace;
        this._capacity = surfaceConfig !== null ? surfaceConfig.capacity : null;
    }
    getParams() {
        return [this.output.name, this.activity, this.vDesktop.name];
    }
    next() {
        return null;
    }
    toString() {
        return ("KWinSurface(" +
            [this.output.name, this.activity, this.vDesktop.name].join(", ") +
            ")");
    }
}
class KWinWindow {
    static generateID(w) {
        return w.internalId.toString();
    }
    get fullScreen() {
        return this.window.fullScreen;
    }
    get geometry() {
        return toRect(this.window.frameGeometry);
    }
    get windowClassName() {
        return this.window.resourceClass;
    }
    get shouldIgnore() {
        if (this.window.deleted)
            return true;
        return (this.window.specialWindow ||
            this.window.resourceClass === "plasmashell" ||
            this.isIgnoredByConfig);
    }
    get shouldFloat() {
        return (this.isFloatByConfig ||
            (CONFIG.floatSkipPager && this.window.skipPager) ||
            this.window.modal ||
            this.window.transient ||
            !this.window.resizeable ||
            (KWINCONFIG.floatUtility &&
                (this.window.dialog || this.window.splash || this.window.utility)));
    }
    get minimized() {
        return this.window.minimized;
    }
    get surface() {
        let activity;
        let vDesktop;
        if (this.window.activities.length === 0)
            activity = this.workspace.currentActivity;
        else if (this.window.activities.indexOf(this.workspace.currentActivity) >= 0)
            activity = this.workspace.currentActivity;
        else
            activity = this.window.activities[0];
        if (this.window.desktops.length === 1) {
            vDesktop = this.window.desktops[0];
        }
        else if (this.window.desktops.length === 0) {
            vDesktop = this.workspace.currentDesktop;
        }
        else {
            if (this.window.desktops.indexOf(this.workspace.currentDesktop) >= 0)
                vDesktop = this.workspace.currentDesktop;
            else
                vDesktop = this.window.desktops[0];
        }
        return this._surfaceStore.getSurface(this.window.output, activity, vDesktop);
    }
    set surface(srf) {
        const ksrf = srf;
        if (this.window.desktops[0] !== ksrf.vDesktop)
            this.window.desktops = [ksrf.vDesktop];
        if (this.window.activities[0] !== ksrf.activity)
            this.window.activities = [ksrf.activity];
    }
    get minSize() {
        return {
            width: this.window.minSize.width,
            height: this.window.minSize.height,
        };
    }
    get maxSize() {
        return {
            width: this.window.maxSize.width,
            height: this.window.maxSize.height,
        };
    }
    constructor(window, workspace, surfaceStore) {
        this.workspace = workspace;
        this._surfaceStore = surfaceStore;
        this.window = window;
        this.id = KWinWindow.generateID(window);
        this.maximized = false;
        this.noBorderManaged = false;
        this.noBorderOriginal = window.noBorder;
        this.isIgnoredByConfig =
            KWinWindow.isContain(KWINCONFIG.ignoreClass, window.resourceClass) ||
                KWinWindow.isContain(KWINCONFIG.ignoreClass, window.resourceName) ||
                matchWords(this.window.caption, KWINCONFIG.ignoreTitle) >= 0 ||
                KWinWindow.isContain(KWINCONFIG.ignoreRole, window.windowRole) ||
                (KWINCONFIG.tileNothing &&
                    KWinWindow.isContain(KWINCONFIG.tilingClass, window.resourceClass));
        this.isFloatByConfig =
            KWinWindow.isContain(KWINCONFIG.floatingClass, window.resourceClass) ||
                KWinWindow.isContain(KWINCONFIG.floatingClass, window.resourceName) ||
                matchWords(this.window.caption, KWINCONFIG.floatingTitle) >= 0;
    }
    commit(geometry, noBorder, windowLayer) {
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.window, "KwinWindow#commit", `geometry:${geometry}, noBorder:${noBorder}, windowLayer:${windowLayer}`);
        if (this.window.move || this.window.resize)
            return;
        if (noBorder !== undefined) {
            if (!this.noBorderManaged && noBorder)
                this.noBorderOriginal = this.window.noBorder;
            else if (this.noBorderManaged && !this.window.noBorder)
                this.noBorderOriginal = false;
            if (noBorder)
                this.window.noBorder = true;
            else if (this.noBorderManaged)
                this.window.noBorder = this.noBorderOriginal;
            this.noBorderManaged = noBorder;
        }
        if (windowLayer !== undefined) {
            if (windowLayer === 2)
                this.window.keepAbove = true;
            else if (windowLayer === 0)
                this.window.keepBelow = true;
            else if (windowLayer === 1) {
                this.window.keepAbove = false;
                this.window.keepBelow = false;
            }
        }
        if (geometry !== undefined) {
            geometry = this.adjustGeometry(geometry);
            if (KWINCONFIG.preventProtrusion) {
                const area = toRect(this.workspace.clientArea(0, this.window.output, this.workspace.currentDesktop));
                if (!area.includes(geometry)) {
                    const x = geometry.x + Math.min(area.maxX - geometry.maxX, 0);
                    const y = geometry.y + Math.min(area.maxY - geometry.maxY, 0);
                    geometry = new Rect(x, y, geometry.width, geometry.height);
                    geometry = this.adjustGeometry(geometry);
                }
            }
            if (this.window.deleted)
                return;
            this.window.frameGeometry = toQRect(geometry);
        }
    }
    toString() {
        return `${debugWin(this.window)}`;
    }
    visible(srf) {
        const ksrf = srf;
        return (!this.window.deleted &&
            !this.window.minimized &&
            (this.window.onAllDesktops ||
                this.window.desktops.indexOf(ksrf.vDesktop) !== -1) &&
            (this.window.activities.length === 0 ||
                this.window.activities.indexOf(ksrf.activity) !== -1) &&
            this.window.output === ksrf.output);
    }
    static isContain(filterList, s) {
        for (let filterWord of filterList) {
            if (filterWord[0] === "[" && filterWord[filterWord.length - 1] === "]") {
                if (s
                    .toLowerCase()
                    .includes(filterWord.toLowerCase().slice(1, filterWord.length - 1)))
                    return true;
            }
            else if (s.toLowerCase() === filterWord.toLowerCase())
                return true;
        }
        return false;
    }
    adjustGeometry(geometry) {
        let width = geometry.width;
        let height = geometry.height;
        if (!this.window.resizeable) {
            width = this.window.width;
            height = this.window.height;
        }
        else {
            width = clip(width, this.window.minSize.width, this.window.maxSize.width);
            height = clip(height, this.window.minSize.height, this.window.maxSize.height);
        }
        return new Rect(geometry.x, geometry.y, width, height);
    }
    getInitFloatGeometry() {
        let outputGeometry = this.window.output.geometry;
        if (CONFIG.floatInit === null) {
            return toRect(outputGeometry);
        }
        let width, height, x, y;
        width = outputGeometry.width * (CONFIG.floatInit.windowWidth / 100);
        height = outputGeometry.height * (CONFIG.floatInit.windowHeight / 100);
        x = outputGeometry.x + outputGeometry.width / 2 - width / 2;
        y = outputGeometry.y + outputGeometry.height / 2 - height / 2;
        if (this.window.minSize.width > outputGeometry.width ||
            this.window.minSize.height > outputGeometry.height) {
            width = this.window.minSize.width;
            height = this.window.minSize.height;
            x = outputGeometry.x;
            y = outputGeometry.y;
        }
        else if (!this.window.resizeable ||
            this.window.maxSize.width < width ||
            this.window.maxSize.height < height) {
            width = this.window.maxSize.width;
            height = this.window.maxSize.height;
            x = outputGeometry.x + outputGeometry.width / 2 - width / 2;
            y = outputGeometry.y + outputGeometry.height / 2 - height / 2;
        }
        else {
            if (CONFIG.floatInit.randomize) {
                x =
                    x +
                        getRandomInt((x - outputGeometry.x) * (CONFIG.floatInit.randomWidth / 100), true);
                y =
                    y +
                        getRandomInt((y - outputGeometry.y) * (CONFIG.floatInit.randomHeight / 100), true);
            }
        }
        return new Rect(x, y, width, height);
    }
}
class TilingController {
    constructor(engine) {
        this.engine = engine;
        this.isDragging = false;
        this.dragCompleteTime = null;
        this._metaShortcuts = this._initMetaShortcuts();
    }
    onSurfaceUpdate(ctx) {
        this.engine.arrange(ctx, getMethodName());
    }
    onCurrentActivityChanged(ctx) {
        this.engine.arrange(ctx, getMethodName());
    }
    onCurrentSurfaceChanged(ctx) {
        this.engine.arrange(ctx, getMethodName());
    }
    onWindowAdded(ctx, window) {
        this.engine.manage(window);
        if (window.tileable) {
            const srf = ctx.currentSurface;
            const tiles = this.engine.windows.getVisibleTiles(srf);
        }
        if (window.state !== WindowState.NativeMaximized &&
            window.state !== WindowState.NativeFullscreen)
            this.engine.arrange(ctx, getMethodName());
    }
    onWindowSkipPagerChanged(ctx, window, skipPager) {
        if (skipPager)
            window.state = WindowState.Floating;
        else
            window.state = WindowState.Undecided;
        this.engine.arrange(ctx, getMethodName());
    }
    onWindowRemoved(ctx, window) {
        this.engine.unmanage(window);
        this.engine.arrange(ctx, getMethodName());
    }
    onWindowMoveStart(window) {
    }
    onWindowMove(window) {
    }
    onWindowDragging(ctx, window, windowRect) {
        if (this.isDragging)
            return;
        if (this.dragCompleteTime !== null &&
            Date.now() - this.dragCompleteTime < 100)
            return;
        const srf = ctx.currentSurface;
        const layout = this.engine.layouts.getCurrentLayout(srf);
        if (!layout.drag)
            return;
        if (window.state === WindowState.Tiled) {
            window.setDraggingState();
        }
        if (window.state === WindowState.Dragging) {
            if (layout.drag(new EngineContext(ctx, this.engine), toRect(windowRect), window, srf.workingArea)) {
                this.engine.arrange(ctx, getMethodName());
            }
            this.dragCompleteTime = Date.now();
        }
        this.isDragging = false;
    }
    onWindowMoveOver(ctx, window) {
        if (window.state === WindowState.Dragging) {
            window.setState(WindowState.Tiled);
            this.engine.arrange(ctx, getMethodName());
            return;
        }
        if (window.state === WindowState.Tiled) {
            const tiles = this.engine.windows.getVisibleTiles(ctx.currentSurface);
            const cursorPos = ctx.cursorPosition || window.actualGeometry.center;
            const targets = tiles.filter((tile) => tile !== window && tile.actualGeometry.includesPoint(cursorPos));
            if (targets.length === 1) {
                this.engine.windows.swap(window, targets[0]);
                this.engine.arrange(ctx, getMethodName());
                return;
            }
        }
        if (!CONFIG.keepTilingOnDrag && window.state === WindowState.Tiled) {
            const diff = window.actualGeometry.subtract(window.geometry);
            const distance = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
            if (distance > 30) {
                window.floatGeometry = window.actualGeometry;
                window.state = WindowState.Floating;
                this.engine.arrange(ctx, getMethodName());
                return;
            }
        }
        window.commit();
    }
    onWindowResizeStart(window) {
    }
    onWindowResize(ctx, window) {
        if (CONFIG.adjustLayout &&
            CONFIG.adjustLayoutLive &&
            window.state === WindowState.Tiled) {
            this.engine.adjustLayout(window);
            this.engine.arrange(ctx, getMethodName());
        }
        else if (window.state === WindowState.Docked) {
            this.engine.adjustDock(window);
            this.engine.arrange(ctx, getMethodName());
        }
    }
    onWindowResizeOver(ctx, window) {
        if (CONFIG.adjustLayout && window.tiled) {
            this.engine.adjustLayout(window);
            this.engine.arrange(ctx, getMethodName());
        }
        else if (window.state === WindowState.Docked) {
            this.engine.adjustDock(window);
            this.engine.arrange(ctx, getMethodName());
        }
        else if (!CONFIG.adjustLayout)
            this.engine.enforceSize(ctx, window);
    }
    onWindowMaximizeChanged(ctx, window) {
        this.engine.arrange(ctx, getMethodName());
    }
    onWindowGeometryChanged(ctx, window) {
        this.engine.enforceSize(ctx, window);
    }
    onWindowChanged(ctx, window, comment) {
        if (window) {
            if (comment === "unminimized")
                ctx.currentWindow = window;
            const workingArea = window.surface.workingArea;
            if (window.floatGeometry.width > workingArea.width) {
                window.floatGeometry.width = workingArea.width;
            }
            if (window.floatGeometry.height > workingArea.height) {
                window.floatGeometry.height = workingArea.height;
            }
            window.floatGeometry.x =
                workingArea.x + (workingArea.width - window.floatGeometry.width) / 2;
            window.floatGeometry.y =
                workingArea.y + (workingArea.height - window.floatGeometry.height) / 2;
            this.engine.arrange(ctx, getMethodName());
        }
    }
    onWindowFocused(ctx, window) {
        window.timestamp = new Date().getTime();
    }
    onDesktopsChanged(ctx, window) {
        if (window.state !== WindowState.Docked)
            window.state = WindowState.Undecided;
    }
    onShortcut(ctx, input, data) {
        if (input === Shortcut.KrohnkiteMeta) {
            ctx.metaPushed();
            return;
        }
        let metaShortcut;
        if (ctx.isMetaMode &&
            (metaShortcut = this._getMetaShortcut(input)) !== null) {
            input = metaShortcut;
        }
        let isArrangeNeeded = true;
        if (CONFIG.directionalKeyMode === "dwm") {
            switch (input) {
                case Shortcut.FocusUp:
                    input = Shortcut.FocusNext;
                    break;
                case Shortcut.FocusDown:
                    input = Shortcut.FocusPrev;
                    break;
                case Shortcut.FocusLeft:
                    input = Shortcut.DWMLeft;
                    break;
                case Shortcut.FocusRight:
                    input = Shortcut.DWMRight;
                    break;
            }
        }
        else if (CONFIG.directionalKeyMode === "focus") {
            switch (input) {
                case Shortcut.ShiftUp:
                    input = Shortcut.SwapUp;
                    break;
                case Shortcut.ShiftDown:
                    input = Shortcut.SwapDown;
                    break;
                case Shortcut.ShiftLeft:
                    input = Shortcut.SwapLeft;
                    break;
                case Shortcut.ShiftRight:
                    input = Shortcut.SwapRight;
                    break;
            }
        }
        let currentCapacity;
        const window = ctx.currentWindow;
        if (window !== null &&
            window.state === WindowState.Docked &&
            this.engine.handleDockShortcut(ctx, window, input)) {
            this.engine.arrange(ctx, getMethodName());
            return;
        }
        else if (this.engine.handleLayoutShortcut(ctx, input, data)) {
            this.engine.arrange(ctx, getMethodName());
            return;
        }
        switch (input) {
            case Shortcut.FocusNext:
                this.engine.focusOrder(ctx, +1);
                break;
            case Shortcut.FocusPrev:
                this.engine.focusOrder(ctx, -1);
                break;
            case Shortcut.FocusUp:
                this.engine.focusDir(ctx, "up");
                break;
            case Shortcut.FocusDown:
                this.engine.focusDir(ctx, "down");
                break;
            case Shortcut.DWMLeft:
            case Shortcut.FocusLeft:
                this.engine.focusDir(ctx, "left");
                break;
            case Shortcut.DWMRight:
            case Shortcut.FocusRight:
                this.engine.focusDir(ctx, "right");
                break;
            case Shortcut.GrowWidth:
                if (window) {
                    if (window.state === WindowState.Docked && window.dock) {
                        if (window.dock.position === DockPosition.left ||
                            window.dock.position === DockPosition.right) {
                            window.dock.cfg.vWide += 1;
                        }
                        else if (window.dock.position === DockPosition.top ||
                            window.dock.position === DockPosition.bottom) {
                            window.dock.cfg.hWide += 1;
                        }
                    }
                    else
                        this.engine.resizeWindow(window, "east", 1);
                }
                break;
            case Shortcut.ShrinkWidth:
                if (window) {
                    if (window.state === WindowState.Docked && window.dock) {
                        if (window.dock.position === DockPosition.left ||
                            window.dock.position === DockPosition.right) {
                            window.dock.cfg.vWide -= 1;
                        }
                        else if (window.dock.position === DockPosition.top ||
                            window.dock.position === DockPosition.bottom) {
                            window.dock.cfg.hWide -= 1;
                        }
                    }
                    else
                        this.engine.resizeWindow(window, "east", -1);
                }
                break;
            case Shortcut.GrowHeight:
                if (window) {
                    if (window.state === WindowState.Docked && window.dock) {
                        if (window.dock.position === DockPosition.left ||
                            window.dock.position === DockPosition.right) {
                            window.dock.cfg.vHeight += 1;
                        }
                        else if (window.dock.position === DockPosition.top ||
                            window.dock.position === DockPosition.bottom) {
                            window.dock.cfg.hHeight += 1;
                        }
                    }
                    else
                        this.engine.resizeWindow(window, "south", 1);
                }
                break;
            case Shortcut.ShrinkHeight:
                if (window) {
                    if (window.state === WindowState.Docked && window.dock) {
                        if (window.dock.position === DockPosition.left ||
                            window.dock.position === DockPosition.right) {
                            window.dock.cfg.vHeight -= 1;
                        }
                        else if (window.dock.position === DockPosition.top ||
                            window.dock.position === DockPosition.bottom) {
                            window.dock.cfg.hHeight -= 1;
                        }
                    }
                    else
                        this.engine.resizeWindow(window, "south", -1);
                }
                break;
            case Shortcut.ShiftUp:
                if (window)
                    this.engine.swapOrder(window, -1);
                break;
            case Shortcut.ShiftDown:
                if (window)
                    this.engine.swapOrder(window, +1);
                break;
            case Shortcut.SwapUp:
                isArrangeNeeded = this.engine.swapDirOrMoveFloat(ctx, "up");
                break;
            case Shortcut.SwapDown:
                isArrangeNeeded = this.engine.swapDirOrMoveFloat(ctx, "down");
                break;
            case Shortcut.SwapLeft:
                isArrangeNeeded = this.engine.swapDirOrMoveFloat(ctx, "left");
                break;
            case Shortcut.SwapRight:
                isArrangeNeeded = this.engine.swapDirOrMoveFloat(ctx, "right");
                break;
            case Shortcut.SetMaster:
                if (window)
                    this.engine.setMaster(window);
                break;
            case Shortcut.ToggleFloat:
                if (window)
                    this.engine.toggleFloat(window);
                break;
            case Shortcut.ToggleFloatAll:
                this.engine.floatAll(ctx, ctx.currentSurface);
                break;
            case Shortcut.NextLayout:
                this.engine.cycleLayout(ctx, 1);
                break;
            case Shortcut.PreviousLayout:
                this.engine.cycleLayout(ctx, -1);
                break;
            case Shortcut.SetLayout:
                if (typeof data === "string")
                    this.engine.setLayout(ctx, data);
                break;
            case Shortcut.ToggleDock:
                if (window)
                    this.engine.toggleDock(window);
                break;
            case Shortcut.RaiseSurfaceCapacity:
                currentCapacity = this.engine.raiseSurfaceCapacity(ctx);
                ctx.showNotification(`Surface capacity: ${currentCapacity !== null ? currentCapacity : "unlimited"}`);
                break;
            case Shortcut.LowerSurfaceCapacity:
                currentCapacity = this.engine.lowerSurfaceCapacity(ctx);
                ctx.showNotification(`Surface capacity: ${currentCapacity}`);
                break;
            case Shortcut.ResetSurfaceCapacity:
                currentCapacity = this.engine.ResetSurfaceCapacity(ctx);
                ctx.showNotification(`Surface capacity: ${currentCapacity !== null ? currentCapacity : "unlimited"}`);
                isArrangeNeeded = false;
                break;
        }
        if (!isArrangeNeeded)
            return;
        this.engine.arrange(ctx, getMethodName());
    }
    _initMetaShortcuts() {
        let metaShortcuts = {};
        CONFIG.metaConfig.forEach((shortcutPair) => {
            let splitted = shortcutPair.split("=").map((p) => p.trim());
            if (splitted.length !== 2) {
                warning(`"Meta Config: ${splitted}" have to has the one equal sign`);
                return;
            }
            let [pushedShortcut, runShortcut] = splitted;
            if (!(pushedShortcut in Shortcut)) {
                warning(`Meta Config: "${pushedShortcut}" unknown shortcut`);
                return;
            }
            else if (!(runShortcut in Shortcut)) {
                warning(`Meta Config: "${runShortcut}" unknown shortcut`);
                return;
            }
            metaShortcuts[pushedShortcut] = runShortcut;
        });
        return metaShortcuts;
    }
    _getMetaShortcut(input) {
        if (input in this._metaShortcuts) {
            return this._metaShortcuts[input];
        }
        else
            return null;
    }
}
class TilingEngine {
    constructor() {
        this.layouts = new LayoutStore();
        this.windows = new WindowStore();
        this.docks = new DockStore();
        this._defaultGaps = null;
        this._gapsSurfacesCfg = [];
    }
    adjustLayout(basis) {
        let delta = basis.geometryDelta;
        if (delta === null)
            return;
        const srf = basis.surface;
        const layout = this.layouts.getCurrentLayout(srf);
        if (layout.adjust) {
            const gaps = this.getGaps(srf);
            const area = srf.workingArea.gap(gaps.left, gaps.right, gaps.top, gaps.bottom);
            const tiles = this.windows.getVisibleTiles(srf);
            layout.adjust(area, tiles, basis, delta, gaps.between);
        }
    }
    adjustDock(basis) {
        if (basis.actualGeometry === basis.geometry)
            return;
        let widthDiff = basis.actualGeometry.width - basis.geometry.width;
        let heightDiff = basis.actualGeometry.height - basis.geometry.height;
        let dockCfg = basis.dock.cfg;
        const workingArea = basis.surface.workingArea;
        switch (basis.dock.position) {
            case DockPosition.left:
            case DockPosition.right:
                dockCfg.vHeight =
                    dockCfg.vHeight + (100 * heightDiff) / workingArea.height;
                dockCfg.vWide = dockCfg.vWide + (100 * widthDiff) / workingArea.width;
                break;
            case DockPosition.top:
            case DockPosition.bottom:
                dockCfg.hHeight =
                    dockCfg.hHeight + (100 * heightDiff) / workingArea.height;
                dockCfg.hWide = dockCfg.hWide + (100 * widthDiff) / workingArea.width;
                break;
        }
    }
    resizeFloat(window, dir, step) {
        const srf = window.surface;
        const hStepSize = srf.workingArea.width * 0.05;
        const vStepSize = srf.workingArea.height * 0.05;
        let hStep, vStep;
        switch (dir) {
            case "east":
                ((hStep = step), (vStep = 0));
                break;
            case "west":
                ((hStep = -step), (vStep = 0));
                break;
            case "south":
                ((hStep = 0), (vStep = step));
                break;
            case "north":
                ((hStep = 0), (vStep = -step));
                break;
        }
        const geometry = window.actualGeometry;
        const width = geometry.width + hStepSize * hStep;
        const height = geometry.height + vStepSize * vStep;
        window.forceSetGeometry(new Rect(geometry.x, geometry.y, width, height));
    }
    resizeTile(basis, dir, step) {
        const srf = basis.surface;
        const gaps = this.getGaps(srf);
        if (dir === "east") {
            const maxX = basis.geometry.maxX;
            const easternNeighbor = this.windows
                .getVisibleTiles(srf)
                .filter((tile) => tile.geometry.x >= maxX);
            if (easternNeighbor.length === 0) {
                dir = "west";
                step *= -1;
            }
        }
        else if (dir === "south") {
            const maxY = basis.geometry.maxY;
            const southernNeighbor = this.windows
                .getVisibleTiles(srf)
                .filter((tile) => tile.geometry.y >= maxY);
            if (southernNeighbor.length === 0) {
                dir = "north";
                step *= -1;
            }
        }
        const hStepSize = srf.workingArea.width * 0.03;
        const vStepSize = srf.workingArea.height * 0.03;
        let delta;
        switch (dir) {
            case "east":
                delta = new RectDelta(hStepSize * step, 0, 0, 0);
                break;
            case "west":
                delta = new RectDelta(0, hStepSize * step, 0, 0);
                break;
            case "south":
                delta = new RectDelta(0, 0, vStepSize * step, 0);
                break;
            case "north":
            default:
                delta = new RectDelta(0, 0, 0, vStepSize * step);
                break;
        }
        const layout = this.layouts.getCurrentLayout(srf);
        if (layout.adjust) {
            const area = srf.workingArea.gap(gaps.left, gaps.right, gaps.top, gaps.bottom);
            layout.adjust(area, this.windows.getVisibleTileables(srf), basis, delta, gaps.between);
        }
    }
    resizeWindow(window, dir, step) {
        const state = window.state;
        if (WindowClass.isFloatingState(state))
            this.resizeFloat(window, dir, step);
        else if (WindowClass.isTiledState(state))
            this.resizeTile(window, dir, step);
    }
    arrange(ctx, reason) {
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "ArrangeScreens", `###################################################Reason: ${reason}####################################`);
        const surfaces = ctx.currentSurfaces;
        let screensData = [];
        surfaces.forEach((srf) => {
            screensData.push(this.getTileables(srf));
        });
        if (CONFIG.surfacesIsMoveWindows && reason !== "moveWindowsToScreen") {
            let isMoving = false;
            screensData.forEach((screenData) => {
                if (screenData.overCapacity.length > 0) {
                    for (let i = 0; i < screensData.length; i++) {
                        let sd = screensData[i];
                        if (sd.capacity === null) {
                            sd.awaitToMove.push(...screenData.overCapacity.splice(0, screenData.overCapacity.length));
                            isMoving = true;
                        }
                        else if (sd.capacity - sd.awaitToMove.length > 0) {
                            const availableSlots = Math.min(sd.capacity - sd.awaitToMove.length, screenData.overCapacity.length);
                            sd.awaitToMove.push(...screenData.overCapacity.splice(0, availableSlots));
                            isMoving = true;
                        }
                        if (screenData.overCapacity.length === 0) {
                            break;
                        }
                    }
                }
            });
            if (isMoving) {
                let moveTiles = [];
                screensData.forEach((screenData) => {
                    if (screenData.awaitToMove.length > 0)
                        moveTiles.push([screenData.srf.output, screenData.awaitToMove]);
                });
                ctx.moveWindowsToScreen(moveTiles);
                return;
            }
        }
        screensData.forEach((screenData) => {
            this.arrangeScreen(ctx, screenData);
        });
    }
    getTileables(srf) {
        let visibles = this.windows.getVisibleWindows(srf);
        visibles.forEach((window) => {
            if (window.state === WindowState.Undecided) {
                window.state =
                    window.shouldFloat || CONFIG.floatDefault
                        ? WindowState.Floating
                        : WindowState.Tiled;
            }
        });
        if (LOG === null || LOG === void 0 ? void 0 : LOG.isModuleOn(LogModules.arrangeScreen)) {
            let mes = "";
            visibles.forEach((tile) => {
                mes += `${tile}\n`;
            });
            LOG.print(LogModules.arrangeScreen, "visibles", mes);
        }
        let tileables = this.windows.getVisibleTileables(srf);
        let layout = this.layouts.getCurrentLayout(srf);
        let capacity;
        let layoutCap = layout.capacity === undefined ? null : layout.capacity;
        if (layoutCap === null && srf.capacity === null) {
            capacity = null;
        }
        else if (layoutCap === null || srf.capacity === null) {
            capacity = layoutCap || srf.capacity;
        }
        else {
            capacity = Math.min(layoutCap, srf.capacity);
        }
        let overCapacity;
        if (capacity !== null && tileables.length > capacity) {
            if (!CONFIG.surfacesIsMoveOldestWindows) {
                overCapacity = tileables.splice(capacity - tileables.length);
            }
            else {
                overCapacity = tileables.splice(0, tileables.length - capacity);
            }
            capacity = 0;
        }
        else {
            overCapacity = [];
            capacity = capacity === null ? null : capacity - tileables.length;
        }
        let screenData = {
            visibles: visibles,
            tileables: tileables,
            layout: layout,
            workingArea: this.docks.render(srf, visibles, srf.workingArea.clone()),
            srf: srf,
            overCapacity: overCapacity,
            capacity: capacity,
            awaitToMove: [],
        };
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "getTileablesReturn", `output: ${srf.output.name}\n visibles number: ${visibles.length}\n tileables.length: ${screenData.tileables.length}, workingArea: ${screenData.workingArea}, layout: ${screenData.layout},capacity: ${capacity}, overCapacity: ${screenData.overCapacity.map((win) => win.window.windowClassName)}`);
        return screenData;
    }
    arrangeScreen(ctx, screenData) {
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "arrangeScreen", `output: ${screenData.srf.output.name}`);
        screenData.overCapacity.forEach((win) => {
            win.state = WindowState.Floating;
        });
        const gaps = this.getGaps(screenData.srf);
        let tilingArea;
        if ((CONFIG.monocleMaximize && screenData.layout instanceof MonocleLayout) ||
            (screenData.tileables.length === 1 && CONFIG.soleWindowNoGaps))
            tilingArea = screenData.workingArea;
        else if (screenData.tileables.length === 1 &&
            ((CONFIG.soleWindowWidth < 100 && CONFIG.soleWindowWidth > 0) ||
                (CONFIG.soleWindowHeight < 100 && CONFIG.soleWindowHeight > 0))) {
            const h_gap = (screenData.workingArea.height -
                screenData.workingArea.height * (CONFIG.soleWindowHeight / 100)) /
                2;
            const v_gap = (screenData.workingArea.width -
                screenData.workingArea.width * (CONFIG.soleWindowWidth / 100)) /
                2;
            tilingArea = screenData.workingArea.gap(v_gap, v_gap, h_gap, h_gap);
        }
        else
            tilingArea = screenData.workingArea.gap(gaps.left, gaps.right, gaps.top, gaps.bottom);
        let tileablesLen = screenData.tileables.length;
        if (tileablesLen > 0) {
            let engineCtx = new EngineContext(ctx, this);
            function layoutApply() {
                screenData.layout.apply(engineCtx, screenData.tileables, tilingArea, gaps.between);
                if (LOG === null || LOG === void 0 ? void 0 : LOG.isModuleOn(LogModules.arrangeScreen)) {
                    let mes = "";
                    screenData.tileables.forEach((tile) => {
                        mes += `${tile.id}, state:${windowStateStr(tile.state)}, commitGeometry:${tile.geometry}\n`;
                    });
                    LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "LayoutApply", mes);
                }
            }
            function getNumberTileablesGreaterThenMin(tileables) {
                let numberOfTiles = 0;
                tileables.forEach((tile) => {
                    if (tile.minSize.height > tile.geometry.height ||
                        tile.minSize.width > tile.geometry.width) {
                        numberOfTiles++;
                    }
                });
                return numberOfTiles;
            }
            layoutApply();
            if (CONFIG.unfitGreater || CONFIG.unfitLess) {
                let unfitGreaterQuantity = 0;
                screenData.tileables = screenData.tileables.filter((tile) => {
                    if (CONFIG.unfitLess &&
                        (tile.maxSize.height < tile.geometry.height ||
                            tile.maxSize.width < tile.geometry.width)) {
                        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "unfitLess", `id: ${tile.id} commitGeometry:${tile.geometry}. minSize:${tile.minSize.width}:${tile.minSize.height} - heightUnfit:${tile.minSize.height > tile.geometry.height} widthUnfit: ${tile.minSize.width > tile.geometry.width}, tile.maxSize:${tile.maxSize.width}:${tile.maxSize.height} heightUnfit: ${tile.maxSize.height < tile.geometry.height}, widthUnfit: ${tile.maxSize.width < tile.geometry.width}`);
                        tile.state = WindowState.Floating;
                        return false;
                    }
                    else if (CONFIG.unfitGreater &&
                        (tile.minSize.height > tile.geometry.height ||
                            tile.minSize.width > tile.geometry.width)) {
                        unfitGreaterQuantity += 1;
                        return true;
                    }
                    else {
                        return true;
                    }
                });
                if (screenData.tileables.length !== tileablesLen) {
                    layoutApply();
                }
                if (unfitGreaterQuantity > 0) {
                    LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "UnfitGreater", `unfitGreaterQuantity: ${unfitGreaterQuantity}`);
                    if (screenData.tileables.length !== tileablesLen) {
                        unfitGreaterQuantity = getNumberTileablesGreaterThenMin(screenData.tileables);
                    }
                    while (screenData.tileables.length > 0 && unfitGreaterQuantity > 0) {
                        let tile = screenData.tileables.shift();
                        tile.state = WindowState.Floating;
                        layoutApply();
                        unfitGreaterQuantity = getNumberTileablesGreaterThenMin(screenData.tileables);
                    }
                }
            }
        }
        if (CONFIG.limitTileWidthRatio > 0 &&
            !(screenData.layout instanceof MonocleLayout)) {
            const maxWidth = Math.floor(screenData.workingArea.height * CONFIG.limitTileWidthRatio);
            screenData.tileables
                .filter((tile) => tile.tiled && tile.geometry.width > maxWidth)
                .forEach((tile) => {
                const g = tile.geometry;
                tile.geometry = new Rect(g.x + Math.floor((g.width - maxWidth) / 2), g.y, maxWidth, g.height);
            });
        }
        if (CONFIG.soleWindowNoBorders && screenData.tileables.length === 1) {
            screenData.visibles.forEach((window) => {
                if (window.state === WindowState.Tiled)
                    window.commit(CONFIG.soleWindowNoBorders);
                else
                    window.commit();
            });
        }
        else {
            screenData.visibles.forEach((window) => window.commit());
        }
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "#######################################################Finished", `${screenData.srf}`);
    }
    enforceSize(ctx, window) {
        if (window.tiled && !window.actualGeometry.equals(window.geometry))
            ctx.setTimeout(() => {
                if (window.tiled)
                    window.commit();
            }, 10);
    }
    manage(window) {
        if (!window.shouldIgnore) {
            if (this.docks.isNewWindowHaveDocked(window)) {
                window.state = WindowState.Docked;
            }
            else
                window.state = WindowState.Undecided;
            if (CONFIG.newWindowPosition === 1)
                this.windows.unshift(window);
            else if (CONFIG.newWindowPosition === 2) {
                this.windows.beside_first(window);
            }
            else
                this.windows.push(window);
        }
    }
    unmanage(window) {
        if (window.state === WindowState.Docked) {
            this.docks.remove(window);
        }
        this.windows.remove(window);
    }
    focusOrder(ctx, step) {
        const window = ctx.currentWindow;
        if (window === null) {
            const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
            if (tiles.length > 1)
                ctx.currentWindow = tiles[0];
            return;
        }
        const visibles = this.windows.getVisibleWindows(ctx.currentSurface);
        if (visibles.length === 0)
            return;
        const idx = visibles.indexOf(window);
        if (!window || idx < 0) {
            ctx.currentWindow = visibles[0];
            return;
        }
        const num = visibles.length;
        const newIndex = (idx + (step % num) + num) % num;
        ctx.currentWindow = visibles[newIndex];
    }
    focusDir(ctx, dir) {
        const window = ctx.currentWindow;
        if (window === null) {
            const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
            if (tiles.length > 1)
                ctx.currentWindow = tiles[0];
            return;
        }
        const neighbor = this.getNeighborByDirection(ctx, window, dir);
        if (neighbor)
            ctx.currentWindow = neighbor;
    }
    swapOrder(window, step) {
        const srf = window.surface;
        const visibles = this.windows.getVisibleWindows(srf);
        if (visibles.length < 2)
            return;
        const vsrc = visibles.indexOf(window);
        const vdst = wrapIndex(vsrc + step, visibles.length);
        const dstWin = visibles[vdst];
        this.windows.move(window, dstWin);
    }
    swapDirection(ctx, direction, window) {
        const neighbor = this.getNeighborByDirection(ctx, window, direction);
        if (neighbor) {
            this.windows.swap(window, neighbor);
            return true;
        }
        if (ctx.moveToScreen(window, direction)) {
            return false;
        }
        return ctx.moveToVDesktop(window, direction);
    }
    moveFloat(window, dir) {
        const srf = window.surface;
        const hStepSize = srf.workingArea.width * 0.05;
        const vStepSize = srf.workingArea.height * 0.05;
        let hStep, vStep;
        switch (dir) {
            case "up":
                ((hStep = 0), (vStep = -1));
                break;
            case "down":
                ((hStep = 0), (vStep = 1));
                break;
            case "left":
                ((hStep = -1), (vStep = 0));
                break;
            case "right":
                ((hStep = 1), (vStep = 0));
                break;
        }
        const geometry = window.actualGeometry;
        const x = geometry.x + hStepSize * hStep;
        const y = geometry.y + vStepSize * vStep;
        window.forceSetGeometry(new Rect(x, y, geometry.width, geometry.height));
    }
    swapDirOrMoveFloat(ctx, dir) {
        const window = ctx.currentWindow;
        if (window === null) {
            const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
            if (tiles.length > 0)
                ctx.currentWindow = tiles[0];
            return false;
        }
        const state = window.state;
        if (WindowClass.isFloatingState(state))
            this.moveFloat(window, dir);
        else if (WindowClass.isTiledState(state)) {
            return this.swapDirection(ctx, dir, window);
        }
        return true;
    }
    toggleDock(window) {
        window.state =
            window.state !== WindowState.Docked
                ? WindowState.Docked
                : WindowState.Tiled;
    }
    raiseSurfaceCapacity(ctx) {
        const currentSurface = ctx.currentSurface;
        if (currentSurface.capacity !== null) {
            currentSurface.capacity =
                currentSurface.capacity < 98 ? currentSurface.capacity + 1 : null;
        }
        else {
            let tileables = this.windows.getVisibleTileables(currentSurface);
            currentSurface.capacity =
                tileables.length < 98 ? tileables.length + 1 : null;
        }
        return currentSurface.capacity;
    }
    lowerSurfaceCapacity(ctx) {
        const currentSurface = ctx.currentSurface;
        if (currentSurface.capacity !== null) {
            currentSurface.capacity =
                currentSurface.capacity > 0 ? currentSurface.capacity - 1 : 0;
        }
        else {
            let tileables = this.windows.getVisibleTileables(currentSurface);
            currentSurface.capacity = tileables.length > 0 ? tileables.length - 1 : 0;
        }
        return currentSurface.capacity;
    }
    ResetSurfaceCapacity(ctx) {
        return (ctx.currentSurface.capacity = null);
    }
    toggleFloat(window) {
        window.state = !window.tileable ? WindowState.Tiled : WindowState.Floating;
    }
    floatAll(ctx, srf) {
        const windows = this.windows.getVisibleWindows(srf);
        const numFloats = windows.reduce((count, window) => {
            return window.state === WindowState.Floating ? count + 1 : count;
        }, 0);
        if (numFloats === 0) {
            windows.forEach((window) => {
                window.state = WindowState.Floating;
            });
            ctx.showNotification("Float All");
        }
        else {
            windows.forEach((window) => {
                window.state = WindowState.Tiled;
            });
            ctx.showNotification("Tile All");
        }
    }
    setMaster(window) {
        this.windows.setMaster(window);
    }
    cycleLayout(ctx, step) {
        const layout = this.layouts.cycleLayout(ctx.currentSurface, step);
        if (layout)
            ctx.showNotification(layout.description);
    }
    setLayout(ctx, layoutClassID) {
        const layout = this.layouts.setLayout(ctx.currentSurface, layoutClassID);
        if (layout)
            ctx.showNotification(layout.description);
    }
    handleLayoutShortcut(ctx, input, data) {
        const layout = this.layouts.getCurrentLayout(ctx.currentSurface);
        if (layout.handleShortcut)
            return layout.handleShortcut(new EngineContext(ctx, this), input, data);
        return false;
    }
    handleDockShortcut(ctx, window, input) {
        return this.docks.handleShortcut(ctx, window, input);
    }
    getNeighborByDirection(ctx, basis, dir) {
        let vertical;
        let sign;
        switch (dir) {
            case "up":
                vertical = true;
                sign = -1;
                break;
            case "down":
                vertical = true;
                sign = 1;
                break;
            case "left":
                vertical = false;
                sign = -1;
                break;
            case "right":
                vertical = false;
                sign = 1;
                break;
            default:
                return null;
        }
        const candidates = this.windows
            .getVisibleTiles(ctx.currentSurface)
            .filter(vertical
            ? (tile) => tile.geometry.y * sign > basis.geometry.y * sign
            : (tile) => tile.geometry.x * sign > basis.geometry.x * sign)
            .filter(vertical
            ? (tile) => overlap(basis.geometry.x, basis.geometry.maxX, tile.geometry.x, tile.geometry.maxX)
            : (tile) => overlap(basis.geometry.y, basis.geometry.maxY, tile.geometry.y, tile.geometry.maxY));
        if (candidates.length === 0)
            return null;
        const min = sign *
            candidates.reduce(vertical
                ? (prevMin, tile) => Math.min(tile.geometry.y * sign, prevMin)
                : (prevMin, tile) => Math.min(tile.geometry.x * sign, prevMin), Infinity);
        const closest = candidates.filter(vertical
            ? (tile) => tile.geometry.y === min
            : (tile) => tile.geometry.x === min);
        return closest.sort((a, b) => b.timestamp - a.timestamp)[0];
    }
    getGaps(srf) {
        if (this._defaultGaps === null) {
            this._defaultGaps = DefaultGapsCfg.instance;
            this._gapsSurfacesCfg = gapsSurfaceCfg.parseGapsUserSurfacesCfg();
        }
        const surfaceCfg = this._gapsSurfacesCfg.find((surfaceCfg) => surfaceCfg.isFit(srf));
        if (surfaceCfg === undefined)
            return this._defaultGaps;
        return surfaceCfg.cfg;
    }
}
class EngineContext {
    get backend() {
        return this.drvctx.backend;
    }
    get currentWindow() {
        return this.drvctx.currentWindow;
    }
    set currentWindow(window) {
        this.drvctx.currentWindow = window;
    }
    get cursorPos() {
        return this.drvctx.cursorPosition;
    }
    get surfaceParams() {
        let srf = this.drvctx.currentSurface;
        return srf.output.name, srf.activity, srf.vDesktop.name;
    }
    constructor(drvctx, engine) {
        this.drvctx = drvctx;
        this.engine = engine;
    }
    setTimeout(func, timeout) {
        this.drvctx.setTimeout(func, timeout);
    }
    cycleFocus(step) {
        this.engine.focusOrder(this.drvctx, step);
    }
    moveWindow(window, target, after) {
        this.engine.windows.move(window, target, after);
    }
    moveWindowByWinId(window, targetId, after) {
        let target = this.engine.windows.getWindowById(targetId);
        if (target === null)
            return;
        this.engine.windows.moveNew(window, target, after);
    }
    getWindowById(id) {
        return this.engine.windows.getWindowById(id);
    }
    showNotification(text) {
        this.drvctx.showNotification(text);
    }
}
class DefaultGapsCfg {
    constructor() {
        let left = validateNumber(CONFIG.screenGapLeft);
        if (left instanceof Err) {
            warning(`DefaultGapsCfg: left: ${left}`);
            this.left = 0;
        }
        else
            this.left = left;
        let right = validateNumber(CONFIG.screenGapRight);
        if (right instanceof Err) {
            warning(`DefaultGapsCfg: right: ${right}`);
            this.right = 0;
        }
        else
            this.right = right;
        let top = validateNumber(CONFIG.screenGapTop);
        if (top instanceof Err) {
            warning(`DefaultGapsCfg: top: ${top}`);
            this.top = 0;
        }
        else
            this.top = top;
        let bottom = validateNumber(CONFIG.screenGapBottom);
        if (bottom instanceof Err) {
            warning(`DefaultGapsCfg: bottom: ${bottom}`);
            this.bottom = 0;
        }
        else
            this.bottom = bottom;
        let between = validateNumber(CONFIG.screenGapBetween);
        if (between instanceof Err) {
            warning(`DefaultGapsCfg: between: ${between}`);
            this.between = 0;
        }
        else
            this.between = between;
    }
    static get instance() {
        if (!DefaultGapsCfg._gapsInstance) {
            DefaultGapsCfg._gapsInstance = new DefaultGapsCfg();
        }
        return DefaultGapsCfg._gapsInstance;
    }
    cloneAndUpdate(cfg) {
        return Object.assign({}, DefaultGapsCfg.instance, cfg);
    }
}
class gapsSurfaceCfg {
    constructor(outputName, activityId, vDesktopName, cfg) {
        this.outputName = outputName;
        this.activityId = activityId;
        this.vDesktopName = vDesktopName;
        this.cfg = cfg;
    }
    isFit(srf) {
        return ((this.outputName === "" || this.outputName === srf.output.name) &&
            (this.vDesktopName === "" || this.vDesktopName === srf.vDesktop.name) &&
            (this.activityId === "" || this.activityId === srf.activity));
    }
    toString() {
        return `gapsSurfaceCfg: Output Name: ${this.outputName}, Activity ID: ${this.activityId}, Virtual Desktop Name: ${this.vDesktopName} cfg: ${this.cfg}`;
    }
    static parseGapsUserSurfacesCfg() {
        let surfacesCfg = [];
        if (CONFIG.gapsOverrideConfig.length === 0)
            return surfacesCfg;
        CONFIG.gapsOverrideConfig.forEach((cfg) => {
            let surfaceCfgString = cfg.split(":").map((part) => part.trim());
            if ([2, 4].indexOf(surfaceCfgString.length) < 0) {
                warning(`Invalid Gaps surface config: ${cfg}, config must have one or three colons`);
                return;
            }
            let outputName = surfaceCfgString[0];
            let activityId;
            let vDesktopName;
            let userCfg;
            if (surfaceCfgString.length === 4) {
                activityId = surfaceCfgString[1];
                vDesktopName = surfaceCfgString[2];
                userCfg = surfaceCfgString[3];
            }
            else {
                activityId = "";
                vDesktopName = "";
                userCfg = surfaceCfgString[1];
            }
            let splittedUserCfg = userCfg
                .split(",")
                .map((part) => part.trim().toLowerCase());
            let partialGapsCfg = gapsSurfaceCfg.parseSplittedGapsCfg(splittedUserCfg);
            if (partialGapsCfg instanceof Err) {
                warning(`Invalid Gaps User surface config: ${cfg}. ${partialGapsCfg}`);
                return;
            }
            if (Object.keys(partialGapsCfg).length > 0) {
                surfacesCfg.push(new gapsSurfaceCfg(outputName, activityId, vDesktopName, DefaultGapsCfg.instance.cloneAndUpdate(partialGapsCfg)));
            }
        });
        return surfacesCfg;
    }
    static parseSplittedGapsCfg(splittedUserCfg) {
        let errors = [];
        let value;
        let gapsCfg = {};
        splittedUserCfg.forEach((part) => {
            let splittedPart = part
                .split("=")
                .map((part) => part.trim().toLowerCase());
            if (splittedPart.length !== 2) {
                errors.push(`"${part}" can have only one equal sign`);
                return;
            }
            if (splittedPart[0].length === 0 || splittedPart[1].length === 0) {
                errors.push(`"${part}" can not have empty name or value`);
                return;
            }
            value = validateNumber(splittedPart[1]);
            if (value instanceof Err) {
                errors.push(`GapsCfg: ${part}, ${splittedPart[1]} ${value}`);
                return;
            }
            switch (splittedPart[0]) {
                case "left":
                case "l":
                    gapsCfg["left"] = value;
                    break;
                case "right":
                case "r":
                    gapsCfg["right"] = value;
                    break;
                case "top":
                case "t":
                    gapsCfg["top"] = value;
                    break;
                case "bottom":
                case "b":
                    gapsCfg["bottom"] = value;
                    break;
                case "between":
                case "e":
                    gapsCfg["between"] = value;
                    break;
                default:
                    errors.push(` "${part}" unknown parameter name. It can be l,r,t,b,e or left,right,top,bottom,between`);
                    return;
            }
        });
        if (errors.length > 0) {
            return new Err(errors.join("\n"));
        }
        return gapsCfg;
    }
}
class LayoutStoreEntry {
    get currentLayout() {
        return this.loadLayout(this.currentID);
    }
    constructor(outputName, desktopName, activity, desktopId) {
        let layouts = CONFIG.layoutOrder.map((layout) => layout.toLowerCase());
        let layouts_str = layouts.map((layout, i) => i + "." + layout + " ");
        print(`Krohnkite: Screen(output):${outputName}, Desktop(name):${desktopName}(id):${desktopId}, Activity: ${activity}, layouts: ${layouts_str}`);
        this.currentIndex = 0;
        this.currentID = CONFIG.layoutOrder[0];
        CONFIG.screenDefaultLayout.some((entry) => {
            let cfg = entry.split(":");
            const cfgLength = cfg.length;
            if (cfgLength < 2 && cfgLength > 4)
                return false;
            let cfgOutput = cfg[0];
            let cfgActivity = "";
            let cfgVDesktop = "";
            let cfgLayout = undefined;
            if (cfgLength === 2) {
                cfgLayout = cfg[1];
            }
            else if (cfgLength === 3) {
                cfgVDesktop = cfg[1];
                cfgLayout = cfg[2];
            }
            else if (cfgLength === 4) {
                cfgActivity = cfg[1];
                cfgVDesktop = cfg[2];
                cfgLayout = cfg[3];
            }
            if (cfgLayout === undefined)
                return false;
            let cfgLayoutId = parseInt(cfgLayout);
            if (isNaN(cfgLayoutId)) {
                cfgLayoutId = layouts.indexOf(cfgLayout.toLowerCase());
                cfgLayoutId =
                    cfgLayoutId >= 0
                        ? cfgLayoutId
                        : layouts.indexOf(cfgLayout.toLowerCase() + "layout");
            }
            if ((outputName === cfgOutput || cfgOutput === "") &&
                (desktopName === cfgVDesktop || cfgVDesktop === "") &&
                (activity === cfgActivity || cfgActivity === "") &&
                cfgLayoutId >= 0 &&
                cfgLayoutId < CONFIG.layoutOrder.length) {
                this.currentIndex = cfgLayoutId;
                this.currentID = CONFIG.layoutOrder[this.currentIndex];
                return true;
            }
        });
        this.layouts = {};
        this.previousID = this.currentID;
        this.loadLayout(this.currentID);
    }
    cycleLayout(step) {
        this.previousID = this.currentID;
        this.currentIndex =
            this.currentIndex !== null
                ? wrapIndex(this.currentIndex + step, CONFIG.layoutOrder.length)
                : 0;
        this.currentID = CONFIG.layoutOrder[this.currentIndex];
        return this.loadLayout(this.currentID);
    }
    setLayout(targetID) {
        let targetLayout = this.loadLayout(targetID);
        if (targetLayout instanceof MonocleLayout &&
            this.currentLayout instanceof MonocleLayout) {
            this.currentID = this.previousID;
            this.previousID = targetID;
            targetLayout = this.loadLayout(this.currentID);
        }
        else if (this.currentID !== targetID) {
            this.previousID = this.currentID;
            this.currentID = targetID;
        }
        this.updateCurrentIndex();
        return targetLayout;
    }
    updateCurrentIndex() {
        const idx = CONFIG.layoutOrder.indexOf(this.currentID);
        this.currentIndex = idx === -1 ? null : idx;
    }
    loadLayout(ID) {
        let layout = this.layouts[ID];
        if (!layout)
            layout = this.layouts[ID] = CONFIG.layoutFactories[ID]();
        return layout;
    }
}
class LayoutStore {
    constructor() {
        this.store = {};
    }
    getCurrentLayout(srf) {
        return srf.ignore
            ? FloatingLayout.instance
            : this.getEntry(srf).currentLayout;
    }
    cycleLayout(srf, step) {
        if (srf.ignore)
            return null;
        return this.getEntry(srf).cycleLayout(step);
    }
    setLayout(srf, layoutClassID) {
        if (srf.ignore)
            return null;
        return this.getEntry(srf).setLayout(layoutClassID);
    }
    getEntry(srf) {
        if (!this.store[srf.layoutId]) {
            let key_without_activity = KWinSurface.generateId(srf.output, "", srf.vDesktop);
            if (this.store[key_without_activity]) {
                this.store[srf.layoutId] = this.store[key_without_activity];
                delete this.store[key_without_activity];
            }
            else {
                this.store[srf.layoutId] = new LayoutStoreEntry(srf.output.name, srf.vDesktop.name, srf.activity, srf.vDesktop.id);
            }
        }
        return this.store[srf.layoutId];
    }
}
class WindowClass {
    static isTileableState(state) {
        return (state === WindowState.Dragging ||
            state === WindowState.Tiled ||
            state === WindowState.Maximized ||
            state === WindowState.TiledAfloat);
    }
    static isTiledState(state) {
        return state === WindowState.Tiled || state === WindowState.Maximized;
    }
    static isFloatingState(state) {
        return state === WindowState.Floating || state === WindowState.TiledAfloat;
    }
    get actualGeometry() {
        return this.window.geometry;
    }
    get shouldFloat() {
        return this.window.shouldFloat;
    }
    get shouldIgnore() {
        return this.window.shouldIgnore;
    }
    get tileable() {
        return WindowClass.isTileableState(this.state);
    }
    get tiled() {
        return WindowClass.isTiledState(this.state);
    }
    get floating() {
        return WindowClass.isFloatingState(this.state);
    }
    get geometryDelta() {
        if (this.geometry === this.actualGeometry)
            return null;
        return RectDelta.fromRects(this.geometry, this.actualGeometry);
    }
    get minSize() {
        return this._minSize;
    }
    get maxSize() {
        return this._maxSize;
    }
    get state() {
        if (this.window.fullScreen)
            return WindowState.NativeFullscreen;
        if (this.window.maximized)
            return WindowState.NativeMaximized;
        return this.internalState;
    }
    set state(value) {
        const state = this.state;
        if (state === value || state === WindowState.Dragging)
            return;
        if ((state === WindowState.Unmanaged || WindowClass.isTileableState(state)) &&
            WindowClass.isFloatingState(value))
            this.shouldCommitFloat = true;
        else if (WindowClass.isFloatingState(state) &&
            WindowClass.isTileableState(value))
            this._floatGeometry = this.actualGeometry;
        this.internalState = value;
    }
    setDraggingState() {
        this.internalState = WindowState.Dragging;
    }
    setState(value) {
        this.internalState = value;
    }
    get surface() {
        return this.window.surface;
    }
    set surface(srf) {
        this.window.surface = srf;
    }
    get weight() {
        const srfID = this.window.surface.id;
        const weight = this.weightMap[srfID];
        if (weight === undefined) {
            this.weightMap[srfID] = 1.0;
            return 1.0;
        }
        return weight;
    }
    set weight(value) {
        const srfID = this.window.surface.id;
        this.weightMap[srfID] = value;
    }
    get windowClassName() {
        return this.window.windowClassName;
    }
    get floatGeometry() {
        if (this._floatGeometry === null) {
            this._floatGeometry = this.window.getInitFloatGeometry();
        }
        return this._floatGeometry;
    }
    set floatGeometry(value) {
        this._floatGeometry = value;
    }
    constructor(window) {
        this.id = window.id;
        this.window = window;
        this.geometry = window.geometry;
        this.timestamp = 0;
        this.internalState = WindowState.Unmanaged;
        this.shouldCommitFloat = this.shouldFloat;
        this._floatGeometry =
            this.shouldCommitFloat || CONFIG.floatInit === null
                ? this.geometry
                : null;
        this.weightMap = {};
        this.dock = null;
        this._minSize = window.minSize;
        this._maxSize = window.maxSize;
    }
    toString() {
        return `Window: id=${this.id}, state: ${windowStateStr(this.state)}. ${this.window}`;
    }
    commit(noBorders) {
        const state = this.state;
        LOG === null || LOG === void 0 ? void 0 : LOG.send(LogModules.arrangeScreen, "commit", `id: ${this.id}, state: ${windowStateStr(state)}, floatGeometry: ${this.floatGeometry}, commitGeometry: ${this.geometry}, noBorders: ${noBorders}`);
        switch (state) {
            case WindowState.Dragging:
                break;
            case WindowState.NativeMaximized:
                this.window.commit(undefined, undefined, undefined);
                break;
            case WindowState.NativeFullscreen:
                this.window.commit(undefined, undefined, 1);
                break;
            case WindowState.Floating:
                if (!this.shouldCommitFloat)
                    break;
                this.window.commit(this.floatGeometry, false, CONFIG.floatedWindowsLayer);
                this.shouldCommitFloat = false;
                break;
            case WindowState.Maximized:
                this.window.commit(this.geometry, true, 1);
                break;
            case WindowState.Tiled:
                this.window.commit(this.geometry, CONFIG.noTileBorder || Boolean(noBorders), CONFIG.tiledWindowsLayer);
                break;
            case WindowState.TiledAfloat:
                if (!this.shouldCommitFloat)
                    break;
                this.window.commit(this.floatGeometry, false, CONFIG.floatedWindowsLayer);
                this.shouldCommitFloat = false;
                break;
            case WindowState.Floating:
                this.window.commit(this.geometry, CONFIG.noTileBorder || Boolean(noBorders), CONFIG.floatedWindowsLayer);
                break;
            case WindowState.Docked:
                this.window.commit(this.geometry, CONFIG.noTileBorder, CONFIG.tiledWindowsLayer);
                break;
        }
    }
    forceSetGeometry(geometry) {
        this.window.commit(geometry);
    }
    visible(srf) {
        return this.window.visible(srf);
    }
    get minimized() {
        return this.window.minimized;
    }
}
class WindowStore {
    constructor(windows) {
        this.list = windows || [];
    }
    move(srcWin, destWin, after) {
        const srcIdx = this.list.indexOf(srcWin);
        const destIdx = this.list.indexOf(destWin);
        if (srcIdx === -1 || destIdx === -1)
            return;
        this.list.splice(srcIdx, 1);
        this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
    }
    moveNew(srcWin, destWin, after) {
        const srcIdx = this.list.indexOf(srcWin);
        const destIdx = this.list.indexOf(destWin);
        if (srcIdx === -1 || destIdx === -1)
            return;
        if (srcIdx > destIdx) {
            this.list.splice(srcIdx, 1);
            this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
        }
        else if (destIdx > srcIdx) {
            this.list.splice(srcIdx, 1);
            this.list.splice(after ? destIdx : destIdx - 1, 0, srcWin);
        }
    }
    getWindowById(id) {
        let idx = this.list.map((w) => w.id).indexOf(id);
        return idx < 0 ? null : this.list[idx];
    }
    setMaster(window) {
        const idx = this.list.indexOf(window);
        if (idx === -1)
            return;
        this.list.splice(idx, 1);
        this.list.splice(0, 0, window);
    }
    swap(alpha, beta) {
        const alphaIndex = this.list.indexOf(alpha);
        const betaIndex = this.list.indexOf(beta);
        if (alphaIndex < 0 || betaIndex < 0)
            return;
        this.list[alphaIndex] = beta;
        this.list[betaIndex] = alpha;
    }
    get length() {
        return this.list.length;
    }
    at(idx) {
        return this.list[idx];
    }
    indexOf(window) {
        return this.list.indexOf(window);
    }
    push(window) {
        this.list.push(window);
    }
    beside_first(window) {
        this.list.splice(1, 0, window);
    }
    remove(window) {
        const idx = this.list.indexOf(window);
        if (idx >= 0)
            this.list.splice(idx, 1);
    }
    unshift(window) {
        this.list.unshift(window);
    }
    getVisibleWindows(srf) {
        return this.list.filter((win) => win.visible(srf));
    }
    getVisibleTiles(srf) {
        return this.list.filter((win) => win.tiled && win.visible(srf));
    }
    getVisibleTileables(srf) {
        return this.list.filter((win) => win.tileable && win.visible(srf));
    }
}
function getWindowLayer(index) {
    if (index === 0)
        return 0;
    else if (index === 1)
        return 1;
    else if (index === 2)
        return 2;
    else
        return 1;
}
class BinaryTreeLayout {
    get description() {
        return "BTree";
    }
    constructor(capacity) {
        this.classID = BinaryTreeLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.parts = new HalfSplitLayoutPart(new FillLayoutPart(), new FillLayoutPart());
        this.parts.angle = 0;
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        this.create_parts(tileables.length);
        let rectangles = this.parts.apply(area, tileables, gap);
        rectangles.forEach((geometry, i) => {
            tileables[i].geometry = geometry;
        });
    }
    create_parts(tiles_len) {
        let head = this.get_head();
        head.angle = 0;
        if (tiles_len > 2) {
            let level = Math.ceil(Math.log(tiles_len) * 1.442695);
            let level_capacity = Math.pow(2, (level - 1));
            let half_level_capacity = Math.pow(2, (level - 2));
            if (tiles_len > level_capacity + half_level_capacity) {
                head.primarySize = tiles_len - level_capacity;
            }
            else {
                head.primarySize = half_level_capacity;
            }
            this.build_binary_tree(head, level, 2, tiles_len);
        }
        this.parts = head;
    }
    build_binary_tree(head, max_level, current_level, tiles_len) {
        if (current_level <= max_level) {
            if (head.primarySize > 1) {
                let primary = this.get_head();
                primary.primarySize = Math.floor(head.primarySize / 2);
                primary.angle = current_level % 2 ? 0 : 90;
                head.primary = primary;
                this.build_binary_tree(primary, max_level, current_level + 1, head.primarySize);
            }
            if (tiles_len - head.primarySize > 1) {
                let secondary = this.get_head();
                secondary.primarySize = Math.floor((tiles_len - head.primarySize) / 2);
                secondary.angle = current_level % 2 ? 0 : 90;
                head.secondary = secondary;
                this.build_binary_tree(secondary, max_level, current_level + 1, tiles_len - head.primarySize);
            }
        }
    }
    get_head() {
        return new HalfSplitLayoutPart(new FillLayoutPart(), new FillLayoutPart());
    }
    clone() {
        const other = new StackedLayout();
        return other;
    }
    toString() {
        return "BTreeLayout()";
    }
}
BinaryTreeLayout.id = "BinaryTreeLayout";
var CascadeDirection;
(function (CascadeDirection) {
    CascadeDirection[CascadeDirection["NorthWest"] = 0] = "NorthWest";
    CascadeDirection[CascadeDirection["North"] = 1] = "North";
    CascadeDirection[CascadeDirection["NorthEast"] = 2] = "NorthEast";
    CascadeDirection[CascadeDirection["East"] = 3] = "East";
    CascadeDirection[CascadeDirection["SouthEast"] = 4] = "SouthEast";
    CascadeDirection[CascadeDirection["South"] = 5] = "South";
    CascadeDirection[CascadeDirection["SouthWest"] = 6] = "SouthWest";
    CascadeDirection[CascadeDirection["West"] = 7] = "West";
})(CascadeDirection || (CascadeDirection = {}));
class CascadeLayout {
    static decomposeDirection(dir) {
        switch (dir) {
            case CascadeDirection.NorthWest:
                return [-1, -1];
            case CascadeDirection.North:
                return [-1, 0];
            case CascadeDirection.NorthEast:
                return [-1, 1];
            case CascadeDirection.East:
                return [0, 1];
            case CascadeDirection.SouthEast:
                return [1, 1];
            case CascadeDirection.South:
                return [1, 0];
            case CascadeDirection.SouthWest:
                return [1, -1];
            case CascadeDirection.West:
                return [0, -1];
        }
    }
    get description() {
        return "Cascade [" + CascadeDirection[this.dir] + "]";
    }
    constructor(dir = CascadeDirection.SouthEast, capacity) {
        this.dir = dir;
        this.classID = CascadeLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
    }
    apply(ctx, tileables, area, gap) {
        const [vertStep, horzStep] = CascadeLayout.decomposeDirection(this.dir);
        const stepSize = 25;
        const windowWidth = horzStep !== 0
            ? area.width - stepSize * (tileables.length - 1)
            : area.width;
        const windowHeight = vertStep !== 0
            ? area.height - stepSize * (tileables.length - 1)
            : area.height;
        const baseX = horzStep >= 0 ? area.x : area.maxX - windowWidth;
        const baseY = vertStep >= 0 ? area.y : area.maxY - windowHeight;
        let x = baseX, y = baseY;
        tileables.forEach((tile) => {
            tile.state = WindowState.Tiled;
            tile.geometry = new Rect(x, y, windowWidth, windowHeight);
            x += horzStep * stepSize;
            y += vertStep * stepSize;
        });
    }
    clone() {
        return new CascadeLayout(this.dir);
    }
    handleShortcut(ctx, input, data) {
        switch (input) {
            case Shortcut.Increase:
                this.dir = (this.dir + 1 + 8) % 8;
                ctx.showNotification(this.description);
                break;
            case Shortcut.Decrease:
                this.dir = (this.dir - 1 + 8) % 8;
                ctx.showNotification(this.description);
                break;
            default:
                return false;
        }
        return true;
    }
}
CascadeLayout.id = "CascadeLayout";
class ColumnLayout {
    get description() {
        return "Column";
    }
    toString() {
        let s = `ColumnLayout${this.windowIds.size}:`;
        this.windowIds.forEach((id) => (s = s + id + ","));
        return s;
    }
    constructor() {
        this.classID = ColumnLayout.id;
        this.position = "single";
        this.weight = 1.0;
        this.parts = new RotateLayoutPart(new StackLayoutPart());
        this.windowIds = new Set();
        this.renderedWindowsIds = [];
        this.renderedWindowsRects = [];
        this.numberFloatedOrMinimized = 0;
        this.timestamp = 0;
    }
    get size() {
        return this.windowIds.size - this.numberFloatedOrMinimized;
    }
    set isHorizontal(value) {
        if (value)
            this.parts.angle = 270;
        else
            this.parts.angle = 0;
    }
    isEmpty() {
        return this.windowIds.size === this.numberFloatedOrMinimized;
    }
    apply(ctx, tileables, area, gap) {
        this.renderedWindowsIds = [];
        let columnTileables = tileables.filter((w) => {
            if (this.windowIds.has(w.id)) {
                this.renderedWindowsIds.push(w.id);
                return true;
            }
        });
        this.renderedWindowsRects = [];
        this.parts.apply(area, columnTileables, gap).forEach((geometry, i) => {
            columnTileables[i].geometry = geometry;
            this.renderedWindowsRects.push(geometry);
        });
    }
    getUpperWindowId(id) {
        let winId = this.renderedWindowsIds.indexOf(id);
        if (winId < 1)
            return null;
        return this.renderedWindowsIds[winId - 1];
    }
    getLowerWindowId(id) {
        let winId = this.renderedWindowsIds.indexOf(id);
        if (winId < 0 || winId === this.renderedWindowsIds.length - 1)
            return null;
        return this.renderedWindowsIds[winId + 1];
    }
    getWindowIdOnRight(x) {
        for (let i = 0; i < this.renderedWindowsIds.length; i++) {
            if (x < this.renderedWindowsRects[i].center[0] + 10)
                return this.renderedWindowsIds[i];
        }
        return null;
    }
    getWindowIdOnTop(y) {
        for (let i = 0; i < this.renderedWindowsIds.length; i++) {
            if (y < this.renderedWindowsRects[i].center[1] + 10)
                return this.renderedWindowsIds[i];
        }
        return null;
    }
    adjust(area, tiles, basis, delta, gap) {
        let columnTiles = tiles.filter((t) => this.windowIds.has(t.id));
        this.parts.adjust(area, columnTiles, basis, delta, gap);
    }
    actualizeWindowIds(ctx, ids) {
        let window;
        let floatedOrMinimized = 0;
        this.windowIds = new Set([...this.windowIds].filter((id) => {
            window = ctx.getWindowById(id);
            if (ids.has(id))
                return true;
            else if (window !== null && (window.minimized || window.floating)) {
                floatedOrMinimized += 1;
                return true;
            }
            return false;
        }));
        this.numberFloatedOrMinimized = floatedOrMinimized;
    }
}
ColumnLayout.id = "Column";
class ColumnsLayout {
    get description() {
        return "Columns";
    }
    get columns() {
        return this._columns;
    }
    constructor(capacity) {
        this.classID = ColumnsLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.parts = [new ColumnLayout()];
        this._columns = [];
        this.direction = new windRose(CONFIG.columnsLayoutInitialAngle);
        this.columnsConfiguration = null;
    }
    adjust(area, tiles, basis, delta, gap) {
        let columnId = this.getColumnId(basis);
        if (columnId === null)
            return;
        let isReverse = this.direction.east || this.direction.south;
        let columnsLength = this.columns.length;
        if (((this.direction.east || this.direction.west) &&
            (delta.east !== 0 || delta.west !== 0)) ||
            ((this.direction.north || this.direction.south) &&
                (delta.north !== 0 || delta.south !== 0))) {
            let oldWeights;
            if (isReverse) {
                oldWeights = this.columns
                    .slice(0)
                    .reverse()
                    .map((column) => column.weight);
            }
            else {
                oldWeights = this.columns.map((column) => column.weight);
            }
            const weights = LayoutUtils.adjustAreaWeights(area, oldWeights, gap, isReverse ? columnsLength - 1 - columnId : columnId, delta, this.direction.east || this.direction.west);
            weights.forEach((weight, i) => {
                this.columns[isReverse ? columnsLength - 1 - i : i].weight =
                    weight * columnsLength;
            });
        }
        if (((delta.north !== 0 || delta.south !== 0) &&
            (this.direction.east || this.direction.west)) ||
            ((delta.east !== 0 || delta.west !== 0) &&
                (this.direction.north || this.direction.south))) {
            this.columns[columnId].adjust(area, tiles, basis, delta, gap);
        }
    }
    apply(ctx, tileables, area, gap) {
        if (this.columnsConfiguration === null)
            this.columnsConfiguration = this.getDefaultConfig(ctx);
        this.arrangeTileables(ctx, tileables);
        if (this.columns.length === 0)
            return;
        let weights;
        if (this.direction.east || this.direction.south) {
            weights = this.columns
                .slice(0)
                .reverse()
                .map((tile) => tile.weight);
        }
        else {
            weights = this.columns.map((tile) => tile.weight);
        }
        const rects = LayoutUtils.splitAreaWeighted(area, weights, gap, this.direction.east || this.direction.west);
        if (this.direction.east || this.direction.south) {
            let i = 0;
            for (var idx = this.columns.length - 1; idx >= 0; idx--) {
                this.columns[idx].isHorizontal = this.direction.south;
                this.columns[idx].apply(ctx, tileables, rects[i], gap);
                i++;
            }
        }
        else {
            for (var idx = 0; idx < this.columns.length; idx++) {
                this.columns[idx].isHorizontal = this.direction.north;
                this.columns[idx].apply(ctx, tileables, rects[idx], gap);
            }
        }
    }
    drag(ctx, draggingRect, window, workingArea) {
        const cursorOrActivationPoint = ctx.cursorPos || draggingRect.activationPoint;
        const cursorOrMiddlePoint = ctx.cursorPos || draggingRect.center;
        if (this.columns.length === 0 ||
            (this.columns.length === 1 && this.columns[0].windowIds.size === 1))
            return false;
        let columnId = this.getColumnId(window);
        let windowId = window.id;
        if (((this.direction.north &&
            workingArea.isTopZone(cursorOrActivationPoint)) ||
            (this.direction.south &&
                workingArea.isBottomZone(cursorOrMiddlePoint)) ||
            (this.direction.west &&
                workingArea.isLeftZone(cursorOrActivationPoint)) ||
            (this.direction.east &&
                workingArea.isRightZone(cursorOrActivationPoint))) &&
            !(this.columns[0].windowIds.size === 1 &&
                this.columns[0].windowIds.has(windowId))) {
            if (columnId !== null)
                this.columns[columnId].windowIds.delete(windowId);
            const column = this.insertColumn(true);
            column.windowIds.add(windowId);
            return true;
        }
        if (((this.direction.north &&
            workingArea.isBottomZone(cursorOrMiddlePoint)) ||
            (this.direction.south &&
                workingArea.isTopZone(cursorOrActivationPoint)) ||
            (this.direction.west &&
                workingArea.isRightZone(cursorOrActivationPoint)) ||
            (this.direction.east &&
                workingArea.isLeftZone(cursorOrActivationPoint))) &&
            !(this.columns[this.columns.length - 1].windowIds.size === 1 &&
                this.columns[this.columns.length - 1].windowIds.has(windowId))) {
            if (columnId !== null)
                this.columns[columnId].windowIds.delete(windowId);
            const column = this.insertColumn(false);
            column.windowIds.add(windowId);
            return true;
        }
        for (let colIdx = 0; colIdx < this.columns.length; colIdx++) {
            const column = this.columns[colIdx];
            for (let i = 0; i < column.renderedWindowsRects.length; i++) {
                const renderedRect = column.renderedWindowsRects[i];
                if ((this.direction.west &&
                    renderedRect.includesPoint(cursorOrActivationPoint, 0)) ||
                    (this.direction.north &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 2)) ||
                    (this.direction.east &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 0)) ||
                    (this.direction.south &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 2))) {
                    if (column.renderedWindowsIds[i] === windowId)
                        return false;
                    if (i > 0 && column.renderedWindowsIds[i - 1] === windowId)
                        return false;
                    const renderedId = column.renderedWindowsIds[i];
                    if (columnId !== null && columnId !== colIdx)
                        this.columns[columnId].windowIds.delete(windowId);
                    column.windowIds.add(windowId);
                    ctx.moveWindowByWinId(window, renderedId);
                    return true;
                }
                if ((this.direction.west &&
                    renderedRect.includesPoint(cursorOrActivationPoint, 1)) ||
                    (this.direction.north &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 3)) ||
                    (this.direction.east &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 1)) ||
                    (this.direction.south &&
                        renderedRect.includesPoint(cursorOrActivationPoint, 3))) {
                    if (column.renderedWindowsIds[i] === windowId)
                        return false;
                    if (i < column.renderedWindowsIds.length - 1 &&
                        column.renderedWindowsIds[i + 1] === windowId)
                        return false;
                    const renderedId = column.renderedWindowsIds[i];
                    if (columnId !== null && columnId !== colIdx)
                        this.columns[columnId].windowIds.delete(windowId);
                    column.windowIds.add(windowId);
                    ctx.moveWindowByWinId(window, renderedId, true);
                    return true;
                }
            }
        }
        return false;
    }
    arrangeTileables(ctx, tileables) {
        let latestTimestamp = 0;
        let partId = null;
        let newWindows = [];
        let tileableIds = new Set();
        let currentColumnId = 0;
        tileables.forEach((tileable) => {
            tileable.state = WindowState.Tiled;
            partId = this.getPartsId(tileable);
            if (partId !== null) {
                if (this.parts[partId].timestamp < tileable.timestamp) {
                    this.parts[partId].timestamp = tileable.timestamp;
                }
                if (this.parts[partId].timestamp > latestTimestamp) {
                    latestTimestamp = tileable.timestamp;
                    currentColumnId = partId;
                }
            }
            else {
                newWindows.push(tileable.id);
            }
            tileableIds.add(tileable.id);
        });
        if (this.columnsConfiguration !== null &&
            tileableIds.size > 0 &&
            newWindows.length > 0 &&
            this.columnsConfiguration.length > this.columns.length) {
            let new_columns_length = this.columnsConfiguration.length - this.columns.length >
                newWindows.length
                ? newWindows.length
                : this.columnsConfiguration.length - this.columns.length;
            for (let i = 0; i < new_columns_length; i++) {
                let winId = newWindows.shift();
                if (winId === undefined)
                    continue;
                let column = this.insertColumn(false);
                column.windowIds.add(winId);
            }
            this.applyColumnsPosition();
            if (this.columnsConfiguration[0] !== 0) {
                let sumWeights = this.columnsConfiguration.reduce((a, b) => a + b, 0);
                for (let i = 0; i < this.columns.length; i++) {
                    this.columns[i].weight =
                        (this.columnsConfiguration[i] / sumWeights) * this.columns.length;
                }
            }
        }
        if (CONFIG.columnsBalanced) {
            for (var [_, id] of newWindows.entries()) {
                let minSizeColumn = this.parts.reduce((prev, curr) => {
                    return prev.size < curr.size ? prev : curr;
                });
                minSizeColumn.windowIds.add(id);
            }
        }
        else {
            this.parts[currentColumnId].windowIds = new Set([
                ...this.parts[currentColumnId].windowIds,
                ...newWindows,
            ]);
        }
        this.parts.forEach((column) => {
            column.actualizeWindowIds(ctx, tileableIds);
        });
        this.parts = this.parts.filter((column) => column.windowIds.size !== 0);
        if (this.parts.length === 0)
            this.insertColumn(true);
        this.applyColumnsPosition();
    }
    getColumnId(t) {
        for (var i = 0; i < this.columns.length; i++) {
            if (this.columns[i].windowIds.has(t.id))
                return i;
        }
        return null;
    }
    getPartsId(t) {
        for (var i = 0; i < this.parts.length; i++) {
            if (this.parts[i].windowIds.has(t.id))
                return i;
        }
        return null;
    }
    getCurrentColumnId(currentWindowId) {
        if (currentWindowId !== null) {
            for (const [i, column] of this.columns.entries()) {
                if (column.windowIds.has(currentWindowId))
                    return i;
            }
        }
        return null;
    }
    applyColumnsPosition() {
        this._columns = this.parts.filter((column) => !column.isEmpty());
        const columnsLength = this.columns.length;
        if (columnsLength === 1) {
            this.columns[0].position = "single";
        }
        else if (columnsLength > 1) {
            this.columns[0].position = "left";
            this.columns[columnsLength - 1].position = "right";
            for (let i = 1; i < columnsLength - 1; i++) {
                this.columns[i].position = "middle";
            }
        }
    }
    toColumnWithBiggerIndex(ctx) {
        const currentWindow = ctx.currentWindow;
        const currentWindowId = currentWindow !== null ? currentWindow.id : null;
        const activeColumnId = this.getCurrentColumnId(currentWindowId);
        if (currentWindow === null ||
            currentWindowId === null ||
            activeColumnId === null ||
            (this.columns[activeColumnId].size < 2 &&
                (this.columns[activeColumnId].position === "right" ||
                    this.columns[activeColumnId].position === "single")))
            return false;
        let targetColumn;
        const column = this.columns[activeColumnId];
        const center = column.renderedWindowsRects[column.renderedWindowsIds.indexOf(currentWindowId)].center;
        column.windowIds.delete(currentWindowId);
        if (column.position === "single" || column.position === "right") {
            targetColumn = this.insertColumn(false);
            targetColumn.windowIds.add(currentWindowId);
        }
        else {
            targetColumn = this.columns[activeColumnId + 1];
            targetColumn.windowIds.add(currentWindowId);
        }
        let idOnTarget;
        if (this.direction.north || this.direction.south)
            idOnTarget = targetColumn.getWindowIdOnRight(center[0]);
        else
            idOnTarget = targetColumn.getWindowIdOnTop(center[1]);
        if (idOnTarget !== null)
            ctx.moveWindowByWinId(currentWindow, idOnTarget);
        else {
            const targetId = targetColumn.renderedWindowsIds[targetColumn.renderedWindowsIds.length - 1];
            ctx.moveWindowByWinId(currentWindow, targetId);
        }
        this.applyColumnsPosition();
        return true;
    }
    toColumnWithSmallerIndex(ctx) {
        const currentWindow = ctx.currentWindow;
        const currentWindowId = currentWindow !== null ? currentWindow.id : null;
        const activeColumnId = this.getCurrentColumnId(currentWindowId);
        if (currentWindow === null ||
            currentWindowId === null ||
            activeColumnId === null ||
            (this.columns[activeColumnId].windowIds.size < 2 &&
                (this.columns[activeColumnId].position === "left" ||
                    this.columns[activeColumnId].position === "single")))
            return false;
        let targetColumn;
        const column = this.columns[activeColumnId];
        const center = column.renderedWindowsRects[column.renderedWindowsIds.indexOf(currentWindowId)].center;
        column.windowIds.delete(currentWindowId);
        if (column.position === "single" || column.position === "left") {
            targetColumn = this.insertColumn(true);
            targetColumn.windowIds.add(currentWindowId);
        }
        else {
            targetColumn = this.columns[activeColumnId - 1];
            targetColumn.windowIds.add(currentWindowId);
        }
        let idOnTarget;
        if (this.direction.north || this.direction.south)
            idOnTarget = targetColumn.getWindowIdOnRight(center[0]);
        else
            idOnTarget = targetColumn.getWindowIdOnTop(center[1]);
        if (idOnTarget !== null)
            ctx.moveWindowByWinId(currentWindow, idOnTarget);
        else {
            const targetId = targetColumn.renderedWindowsIds[targetColumn.renderedWindowsIds.length - 1];
            ctx.moveWindowByWinId(currentWindow, targetId);
        }
        this.applyColumnsPosition();
        return true;
    }
    toUpOrLeft(ctx) {
        let currentWindow = ctx.currentWindow;
        let currentWindowId = currentWindow !== null ? currentWindow.id : null;
        let activeColumnId = this.getCurrentColumnId(currentWindowId);
        if (currentWindow === null ||
            currentWindowId === null ||
            activeColumnId === null ||
            this.columns[activeColumnId].windowIds.size < 2)
            return false;
        let upperWinId = this.columns[activeColumnId].getUpperWindowId(currentWindowId);
        if (upperWinId === null)
            return false;
        ctx.moveWindowByWinId(currentWindow, upperWinId);
        return true;
    }
    toBottomOrRight(ctx) {
        let currentWindow = ctx.currentWindow;
        let currentWindowId = currentWindow !== null ? currentWindow.id : null;
        let activeColumnId = this.getCurrentColumnId(currentWindowId);
        if (currentWindow === null ||
            currentWindowId === null ||
            activeColumnId === null ||
            this.columns[activeColumnId].windowIds.size < 2)
            return false;
        let lowerWinId = this.columns[activeColumnId].getLowerWindowId(currentWindowId);
        if (lowerWinId === null)
            return false;
        ctx.moveWindowByWinId(currentWindow, lowerWinId, true);
        return true;
    }
    showDirection(ctx) {
        let notification;
        if (this.direction.east)
            notification = "vertical ⟰";
        else if (this.direction.north)
            notification = "horizontal ⭆";
        else if (this.direction.west)
            notification = "vertical ⟱";
        else if (this.direction.south)
            notification = "horizontal ⭅";
        else
            notification = "";
        ctx.showNotification(notification);
    }
    handleShortcut(ctx, input) {
        let isApply = false;
        switch (input) {
            case Shortcut.SwapLeft:
                if (this.direction.north || this.direction.south) {
                    isApply = this.toUpOrLeft(ctx);
                }
                else if (this.direction.east) {
                    isApply = this.toColumnWithBiggerIndex(ctx);
                }
                else
                    isApply = this.toColumnWithSmallerIndex(ctx);
                break;
            case Shortcut.SwapRight:
                if (this.direction.north || this.direction.south) {
                    isApply = this.toBottomOrRight(ctx);
                }
                else if (this.direction.east) {
                    isApply = this.toColumnWithSmallerIndex(ctx);
                }
                else
                    isApply = this.toColumnWithBiggerIndex(ctx);
                break;
            case Shortcut.SwapUp:
                if (this.direction.north) {
                    isApply = this.toColumnWithSmallerIndex(ctx);
                }
                else if (this.direction.south) {
                    isApply = this.toColumnWithBiggerIndex(ctx);
                }
                else
                    isApply = this.toUpOrLeft(ctx);
                break;
            case Shortcut.SwapDown:
                if (this.direction.north) {
                    isApply = this.toColumnWithBiggerIndex(ctx);
                }
                else if (this.direction.south) {
                    isApply = this.toColumnWithSmallerIndex(ctx);
                }
                else
                    isApply = this.toBottomOrRight(ctx);
                break;
            case Shortcut.Rotate:
                this.direction.cwRotation();
                this.showDirection(ctx);
                isApply = true;
                break;
            case Shortcut.RotatePart:
                this.direction.ccwRotation();
                this.showDirection(ctx);
                isApply = true;
                break;
            default:
                return false;
        }
        return isApply;
    }
    insertColumn(onTop) {
        let column = new ColumnLayout();
        this.parts.splice(onTop ? 0 : this.parts.length, 0, column);
        return column;
    }
    getDefaultConfig(ctx) {
        let returnValue = [];
        let [outputName, activityId, vDesktopName] = ctx.surfaceParams;
        for (let conf of CONFIG.columnsLayerConf) {
            if (!conf || typeof conf !== "string")
                continue;
            let conf_arr = conf.split(":").map((part) => part.trim());
            if (conf_arr.length < 5) {
                warning(`Columns conf: ${conf} has less then 5 elements`);
                continue;
            }
            if ((outputName === conf_arr[0] || conf_arr[0] === "") &&
                (activityId === conf_arr[1] || conf_arr[1] === "") &&
                (vDesktopName === conf_arr[2] || conf_arr[2] === "")) {
                for (let i = 3; i < conf_arr.length; i++) {
                    let columnWeight = parseFloat(conf_arr[i]);
                    if (isNaN(columnWeight)) {
                        warning(`Columns conf:${conf_arr}: ${conf_arr[i]} is not a number.`);
                        returnValue = [];
                        break;
                    }
                    if (columnWeight === 0) {
                        warning(`Columns conf:${conf_arr}: weight cannot be zero`);
                        returnValue = [];
                        break;
                    }
                    returnValue.push(columnWeight);
                }
                if (returnValue.length > 1 &&
                    returnValue.every((el) => el === returnValue[0])) {
                    returnValue.fill(0);
                }
                return returnValue;
            }
        }
        return returnValue;
    }
}
ColumnsLayout.id = "Columns";
class FloatingLayout {
    constructor() {
        this.classID = FloatingLayout.id;
        this.description = "Floating";
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.TiledAfloat));
    }
    clone() {
        return this;
    }
    toString() {
        return "FloatingLayout()";
    }
}
FloatingLayout.id = "FloatingLayout ";
FloatingLayout.instance = new FloatingLayout();
class FillLayoutPart {
    adjust(area, tiles, basis, delta, gap) {
        return delta;
    }
    apply(area, tiles, gap) {
        return tiles.map((tile) => {
            return area;
        });
    }
    toString() {
        return `FillLayoutPart`;
    }
}
class HalfSplitLayoutPart {
    get horizontal() {
        return this.angle === 0 || this.angle === 180;
    }
    get reversed() {
        return this.angle === 180 || this.angle === 270;
    }
    constructor(primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
        this.angle = 0;
        this.primarySize = 1;
        this.ratio = 0.5;
    }
    adjust(area, tiles, basis, delta, gap) {
        const basisIndex = tiles.indexOf(basis);
        if (basisIndex < 0)
            return delta;
        if (tiles.length <= this.primarySize) {
            return this.primary.adjust(area, tiles, basis, delta, gap);
        }
        else if (this.primarySize === 0) {
            return this.secondary.adjust(area, tiles, basis, delta, gap);
        }
        else {
            const targetIndex = basisIndex < this.primarySize ? 0 : 1;
            if (targetIndex === 0) {
                delta = this.primary.adjust(area, tiles.slice(0, this.primarySize), basis, delta, gap);
            }
            else {
                delta = this.secondary.adjust(area, tiles.slice(this.primarySize), basis, delta, gap);
            }
            this.ratio = LayoutUtils.adjustAreaHalfWeights(area, this.reversed ? 1 - this.ratio : this.ratio, gap, this.reversed ? 1 - targetIndex : targetIndex, delta, this.horizontal);
            if (this.reversed)
                this.ratio = 1 - this.ratio;
            switch (this.angle * 10 + targetIndex + 1) {
                case 1:
                case 1802:
                    return new RectDelta(0, delta.west, delta.south, delta.north);
                case 2:
                case 1801:
                    return new RectDelta(delta.east, 0, delta.south, delta.north);
                case 901:
                case 2702:
                    return new RectDelta(delta.east, delta.west, 0, delta.north);
                case 902:
                case 2701:
                    return new RectDelta(delta.east, delta.west, delta.south, 0);
            }
            return delta;
        }
    }
    toString() {
        return `<HalfSplitLayout: angle:${this.angle},ratio:${this.ratio},pr_size:${this.primarySize}.<<<Primary:${this.primary}---Secondary:${this.secondary}>>>`;
    }
    apply(area, tiles, gap) {
        if (tiles.length <= this.primarySize) {
            return this.primary.apply(area, tiles, gap);
        }
        else if (this.primarySize === 0) {
            return this.secondary.apply(area, tiles, gap);
        }
        else {
            const reversed = this.reversed;
            const ratio = reversed ? 1 - this.ratio : this.ratio;
            const [area1, area2] = LayoutUtils.splitAreaHalfWeighted(area, ratio, gap, this.horizontal);
            const result1 = this.primary.apply(reversed ? area2 : area1, tiles.slice(0, this.primarySize), gap);
            const result2 = this.secondary.apply(reversed ? area1 : area2, tiles.slice(this.primarySize), gap);
            return result1.concat(result2);
        }
    }
}
class StackLayoutPart {
    adjust(area, tiles, basis, delta, gap) {
        const weights = LayoutUtils.adjustAreaWeights(area, tiles.map((tile) => tile.weight), gap, tiles.indexOf(basis), delta, false);
        weights.forEach((weight, i) => {
            tiles[i].weight = weight * tiles.length;
        });
        const idx = tiles.indexOf(basis);
        return new RectDelta(delta.east, delta.west, idx === tiles.length - 1 ? delta.south : 0, idx === 0 ? delta.north : 0);
    }
    apply(area, tiles, gap) {
        const weights = tiles.map((tile) => tile.weight);
        return LayoutUtils.splitAreaWeighted(area, weights, gap);
    }
}
class RotateLayoutPart {
    constructor(inner, angle = 0) {
        this.inner = inner;
        this.angle = angle;
    }
    adjust(area, tiles, basis, delta, gap) {
        switch (this.angle) {
            case 0:
                break;
            case 90:
                area = new Rect(area.y, area.x, area.height, area.width);
                delta = new RectDelta(delta.south, delta.north, delta.east, delta.west);
                break;
            case 180:
                delta = new RectDelta(delta.west, delta.east, delta.south, delta.north);
                break;
            case 270:
                area = new Rect(area.y, area.x, area.height, area.width);
                delta = new RectDelta(delta.north, delta.south, delta.east, delta.west);
                break;
        }
        delta = this.inner.adjust(area, tiles, basis, delta, gap);
        switch (this.angle) {
            case 0:
                delta = delta;
                break;
            case 90:
                delta = new RectDelta(delta.south, delta.north, delta.east, delta.west);
                break;
            case 180:
                delta = new RectDelta(delta.west, delta.east, delta.south, delta.north);
                break;
            case 270:
                delta = new RectDelta(delta.north, delta.south, delta.east, delta.west);
                break;
        }
        return delta;
    }
    apply(area, tiles, gap) {
        switch (this.angle) {
            case 0:
                break;
            case 90:
                area = new Rect(area.y, area.x, area.height, area.width);
                break;
            case 180:
                break;
            case 270:
                area = new Rect(area.y, area.x, area.height, area.width);
                break;
        }
        const innerResult = this.inner.apply(area, tiles, gap);
        switch (this.angle) {
            case 0:
                return innerResult;
            case 90:
                return innerResult.map((g) => new Rect(g.y, g.x, g.height, g.width));
            case 180:
                return innerResult.map((g) => {
                    const rx = g.x - area.x;
                    const newX = area.x + area.width - (rx + g.width);
                    return new Rect(newX, g.y, g.width, g.height);
                });
            case 270:
                return innerResult.map((g) => {
                    const rx = g.x - area.x;
                    const newY = area.x + area.width - (rx + g.width);
                    return new Rect(g.y, newY, g.height, g.width);
                });
        }
    }
    rotate(amount) {
        let angle = this.angle + amount;
        if (angle < 0)
            angle = 270;
        else if (angle >= 360)
            angle = 0;
        this.angle = angle;
    }
}
class LayoutUtils {
    static splitWeighted([begin, length], weights, gap) {
        gap = gap !== undefined ? gap : 0;
        const n = weights.length;
        const actualLength = length - (n - 1) * gap;
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
        let weightAcc = 0;
        const parts = weights.map((weight, i) => {
            const partBegin = (actualLength * weightAcc) / weightSum + i * gap;
            const partLength = (actualLength * weight) / weightSum;
            weightAcc += weight;
            return [begin + Math.floor(partBegin), Math.floor(partLength)];
        });
        let finalLength = parts.reduce((sum, [, length]) => sum + length, 0);
        finalLength += (n - 1) * gap;
        let remainder = length - finalLength;
        if (remainder > 0 && remainder < n) {
            for (let i = 0; i < remainder; i++) {
                parts[n - i - 1][1] += 1;
            }
        }
        return parts;
    }
    static splitAreaWeighted(area, weights, gap, horizontal) {
        gap = gap !== undefined ? gap : 0;
        horizontal = horizontal !== undefined ? horizontal : false;
        const line = horizontal
            ? [area.x, area.width]
            : [area.y, area.height];
        const parts = LayoutUtils.splitWeighted(line, weights, gap);
        return parts.map(([begin, length]) => horizontal
            ? new Rect(begin, area.y, length, area.height)
            : new Rect(area.x, begin, area.width, length));
    }
    static splitAreaHalfWeighted(area, weight, gap, horizontal) {
        return LayoutUtils.splitAreaWeighted(area, [weight, 1 - weight], gap, horizontal);
    }
    static adjustWeights([begin, length], weights, gap, target, deltaFw, deltaBw) {
        const minLength = 1;
        const parts = this.splitWeighted([begin, length], weights, gap);
        const [targetBase, targetLength] = parts[target];
        if (target > 0 && deltaBw !== 0) {
            const neighbor = target - 1;
            const [neighborBase, neighborLength] = parts[neighbor];
            const delta = clip(deltaBw, minLength - targetLength, neighborLength - minLength);
            parts[target] = [targetBase - delta, targetLength + delta];
            parts[neighbor] = [neighborBase, neighborLength - delta];
        }
        if (target < parts.length - 1 && deltaFw !== 0) {
            const neighbor = target + 1;
            const [neighborBase, neighborLength] = parts[neighbor];
            const delta = clip(deltaFw, minLength - targetLength, neighborLength - minLength);
            parts[target] = [targetBase, targetLength + delta];
            parts[neighbor] = [neighborBase + delta, neighborLength - delta];
        }
        return LayoutUtils.calculateWeights(parts);
    }
    static adjustAreaWeights(area, weights, gap, target, delta, horizontal) {
        const line = horizontal
            ? [area.x, area.width]
            : [area.y, area.height];
        const [deltaFw, deltaBw] = horizontal
            ? [delta.east, delta.west]
            : [delta.south, delta.north];
        return LayoutUtils.adjustWeights(line, weights, gap, target, deltaFw, deltaBw);
    }
    static adjustAreaHalfWeights(area, weight, gap, target, delta, horizontal) {
        const weights = [weight, 1 - weight];
        const newWeights = LayoutUtils.adjustAreaWeights(area, weights, gap, target, delta, horizontal);
        return newWeights[0];
    }
    static calculateWeights(parts) {
        const totalLength = parts.reduce((acc, [base, length]) => acc + length, 0);
        return parts.map(([base, length]) => length / totalLength);
    }
    static calculateAreaWeights(area, geometries, gap, horizontal) {
        gap = gap !== undefined ? gap : 0;
        horizontal = horizontal !== undefined ? horizontal : false;
        const line = horizontal ? area.width : area.height;
        const parts = horizontal
            ? geometries.map((geometry) => [geometry.x, geometry.width])
            : geometries.map((geometry) => [geometry.y, geometry.height]);
        return LayoutUtils.calculateWeights(parts);
    }
}
class MonocleLayout {
    constructor() {
        this.description = "Monocle";
        this.classID = MonocleLayout.id;
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tile) => {
            tile.state = CONFIG.monocleMaximize
                ? WindowState.Maximized
                : WindowState.Tiled;
            tile.geometry = area;
        });
        if (ctx.backend === KWinDriver.backendName &&
            KWINCONFIG.monocleMinimizeRest) {
            const tiles = [...tileables];
            ctx.setTimeout(() => {
                const current = ctx.currentWindow;
                if (current && current.tiled) {
                    tiles.forEach((window) => {
                        if (window !== current)
                            window.window.window.minimized = true;
                    });
                }
            }, 50);
        }
    }
    clone() {
        return this;
    }
    handleShortcut(ctx, input, data) {
        switch (input) {
            case Shortcut.DWMLeft:
            case Shortcut.FocusNext:
            case Shortcut.FocusUp:
            case Shortcut.FocusLeft:
                ctx.cycleFocus(-1);
                return true;
            case Shortcut.DWMRight:
            case Shortcut.FocusPrev:
            case Shortcut.FocusDown:
            case Shortcut.FocusRight:
                ctx.cycleFocus(1);
                return true;
            default:
                return false;
        }
    }
    toString() {
        return "MonocleLayout()";
    }
}
MonocleLayout.id = "MonocleLayout";
class QuarterLayout {
    get capacity() {
        return 4;
    }
    constructor() {
        this.classID = QuarterLayout.id;
        this.description = "Quarter";
        this.lhsplit = 0.5;
        this.rhsplit = 0.5;
        this.vsplit = 0.5;
        this.prevTileCount = 0;
    }
    resetSplits() {
        this.lhsplit = 0.5;
        this.rhsplit = 0.5;
        this.vsplit = 0.5;
    }
    adjust(area, tiles, basis, delta, gap) {
        if (tiles.length <= 1 || tiles.length > 4)
            return;
        const idx = tiles.indexOf(basis);
        if (idx < 0)
            return;
        if ((idx === 0 || idx === 3) && delta.east !== 0)
            this.vsplit = (area.width * this.vsplit + delta.east) / area.width;
        else if ((idx === 1 || idx === 2) && delta.west !== 0)
            this.vsplit = (area.width * this.vsplit - delta.west) / area.width;
        if (tiles.length === 4) {
            if (idx === 0 && delta.south !== 0)
                this.lhsplit = (area.height * this.lhsplit + delta.south) / area.height;
            if (idx === 3 && delta.north !== 0)
                this.lhsplit = (area.height * this.lhsplit - delta.north) / area.height;
        }
        if (tiles.length >= 3) {
            if (idx === 1 && delta.south !== 0)
                this.rhsplit = (area.height * this.rhsplit + delta.south) / area.height;
            if (idx === 2 && delta.north !== 0)
                this.rhsplit = (area.height * this.rhsplit - delta.north) / area.height;
        }
        this.vsplit = clip(this.vsplit, 1 - QuarterLayout.MAX_PROPORTION, QuarterLayout.MAX_PROPORTION);
        this.lhsplit = clip(this.lhsplit, 1 - QuarterLayout.MAX_PROPORTION, QuarterLayout.MAX_PROPORTION);
        this.rhsplit = clip(this.rhsplit, 1 - QuarterLayout.MAX_PROPORTION, QuarterLayout.MAX_PROPORTION);
    }
    clone() {
        const other = new QuarterLayout();
        other.lhsplit = this.lhsplit;
        other.rhsplit = this.rhsplit;
        other.vsplit = this.vsplit;
        other.prevTileCount = this.prevTileCount;
        return other;
    }
    apply(ctx, tileables, area, gap) {
        if (CONFIG.quarterLayoutReset) {
            if (tileables.length < this.prevTileCount) {
                this.resetSplits();
            }
            this.prevTileCount = tileables.length;
        }
        for (let i = 0; i < 4 && i < tileables.length; i++)
            tileables[i].state = WindowState.Tiled;
        if (tileables.length > 4)
            tileables
                .slice(4)
                .forEach((tile) => (tile.state = WindowState.TiledAfloat));
        if (tileables.length === 1) {
            tileables[0].geometry = area;
            return;
        }
        const gap1 = gap / 2;
        const gap2 = gap - gap1;
        const leftWidth = area.width * this.vsplit;
        const rightWidth = area.width - leftWidth;
        const rightX = area.x + leftWidth;
        if (tileables.length === 2) {
            tileables[0].geometry = new Rect(area.x, area.y, leftWidth, area.height).gap(0, gap1, 0, 0);
            tileables[1].geometry = new Rect(rightX, area.y, rightWidth, area.height).gap(gap2, 0, 0, 0);
            return;
        }
        const rightTopHeight = area.height * this.rhsplit;
        const rightBottomHeight = area.height - rightTopHeight;
        const rightBottomY = area.y + rightTopHeight;
        if (tileables.length === 3) {
            tileables[0].geometry = new Rect(area.x, area.y, leftWidth, area.height).gap(0, gap1, 0, 0);
            tileables[1].geometry = new Rect(rightX, area.y, rightWidth, rightTopHeight).gap(gap2, 0, 0, gap1);
            tileables[2].geometry = new Rect(rightX, rightBottomY, rightWidth, rightBottomHeight).gap(gap2, 0, gap2, 0);
            return;
        }
        const leftTopHeight = area.height * this.lhsplit;
        const leftBottomHeight = area.height - leftTopHeight;
        const leftBottomY = area.y + leftTopHeight;
        if (tileables.length >= 4) {
            tileables[0].geometry = new Rect(area.x, area.y, leftWidth, leftTopHeight).gap(0, gap1, 0, gap1);
            tileables[1].geometry = new Rect(rightX, area.y, rightWidth, rightTopHeight).gap(gap2, 0, 0, gap1);
            tileables[2].geometry = new Rect(rightX, rightBottomY, rightWidth, rightBottomHeight).gap(gap2, 0, gap2, 0);
            tileables[3].geometry = new Rect(area.x, leftBottomY, leftWidth, leftBottomHeight).gap(0, gap2, gap2, 0);
        }
    }
    toString() {
        return "QuarterLayout()";
    }
}
QuarterLayout.MAX_PROPORTION = 0.8;
QuarterLayout.id = "QuarterLayout";
class SpiralLayout {
    constructor(capacity) {
        this.description = "Spiral";
        this.classID = SpiralLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.depth = 1;
        this.parts = new HalfSplitLayoutPart(new FillLayoutPart(), new FillLayoutPart());
        this.parts.angle = 0;
    }
    adjust(area, tiles, basis, delta, gap) {
        this.parts.adjust(area, tiles, basis, delta, gap);
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        this.bore(tileables.length);
        this.parts.apply(area, tileables, gap).forEach((geometry, i) => {
            tileables[i].geometry = geometry;
        });
    }
    toString() {
        return "Spiral()";
    }
    bore(depth) {
        if (this.depth >= depth)
            return;
        let hpart = this.parts;
        let i;
        for (i = 0; i < this.depth - 1; i++) {
            hpart = hpart.secondary;
        }
        const lastFillPart = hpart.secondary;
        let npart;
        while (i < depth - 1) {
            npart = new HalfSplitLayoutPart(new FillLayoutPart(), lastFillPart);
            npart.angle = (((i + 1) % 4) * 90);
            hpart.secondary = npart;
            hpart = npart;
            i++;
        }
        this.depth = depth;
    }
}
SpiralLayout.id = "SpiralLayout";
class SpreadLayout {
    constructor(capacity) {
        this.classID = SpreadLayout.id;
        this.description = "Spread";
        this.capacity = capacity !== undefined ? capacity : null;
        this.space = 0.07;
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        const tiles = tileables;
        let numTiles = tiles.length;
        const spaceWidth = Math.floor(area.width * this.space);
        let cardWidth = area.width - spaceWidth * (numTiles - 1);
        const miniumCardWidth = area.width * 0.4;
        while (cardWidth < miniumCardWidth) {
            cardWidth += spaceWidth;
            numTiles -= 1;
        }
        for (let i = 0; i < tiles.length; i++)
            tiles[i].geometry = new Rect(area.x + (i < numTiles ? spaceWidth * (numTiles - i - 1) : 0), area.y, cardWidth, area.height);
    }
    clone() {
        const other = new SpreadLayout();
        other.space = this.space;
        return other;
    }
    handleShortcut(ctx, input) {
        switch (input) {
            case Shortcut.Decrease:
                this.space = Math.max(0.04, this.space - 0.01);
                break;
            case Shortcut.Increase:
                this.space = Math.min(0.1, this.space + 0.01);
                break;
            default:
                return false;
        }
        return true;
    }
    toString() {
        return "SpreadLayout(" + this.space + ")";
    }
}
SpreadLayout.id = "SpreadLayout";
class StackedLayout {
    get description() {
        return "Stacked";
    }
    constructor(capacity) {
        this.classID = StackedLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.parts = new RotateLayoutPart(new HalfSplitLayoutPart(new StackLayoutPart(), new StackLayoutPart()));
    }
    adjust(area, tiles, basis, delta, gap) {
        this.parts.adjust(area, tiles, basis, delta, gap);
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        if (tileables.length > 1) {
            this.parts.inner.angle = 90;
        }
        this.parts.apply(area, tileables, gap).forEach((geometry, i) => {
            tileables[i].geometry = geometry;
        });
    }
    clone() {
        const other = new StackedLayout();
        return other;
    }
    handleShortcut(ctx, input) {
        switch (input) {
            case Shortcut.Rotate:
                this.parts.rotate(90);
                break;
            default:
                return false;
        }
        return true;
    }
    toString() {
        return "StackedLayout()";
    }
}
StackedLayout.id = "StackedLayout";
class StairLayout {
    constructor(capacity) {
        this.classID = StairLayout.id;
        this.description = "Stair";
        this.capacity = capacity !== undefined ? capacity : null;
        this.space = 24;
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        const tiles = tileables;
        const len = tiles.length;
        const space = this.space;
        const alignRight = Number(!KWINCONFIG.stairReverse);
        for (let i = 0; i < len; i++) {
            const dx = space * (len - i - 1);
            const dy = space * i;
            tiles[i].geometry = new Rect(area.x + alignRight * dx, area.y + dy, area.width - dx, area.height - dy);
        }
    }
    clone() {
        const other = new StairLayout();
        other.space = this.space;
        return other;
    }
    handleShortcut(ctx, input) {
        switch (input) {
            case Shortcut.Decrease:
                this.space = Math.max(16, this.space - 8);
                break;
            case Shortcut.Increase:
                this.space = Math.min(160, this.space + 8);
                break;
            default:
                return false;
        }
        return true;
    }
    toString() {
        return "StairLayout(" + this.space + ")";
    }
}
StairLayout.id = "StairLayout";
class ThreeColumnLayout {
    get description() {
        return "Three-Column [" + this.masterSize + "]";
    }
    constructor(capacity) {
        this.classID = ThreeColumnLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.masterRatio = 0.6;
        this.masterSize = 1;
    }
    adjust(area, tiles, basis, delta, gap) {
        const basisIndex = tiles.indexOf(basis);
        if (basisIndex < 0)
            return;
        if (tiles.length === 0)
            return;
        else if (tiles.length <= this.masterSize) {
            LayoutUtils.adjustAreaWeights(area, tiles.map((tile) => tile.weight), gap, tiles.indexOf(basis), delta).forEach((newWeight, i) => (tiles[i].weight = newWeight * tiles.length));
        }
        else if (tiles.length === this.masterSize + 1) {
            this.masterRatio = LayoutUtils.adjustAreaHalfWeights(area, this.masterRatio, gap, basisIndex < this.masterSize ? 0 : 1, delta, true);
            if (basisIndex < this.masterSize) {
                const masterTiles = tiles.slice(0, -1);
                LayoutUtils.adjustAreaWeights(area, masterTiles.map((tile) => tile.weight), gap, basisIndex, delta).forEach((newWeight, i) => (masterTiles[i].weight = newWeight * masterTiles.length));
            }
        }
        else if (tiles.length > this.masterSize + 1) {
            let basisGroup;
            if (basisIndex < this.masterSize)
                basisGroup = 1;
            else if (basisIndex < Math.floor((this.masterSize + tiles.length) / 2))
                basisGroup = 2;
            else
                basisGroup = 0;
            const stackRatio = 1 - this.masterRatio;
            const newRatios = LayoutUtils.adjustAreaWeights(area, [stackRatio, this.masterRatio, stackRatio], gap, basisGroup, delta, true);
            const newMasterRatio = newRatios[1];
            const newStackRatio = basisGroup === 0 ? newRatios[0] : newRatios[2];
            this.masterRatio = newMasterRatio / (newMasterRatio + newStackRatio);
            const rstackNumTile = Math.floor((tiles.length - this.masterSize) / 2);
            const [masterTiles, rstackTiles, lstackTiles] = partitionArrayBySizes(tiles, [
                this.masterSize,
                rstackNumTile,
            ]);
            const groupTiles = [lstackTiles, masterTiles, rstackTiles][basisGroup];
            LayoutUtils.adjustAreaWeights(area, groupTiles.map((tile) => tile.weight), gap, groupTiles.indexOf(basis), delta).forEach((newWeight, i) => (groupTiles[i].weight = newWeight * groupTiles.length));
        }
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        const tiles = tileables;
        if (tiles.length <= this.masterSize) {
            LayoutUtils.splitAreaWeighted(area, tiles.map((tile) => tile.weight), gap).forEach((tileArea, i) => (tiles[i].geometry = tileArea));
        }
        else if (tiles.length === this.masterSize + 1) {
            const [masterArea, stackArea] = LayoutUtils.splitAreaHalfWeighted(area, this.masterRatio, gap, true);
            const masterTiles = tiles.slice(0, this.masterSize);
            LayoutUtils.splitAreaWeighted(masterArea, masterTiles.map((tile) => tile.weight), gap).forEach((tileArea, i) => (masterTiles[i].geometry = tileArea));
            tiles[tiles.length - 1].geometry = stackArea;
        }
        else if (tiles.length > this.masterSize + 1) {
            const stackRatio = 1 - this.masterRatio;
            const groupAreas = LayoutUtils.splitAreaWeighted(area, [stackRatio, this.masterRatio, stackRatio], gap, true);
            const rstackSize = Math.floor((tiles.length - this.masterSize) / 2);
            const [masterTiles, rstackTiles, lstackTiles] = partitionArrayBySizes(tiles, [
                this.masterSize,
                rstackSize,
            ]);
            [lstackTiles, masterTiles, rstackTiles].forEach((groupTiles, group) => {
                LayoutUtils.splitAreaWeighted(groupAreas[group], groupTiles.map((tile) => tile.weight), gap).forEach((tileArea, i) => (groupTiles[i].geometry = tileArea));
            });
        }
    }
    clone() {
        const other = new ThreeColumnLayout();
        other.masterRatio = this.masterRatio;
        other.masterSize = this.masterSize;
        return other;
    }
    handleShortcut(ctx, input, data) {
        switch (input) {
            case Shortcut.Increase:
                this.resizeMaster(ctx, +1);
                return true;
            case Shortcut.Decrease:
                this.resizeMaster(ctx, -1);
                return true;
            case Shortcut.DWMLeft:
                this.masterRatio = clip(slide(this.masterRatio, -0.05), ThreeColumnLayout.MIN_MASTER_RATIO, ThreeColumnLayout.MAX_MASTER_RATIO);
                return true;
            case Shortcut.DWMRight:
                this.masterRatio = clip(slide(this.masterRatio, +0.05), ThreeColumnLayout.MIN_MASTER_RATIO, ThreeColumnLayout.MAX_MASTER_RATIO);
                return true;
            default:
                return false;
        }
    }
    toString() {
        return "ThreeColumnLayout(nmaster=" + this.masterSize + ")";
    }
    resizeMaster(ctx, step) {
        this.masterSize = clip(this.masterSize + step, 1, 10);
        ctx.showNotification(this.description);
    }
}
ThreeColumnLayout.MIN_MASTER_RATIO = 0.2;
ThreeColumnLayout.MAX_MASTER_RATIO = 0.75;
ThreeColumnLayout.id = "ThreeColumnLayout";
class TileLayout {
    get description() {
        return "Tile [" + this.numMaster + "]";
    }
    get numMaster() {
        return this.parts.inner.primarySize;
    }
    set numMaster(value) {
        this.parts.inner.primarySize = value;
    }
    get masterRatio() {
        return this.parts.inner.ratio;
    }
    set masterRatio(value) {
        this.parts.inner.ratio = value;
    }
    constructor(capacity) {
        this.classID = TileLayout.id;
        this.capacity = capacity !== undefined ? capacity : null;
        this.parts = new RotateLayoutPart(new HalfSplitLayoutPart(new RotateLayoutPart(new StackLayoutPart()), new StackLayoutPart()));
        switch (CONFIG.tileLayoutInitialAngle) {
            case "1": {
                this.parts.angle = 90;
                break;
            }
            case "2": {
                this.parts.angle = 180;
                break;
            }
            case "3": {
                this.parts.angle = 270;
                break;
            }
        }
    }
    adjust(area, tiles, basis, delta, gap) {
        this.parts.adjust(area, tiles, basis, delta, gap);
    }
    apply(ctx, tileables, area, gap) {
        tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
        this.parts.apply(area, tileables, gap).forEach((geometry, i) => {
            tileables[i].geometry = geometry;
        });
    }
    clone() {
        const other = new TileLayout();
        other.masterRatio = this.masterRatio;
        other.numMaster = this.numMaster;
        return other;
    }
    handleShortcut(ctx, input) {
        switch (input) {
            case Shortcut.DWMLeft:
                this.masterRatio = clip(slide(this.masterRatio, -0.05), TileLayout.MIN_MASTER_RATIO, TileLayout.MAX_MASTER_RATIO);
                break;
            case Shortcut.DWMRight:
                this.masterRatio = clip(slide(this.masterRatio, +0.05), TileLayout.MIN_MASTER_RATIO, TileLayout.MAX_MASTER_RATIO);
                break;
            case Shortcut.Increase:
                if (this.numMaster < 10)
                    this.numMaster += 1;
                ctx.showNotification(this.description);
                break;
            case Shortcut.Decrease:
                if (this.numMaster > 0)
                    this.numMaster -= 1;
                ctx.showNotification(this.description);
                break;
            case Shortcut.Rotate:
                this.parts.rotate(90);
                break;
            case Shortcut.RotatePart:
                this.parts.inner.primary.rotate(90);
                break;
            default:
                return false;
        }
        return true;
    }
    toString() {
        return ("TileLayout(nmaster=" +
            this.numMaster +
            ", ratio=" +
            this.masterRatio +
            ")");
    }
}
TileLayout.MIN_MASTER_RATIO = 0.2;
TileLayout.MAX_MASTER_RATIO = 0.8;
TileLayout.id = "TileLayout";
function debugWin(win) {
    var w_props = [
        { name: "caption", opt: win.caption },
        { name: "output.name", opt: win.output.name },
        { name: "resourceName", opt: win.resourceName },
        { name: "resourceClass", opt: win.resourceClass },
        { name: "skipPager", opt: win.skipPager },
        { name: "desktopWindow", opt: win.desktopWindow },
        { name: "windowRole", opt: win.windowRole },
        { name: "windowType", opt: win.windowType },
        { name: "pid", opt: win.pid },
        { name: "internalId", opt: win.internalId },
        { name: "stackingOrder", opt: win.stackingOrder },
        { name: "size", opt: win.size },
        { name: "width", opt: win.width },
        { name: "height", opt: win.height },
        { name: "dock", opt: win.dock },
        { name: "toolbar", opt: win.toolbar },
        { name: "menu", opt: win.menu },
        { name: "dialog", opt: win.dialog },
        { name: "splash", opt: win.splash },
        { name: "utility", opt: win.utility },
        { name: "dropdownMenu", opt: win.dropdownMenu },
        { name: "popupMenu", opt: win.popupMenu },
        { name: "tooltip", opt: win.tooltip },
        { name: "notification", opt: win.notification },
        { name: "criticalNotification", opt: win.criticalNotification },
        { name: "appletPopup", opt: win.appletPopup },
        { name: "onScreenDisplay", opt: win.onScreenDisplay },
        { name: "comboBox", opt: win.comboBox },
        { name: "managed", opt: win.managed },
        { name: "popupWindow", opt: win.popupWindow },
        { name: "outline", opt: win.outline },
        { name: "fullScreenable", opt: win.fullScreenable },
        { name: "closeable", opt: win.closeable },
        { name: "minimizable", opt: win.minimizable },
        { name: "specialWindow", opt: win.specialWindow },
        { name: "modal", opt: win.modal },
        { name: "resizeable", opt: win.resizeable },
        { name: "minimized", opt: win.minimized },
        { name: "tile", opt: win.tile },
        { name: "minSize", opt: win.minSize },
        { name: "maxSize", opt: win.maxSize },
        { name: "transient", opt: win.transient },
        { name: "transientFor", opt: win.transientFor },
        { name: "maximizable", opt: win.maximizable },
        { name: "maximizeMode", opt: win.maximizeMode },
        { name: "moveable", opt: win.moveable },
        { name: "moveableAcrossScreens", opt: win.moveableAcrossScreens },
        { name: "hidden", opt: win.hidden },
        { name: "keepAbove", opt: win.keepAbove },
        { name: "keepBelow", opt: win.keepBelow },
        { name: "opacity", opt: win.opacity },
    ];
    var s = "kwin window props:";
    w_props.forEach((el) => {
        if (typeof el.opt !== "undefined" &&
            (el.opt || el.opt === 0 || el.opt === "0")) {
            s += "<";
            s += el.name;
            s += ": ";
            s += el.opt;
            s += "> ";
        }
    });
    return s;
}
class Err {
    constructor(s) {
        this.error = s;
    }
    toString() {
        return `${this.error}`;
    }
}
function warning(s) {
    print(`Krohnkite.WARNING: ${s}`);
}
function clip(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
function slide(value, step) {
    if (step === 0)
        return value;
    return Math.floor(value / step + 1.000001) * step;
}
function matchWords(str, words) {
    for (let i = 0; i < words.length; i++) {
        if (str.indexOf(words[i]) >= 0)
            return i;
    }
    return -1;
}
function wrapIndex(index, length) {
    if (index < 0)
        return index + length;
    if (index >= length)
        return index - length;
    return index;
}
function getRandomInt(max, signed = false) {
    const randomNumber = Math.floor(Math.random() * max);
    if (signed && Math.random() < 0.5)
        return -randomNumber;
    return randomNumber;
}
function partitionArray(array, predicate) {
    return array.reduce((parts, item, index) => {
        parts[predicate(item, index) ? 0 : 1].push(item);
        return parts;
    }, [[], []]);
}
function partitionArrayBySizes(array, sizes) {
    let base = 0;
    const chunks = sizes.map((size) => {
        const chunk = array.slice(base, base + size);
        base += size;
        return chunk;
    });
    chunks.push(array.slice(base));
    return chunks;
}
function overlap(min1, max1, min2, max2) {
    const min = Math.min;
    const max = Math.max;
    const dx = max(0, min(max1, max2) - max(min1, min2));
    return dx > 0;
}
class SurfaceCfg {
    constructor(outputName, activityId, vDesktopName, cfg) {
        this.outputName = outputName;
        this.activityId = activityId;
        this.vDesktopName = vDesktopName;
        this.cfg = cfg;
    }
    isFit(output, activity, vDesktop) {
        return ((this.outputName === "" || this.outputName === output.name) &&
            (this.activityId === "" || this.activityId === activity) &&
            (this.vDesktopName === "" || this.vDesktopName === vDesktop.name));
    }
    toString() {
        return `Surface: Output Name: ${this.outputName}, Activity ID: ${this.activityId}, Virtual Desktop Name: ${this.vDesktopName} cfg: ${this.cfg}`;
    }
}
function getSurfacesCfg(userConfig) {
    let surfacesCfg = [];
    if (userConfig.length === 0)
        return surfacesCfg;
    userConfig.forEach((cfg) => {
        let surfaceCfgString = cfg.split(":").map((part) => part.trim());
        if (surfaceCfgString.length !== 4) {
            warning(`Invalid User surface config: ${cfg}, config must have three colons`);
            return;
        }
        surfacesCfg.push({
            outputName: surfaceCfgString[0],
            activityId: surfaceCfgString[1],
            vDesktopName: surfaceCfgString[2],
            unvalidatedCfg: surfaceCfgString[3]
                .split(",")
                .map((part) => part.trim().toLowerCase()),
        });
    });
    return surfacesCfg;
}
function surfaceIdParse(id) {
    let i1 = id.indexOf("@");
    let i2 = id.indexOf("#");
    let outputName = i1 !== -1 ? id.slice(0, i1) : id;
    let activity = i1 !== -1 && i2 !== -1 ? id.slice(i1 + 1, i2) : "";
    let desktopName = i2 !== -1 ? id.slice(i2 + 1) : "";
    return [outputName, activity, desktopName];
}
function getMethodName() {
    var _a;
    var err = new Error();
    return `${(_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[1].split("@")[0]}`;
}
function unCapitalize(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function toQRect(rect) {
    return Qt.rect(rect.x, rect.y, rect.width, rect.height);
}
function toRect(qrect) {
    return new Rect(qrect.x, qrect.y, qrect.width, qrect.height);
}
class Logging {
    constructor(modules, filters) {
        this._isIncludeMode = true;
        this._logModules = Logging.parseModules(modules);
        this._filters = this.parseFilters(filters);
        this._started = new Date().getTime();
    }
    send(module, action, message, filter) {
        if (module !== undefined && !this.isModuleOn(module))
            return;
        if (filter !== undefined) {
            if (this.isFiltered(filter))
                return;
        }
        this._print(module, action, message);
    }
    print(module, action, message) {
        this._print(module, action, message);
    }
    isModuleOn(module) {
        return this._logModules.has(module);
    }
    isFiltered(filter) {
        if (this._filters === null)
            return false;
        let key;
        for (key in filter) {
            if (this._filters[key] == null || filter[key] == null)
                continue;
            const isContain = KWinWindow.isContain(this._filters[key], filter[key][0]);
            if (this._isIncludeMode) {
                return isContain ? false : true;
            }
            else {
                return isContain ? true : false;
            }
        }
        return false;
    }
    static parseModules(modules) {
        let logModules = new Set();
        for (const module of modules) {
            const userModules = Logging._logParseUserModules(module[0], module[1]);
            if (userModules !== null) {
                logModules = new Set([...logModules, ...userModules]);
            }
        }
        return logModules;
    }
    parseFilters(filters) {
        if (filters.length === 0 || (filters.length === 1 && filters[0] === ""))
            return null;
        let logFilters;
        if (filters[0] !== "" && filters[0][0] === "!") {
            this._isIncludeMode = false;
            filters[0] = filters[0].slice(1);
        }
        logFilters = { winClass: null };
        for (const filter of filters) {
            const filterParts = filter.split("=");
            if (filterParts.length !== 2) {
                warning(`Invalid Log filter: ${filter}.Every filter have contain "=" equal sign`);
                continue;
            }
            if (filterParts[0].toLowerCase() === "winclass") {
                logFilters.winClass = filterParts[1].split(":");
                continue;
            }
            warning(`Unknown Log filter name:${filterParts[0]} in filter ${filter}.`);
            continue;
        }
        return logFilters;
    }
    _print(module, action, message) {
        const timestamp = (new Date().getTime() - this._started) / 1000;
        print(`Krohnkite.log [${timestamp}], ${module !== undefined ? `[${module}]` : ""} ${action !== undefined ? action : ""} ${message !== undefined ? message : ""}`);
    }
    static _logParseUserModules(logPartition, userStr) {
        let submodules;
        let includeMode = true;
        if (userStr.length === 0) {
            return new Set(logPartition.modules);
        }
        if (userStr[0] !== "" && userStr[0][0] === "!") {
            includeMode = false;
            userStr[0] = userStr[0].substring(1);
            submodules = new Set(logPartition.modules);
        }
        else {
            submodules = new Set();
        }
        for (let moduleStr of userStr) {
            if (moduleStr.includes("-")) {
                const range = moduleStr.split("-");
                if (range.length !== 2) {
                    warning(`Invalid module range:${range} in ${moduleStr}, ignoring module ${logPartition.name} `);
                    return null;
                }
                const start = validateNumber(range[0]);
                let end;
                if (range[1] === "") {
                    end = logPartition.modules.length;
                }
                else {
                    end = validateNumber(range[1]);
                }
                if (start instanceof Err || end instanceof Err) {
                    let err = start instanceof Err ? start : end;
                    warning(`Invalid module number: ${err} in ${moduleStr}, ignoring module ${logPartition.name}`);
                    return null;
                }
                if (start > end || start < 1) {
                    warning(`Invalid module range:${range}. The start must be less than end and both must be greater than zero. Module string: ${moduleStr}, ignoring module ${logPartition.name} `);
                    return null;
                }
                if (end > logPartition.modules.length) {
                    warning(`Invalid module range:${range}. The end must be less than or equal to the number of submodules:${logPartition.modules.length} in the module. Module string: ${moduleStr}, ignoring module ${logPartition.name} `);
                    return null;
                }
                if (includeMode) {
                    for (let i = start - 1; i < end; i++) {
                        submodules.add(logPartition.modules[i]);
                    }
                }
                else {
                    for (let i = start - 1; i < end; i++) {
                        submodules.delete(logPartition.modules[i]);
                    }
                }
            }
            else {
                let moduleNumber = validateNumber(moduleStr);
                if (moduleNumber instanceof Err) {
                    warning(`Invalid module number:${moduleNumber}. The module number must be a number. Module string: ${moduleStr}, ignoring module ${logPartition.name} `);
                    return null;
                }
                if (moduleNumber < 1 || moduleNumber > logPartition.modules.length) {
                    warning(`Invalid module number:${moduleNumber}. The module number must be >=1 and <= number of submodules:${logPartition.modules.length}. Module string: ${moduleStr}, ignoring module ${logPartition.name} `);
                    return null;
                }
                if (includeMode) {
                    submodules.add(logPartition.modules[moduleNumber - 1]);
                }
                else {
                    submodules.delete(logPartition.modules[moduleNumber - 1]);
                }
            }
        }
        return submodules;
    }
}
class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get maxX() {
        return this.x + this.width;
    }
    get maxY() {
        return this.y + this.height;
    }
    get center() {
        return [
            this.x + Math.floor(this.width / 2),
            this.y + Math.floor(this.height / 2),
        ];
    }
    get activationPoint() {
        return [this.x + Math.floor(this.width / 2), this.y + 10];
    }
    clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }
    equals(other) {
        return (this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height);
    }
    gap(left, right, top, bottom) {
        return new Rect(this.x + left, this.y + top, this.width - (left + right), this.height - (top + bottom));
    }
    gap_mut(left, right, top, bottom) {
        this.x += left;
        this.y += top;
        this.width -= left + right;
        this.height -= top + bottom;
        return this;
    }
    includes(other) {
        return (this.x <= other.x &&
            this.y <= other.y &&
            other.maxX < this.maxX &&
            other.maxY < this.maxY);
    }
    includesPoint([x, y], part = 4) {
        if (part === 0)
            return (this.x <= x &&
                x <= this.maxX &&
                this.y <= y &&
                y <= this.y + this.height / 2);
        else if (part === 1)
            return (this.x <= x &&
                x <= this.maxX &&
                y > this.y + this.height / 2 &&
                y <= this.maxY);
        else if (part === 2) {
            return (this.y <= y &&
                y <= this.maxY &&
                this.x <= x &&
                x <= this.x + this.height / 2);
        }
        else if (part === 3) {
            return (this.y <= y &&
                y <= this.maxY &&
                x > this.x + this.width / 2 &&
                x <= this.maxX);
        }
        else {
            return this.x <= x && x <= this.maxX && this.y <= y && y <= this.maxY;
        }
    }
    isTopZone([x, y], activeZone = 10) {
        return (this.y <= y &&
            y <= this.y + (this.height * activeZone) / 100 &&
            this.x <= x &&
            x <= this.maxX);
    }
    isBottomZone([x, y], activeZone = 10) {
        return (y >= this.maxY - (this.height * activeZone) / 100 &&
            y <= this.maxY &&
            this.x <= x &&
            x <= this.maxX);
    }
    isLeftZone([x, y], activeZone = 10) {
        return (this.x <= x &&
            x <= this.x + (this.width * activeZone) / 100 &&
            this.y <= y &&
            y <= this.maxY);
    }
    isRightZone([x, y], activeZone = 10) {
        return (x >= this.maxX - (this.width * activeZone) / 100 &&
            x <= this.maxX &&
            this.y <= y &&
            y <= this.maxY);
    }
    subtract(other) {
        return new Rect(this.x - other.x, this.y - other.y, this.width - other.width, this.height - other.height);
    }
    intersection(other, coordinate) {
        if (coordinate === "x") {
            return Math.max(0, Math.min(this.maxX, other.maxX) - Math.max(this.x, other.x));
        }
        else {
            return Math.max(0, Math.min(this.maxY, other.maxY) - Math.max(this.y, other.y));
        }
    }
    toString() {
        return "Rect(" + [this.x, this.y, this.width, this.height].join(", ") + ")";
    }
}
class RectDelta {
    static fromRects(basis, target) {
        const diff = target.subtract(basis);
        return new RectDelta(diff.width + diff.x, -diff.x, diff.height + diff.y, -diff.y);
    }
    constructor(east, west, south, north) {
        this.east = east;
        this.west = west;
        this.south = south;
        this.north = north;
    }
    toString() {
        return ("WindowResizeDelta(" +
            [
                "east=" + this.east,
                "west=" + this.west,
                "north=" + this.north,
                "south=" + this.south,
            ].join(" ") +
            ")");
    }
}
function isNumeric(s) {
    if (typeof s != "string")
        return false;
    return !isNaN(s) && !isNaN(parseFloat(s));
}
function parseNumber(value, float = false) {
    if (!isNumeric(value)) {
        return new Err("Invalid number");
    }
    if (float) {
        return parseFloat(value);
    }
    else {
        return parseInt(value);
    }
}
function validateNumber(value, from, to, float = false) {
    let num;
    if (typeof value === "number") {
        num = value;
    }
    else {
        num = parseNumber(value, float);
        if (num instanceof Err) {
            return num;
        }
    }
    if (from !== undefined && num < from) {
        return new Err(`Number must be greater than or equal to ${from}`);
    }
    else if (to !== undefined && num > to) {
        return new Err(`Number must be less than or equal to ${to}`);
    }
    return num;
}
function validateNumberWithDefault(value, defaultValue, errMess, from, to, float = false) {
    let num;
    const err = `validateNumber: ${errMess}. param: ${value}. Error:`;
    if (typeof value === "number") {
        num = value;
    }
    else {
        num = parseNumber(value, float);
        if (num instanceof Err) {
            warning(`${err}${num.toString()}`);
            return defaultValue;
        }
    }
    if (from !== undefined && num < from) {
        warning(`${err}Number must be greater than or equal to ${from}`);
        return defaultValue;
    }
    else if (to !== undefined && num > to) {
        warning(`${err}Number must be less than or equal to ${to}`);
        return defaultValue;
    }
    return num;
}
class windRose {
    constructor(direction) {
        switch (direction) {
            case "0":
                this.direction = 0;
                break;
            case "1":
                this.direction = 1;
                break;
            case "2":
                this.direction = 2;
                break;
            case "3":
                this.direction = 3;
                break;
            default:
                this.direction = 0;
        }
    }
    get north() {
        return this.direction === 0;
    }
    get east() {
        return this.direction === 1;
    }
    get south() {
        return this.direction === 2;
    }
    get west() {
        return this.direction === 3;
    }
    cwRotation() {
        this.direction = (this.direction + 1) % 4;
    }
    ccwRotation() {
        this.direction = this.direction - 1 >= 0 ? this.direction - 1 : 3;
    }
    toString() {
        switch (this.direction) {
            case 0: {
                return "North";
            }
            case 1: {
                return "East";
            }
            case 2: {
                return "South";
            }
            case 3: {
                return "West";
            }
            default: {
                return "Unknown";
            }
        }
    }
}
class WrapperMap {
    constructor(hasher, wrapper) {
        this.hasher = hasher;
        this.wrapper = wrapper;
        this.items = {};
    }
    add(item) {
        const key = this.hasher(item);
        if (this.items[key] !== undefined)
            throw "WrapperMap: the key [" + key + "] already exists!";
        const wrapped = this.wrapper(item);
        this.items[key] = wrapped;
        return wrapped;
    }
    get(item) {
        const key = this.hasher(item);
        return this.items[key] || null;
    }
    getByKey(key) {
        return this.items[key] || null;
    }
    remove(item) {
        const key = this.hasher(item);
        return delete this.items[key];
    }
    length() {
        return Object.keys(this.items).length;
    }
}
