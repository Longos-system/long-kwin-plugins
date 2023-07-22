/*
    KWin - the KDE window manager
    This file is part of the KDE project.

    SPDX-FileCopyrightText: 2018 Vlad Zahorodnii <vlad.zahorodnii@kde.org>

    SPDX-License-Identifier: GPL-2.0-or-later
*/

"use strict";

var blocklist = [
    // The logout screen has to be animated only by the logout effect.
    "ksmserver ksmserver",
    "ksmserver-logout-greeter ksmserver-logout-greeter",

    // KDE Plasma splash screen has to be animated only by the login effect.
    "ksplashqml ksplashqml"
];

var allowlist = [
    "long-launcher long-launcher",
    "long-screenshot long-screenshot"
];

function isPopupWindow(window) {
    // If the window is blocklisted, don't animate it.
    if (blocklist.indexOf(window.windowClass) != -1) {
        return false;
    }

    if (allowlist.indexOf(window.windowClass) != -1) {
        return true;
    }

    // Animate combo box popups, tooltips, popup menus, etc.
    if (window.popupWindow) {
        return true;
    }

    // Maybe the outline deserves its own effect.
    if (window.outline) {
        return true;
    }

    // Override-redirect windows are usually used for user interface
    // concepts that are expected to be animated by this effect, e.g.
    // popups that contain window thumbnails on X11, etc.
    if (!window.managed) {
        // Some utility windows can look like popup windows (e.g. the
        // address bar dropdown in Firefox), but we don't want to fade
        // them because the fade effect didn't do that.
        if (window.utility) {
            return false;
        }

        return true;
    }

    // Previously, there was a "monolithic" fade effect, which tried to
    // animate almost every window that was shown or hidden. Then it was
    // split into two effects: one that animates toplevel windows and
    // this one. In addition to popups, this effect also animates some
    // special windows(e.g. notifications) because the monolithic version
    // was doing that.
    if (window.dock || window.splash || window.toolbar
            || window.notification || window.onScreenDisplay
            || window.criticalNotification) {
        return true;
    }

    return false;
}

var longPopupsEffect = {
    loadConfig: function () {
        longPopupsEffect.fadeInDuration = animationTime(100);
        longPopupsEffect.fadeOutDuration = animationTime(100) * 4;
    },
    slotWindowAdded: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }
        if (!isPopupWindow(window)) {
            return;
        }
        if (!window.visible) {
            return;
        }
        if (!effect.grab(window, Effect.WindowAddedGrabRole)) {
            return;
        }
        window.fadeInAnimation = animate({
            window: window,
            curve: QEasingCurve.Linear,
            duration: longPopupsEffect.fadeInDuration,
            type: Effect.Opacity,
            from: 0.0,
            to: 1.0
        });
    },
    slotWindowClosed: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }
        if (!isPopupWindow(window)) {
            return;
        }
        if (!window.visible) {
            return;
        }
        if (!effect.grab(window, Effect.WindowClosedGrabRole)) {
            return;
        }
        window.fadeOutAnimation = animate({
            window: window,
            curve: QEasingCurve.OutQuart,
            duration: longPopupsEffect.fadeOutDuration,
            type: Effect.Opacity,
            from: 1.0,
            to: 0.0
        });
    },
    slotWindowDataChanged: function (window, role) {
        if (role == Effect.WindowAddedGrabRole) {
            if (window.fadeInAnimation && effect.isGrabbed(window, role)) {
                cancel(window.fadeInAnimation);
                delete window.fadeInAnimation;
            }
        } else if (role == Effect.WindowClosedGrabRole) {
            if (window.fadeOutAnimation && effect.isGrabbed(window, role)) {
                cancel(window.fadeOutAnimation);
                delete window.fadeOutAnimation;
            }
        }
    },
    init: function () {
        longPopupsEffect.loadConfig();

        effect.configChanged.connect(longPopupsEffect.loadConfig);
        effects.windowAdded.connect(longPopupsEffect.slotWindowAdded);
        effects.windowClosed.connect(longPopupsEffect.slotWindowClosed);
        effects.windowDataChanged.connect(longPopupsEffect.slotWindowDataChanged);
    }
};

longPopupsEffect.init();