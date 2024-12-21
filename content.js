if (!document.getElementById("floatingButton")) {
  
  const button = document.createElement("button");
  button.id = "floatingButton";
  button.style.position = "fixed";
  button.style.top = "200px";
  button.style.right = "200px"; 
  button.style.width = "50px";
  button.style.height = "50px";
  button.style.padding = "10px 20px";
  button.style.borderRadius = "50px";
  button.style.backgroundImage = "url('img/101.jpg')";
  button.style.backgroundSize = "cover";
  button.style.backgroundPosition = "center";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.zIndex = "10000";
  button.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";

  let isDragging = false;
  let startX, startY, startLeft, startTop;

  button.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = button.offsetLeft;
    startTop = button.offsetTop;

    document.addEventListener("mousemove", dragButton);
    document.addEventListener("mouseup", stopDragging);
  });

  function dragButton(e) {
    if (!isDragging) return;

    const moveDistanceX = e.clientX - startX;
    const moveDistanceY = e.clientY - startY;

    const newLeft = Math.min(
      Math.max(startLeft + moveDistanceX, 20),
      window.innerWidth - button.offsetWidth - 20
    );
    const newTop = Math.min(
      Math.max(startTop + moveDistanceY, 20),
      window.innerHeight - button.offsetHeight - 20
    );

    button.style.left = `${newLeft}px`;
    button.style.top = `${newTop}px`;
  }

  function stopDragging() {
    isDragging = false;
    document.removeEventListener("mousemove", dragButton);
    document.removeEventListener("mouseup", stopDragging);
  }

  document.body.appendChild(button);

  document
    .getElementById("floatingButton")
    .addEventListener("dblclick", async () => {
      const pageHtml = document.documentElement.outerHTML; // Get full HTML content

      button.textContent = "Summarizing...";
      button.disabled = true;

      try {
        const apiUrl = "http://localhost/api/summarize.php"; // API endpoint

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ html: pageHtml }), // Send full HTML content
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch summary: ${errorText}`);
        }

        const data = await response.json();
        const summary = data.summary || "No summary available";

        // Display the summary in a popup window
        const popupHtml = `
        <html>
          <head>
            <title>Summary</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              h1 {
                font-size: 18px;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <h1>Page Summary</h1>
            <p>${summary}</p>
          </body>
        </html>
      `;

        const popupWindow = window.open(
          "",
          "PopupWindow",
          "width=300,height=400,top=100,left=100"
        );
        popupWindow.document.write(popupHtml);
        popupWindow.document.close();
      } catch (error) {
        console.error("Error fetching summary:", error);
        alert(`Error summarizing the page: ${error.message}`);
      } finally {
        button.textContent = "";
        button.disabled = false; // Re-enable the button after completion
      }
    });
}
