document.addEventListener("keyup", function (event) {
    event.preventDefault();

    if (event.ctrlKey && event.altKey && event.key === "d") {
        const currentURL = new URL(window.location.href);

        if (currentURL.searchParams.get("debug") === "true") {
            currentURL.searchParams.set("debug", "false");
            window.location.href = currentURL;
            console.debug("Debug disabled.");
        } else {
            currentURL.searchParams.set("debug", "true");
            window.location.href = currentURL;
            console.debug("Debug enabled.");
        }
    }
});