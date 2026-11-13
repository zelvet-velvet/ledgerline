// A small tick from the phone, where it can give one (the method from Morellonomicon's ui.ts haptic). Returns how:
// "capacitor" (Obsidian's own Haptics plugin, if the app has it), "vibrate" (the web vibration API; iPhones ignore it),
// "switch" (iOS 18+ ticks when a switch-style checkbox is toggled, but only inside a tap, not while a finger moves: call it on
// the finger's release) or "" when nothing is there.
let tickBox: HTMLLabelElement | null = null;
export function tick(): string {
    try {
        const hp = (window as unknown as { Capacitor?: { Plugins?: { Haptics?: { selectionChanged?: () => unknown; impact?: (o: { style: string }) => unknown } } } }).Capacitor?.Plugins?.Haptics;
        if (hp?.impact) { void hp.impact({ style: "LIGHT" }); return "capacitor"; }
        if (hp?.selectionChanged) { void hp.selectionChanged(); return "capacitor"; }
    } catch { /* not there */ }
    try { if (navigator.vibrate?.(8)) return "vibrate"; } catch { /* not there */ }
    if (!tickBox) {
        tickBox = document.createElement("label");
        tickBox.className = "zl-haptic";
        tickBox.setAttribute("aria-hidden", "true");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.setAttribute("switch", "");
        box.tabIndex = -1;
        tickBox.appendChild(box);
        document.body.appendChild(tickBox);
    }
    tickBox.click();
    return /iPhone|iPad/.test(navigator.userAgent) ? "switch" : "";
}
