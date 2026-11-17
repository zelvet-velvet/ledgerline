// The app's own toast (owner's rule: the save hint's look, never Obsidian's rounded Notice). One at a time, at the top of the
// screen, over everything, for 2 s; it covers nothing the finger needs and never moves the page. Ink for a done thing, loud
// only when something went wrong (a row gone, a name missing, an error). CSS `.zl-toast` in css/c.css.
let el: HTMLElement | null = null, timer = 0;
export const toast = (text: string, loud = false, ms = 2000): void => {
    if (!el || !el.isConnected) el = document.body.createDiv({ cls: "zl-toast", attr: { role: "status", "aria-live": "polite" } });
    window.clearTimeout(timer);
    el.textContent = text;
    el.toggleClass("is-loud", loud);
    el.toggleClass("theme-dark", document.body.hasClass("theme-dark"));
    void el.offsetWidth;   // restart the fade when a toast replaces another
    el.addClass("is-on");
    timer = window.setTimeout(() => el?.removeClass("is-on"), ms);
};
