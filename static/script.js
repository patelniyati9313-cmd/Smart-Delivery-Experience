
/* ==================================
   SMART DELIVERY EXPERIENCE
   JavaScript Functionality
================================== */

// MOBILE MENU

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("active");
});

// Mobile menu click karne par close

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
    });
});


// DEMO ORDER DATA

const demoOrders = {

    SD1001: {
        id: "SD1001",
        status: "On the way",
        statusClass: "",
        expectedDate: "28 November 2026",
        location: "Ahmedabad Delivery Hub",
        confidence: "Demo: High",
        alertTitle: "Your order is moving",
        alertMessage:
            "Your package has reached the Ahmedabad delivery hub. " +
            "This is sample prototype information, not live courier tracking.",
        stages: [
            {
                title: "Order Confirmed",
                description: "Your order has been confirmed.",
                time: "Completed",
                completed: true
            },
            {
                title: "Order Packed",
                description: "Your package has been prepared.",
                time: "Completed",
                completed: true
            },
            {
                title: "Shipped",
                description: "Your package is on its journey.",
                time: "Completed",
                completed: true
            },
            {
                title: "Reached Delivery Hub",
                description: "Your package reached the local hub.",
                time: "Current status",
                completed: false,
                current: true
            },
            {
                title: "Out for Delivery",
                description: "The package will be assigned for delivery.",
                time: "Pending",
                completed: false
            },
            {
                title: "Delivered",
                description: "Your package will be delivered.",
                time: "Pending",
                completed: false
            }
        ]
    },

    SD1002: {
        id: "SD1002",
        status: "Delivery Delayed",
        statusClass: "delayed",
        expectedDate: "30 November 2026",
        location: "Transit Hub",
        confidence: "Demo: Medium",
        alertTitle: "Delivery update",
        alertMessage:
            "The delivery is delayed in this sample scenario. " +
            "A new estimated date is displayed to demonstrate transparent updates. " +
            "This is not real courier information.",
        stages: [
            {
                title: "Order Confirmed",
                description: "Your order has been confirmed.",
                time: "Completed",
                completed: true
            },
            {
                title: "Order Packed",
                description: "Your package has been prepared.",
                time: "Completed",
                completed: true
            },
            {
                title: "Shipped",
                description: "Your package has been shipped.",
                time: "Completed",
                completed: true
            },
            {
                title: "Transit Delay",
                description: "The package is delayed in transit.",
                time: "Current status",
                completed: false,
                current: true
            },
            {
                title: "Reached Delivery Hub",
                description: "The package is expected to reach the local hub.",
                time: "Pending",
                completed: false
            },
            {
                title: "Delivered",
                description: "The package will be delivered.",
                time: "Pending",
                completed: false
            }
        ]
    }
};


// TRACKING FUNCTION

const orderInput = document.getElementById("orderInput");
const trackBtn = document.getElementById("trackBtn");
const trackingResult = document.getElementById("trackingResult");

trackBtn.addEventListener("click", trackOrder);


// Enter button se bhi tracking

orderInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        trackOrder();
    }
});



// ==========================================
// TRACK ORDER FUNCTION
// ==========================================

async function trackOrder() {

    const orderID = orderInput.value.trim().toUpperCase();

    // 1. Agar input blank hai
    if (orderID === "") {

        await recordTrackingAttempt("", false);

        trackingResult.innerHTML = `
            <div class="tracking-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <h3>Please enter an order ID</h3>
                <p>Try the demo ID SD1001 or SD1002.</p>
            </div>
        `;
        return;
    }

    // 2. Check order ID
    const order = demoOrders[orderID];

    // 3. Agar ID galat hai
    if (!order) {

        await recordTrackingAttempt(orderID, false);

        trackingResult.innerHTML = `
            <div class="tracking-placeholder">
                <div class="placeholder-icon">🔍</div>
                <h3>Demo order not found</h3>
                <p>Please try SD1001 or SD1002.</p>
            </div>
        `;
        return;
    }

    // 4. Agar ID sahi hai
    await recordTrackingAttempt(orderID, true);

    // 5. Order ki details display karo
    displayOrder(order);
}


// ==========================================
// RECORD TRACKING ATTEMPT IN BACKEND
// ==========================================

async function recordTrackingAttempt(orderID, success) {

    try {

        const response = await fetch("/api/track", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                order_id: orderID,
                success: success
            })

        });

        const result = await response.json();

        console.log("Backend:", result);

    } catch (error) {

        console.error("Backend recording failed:", error);

    }
}



// DISPLAY ORDER DETAILS

function displayOrder(order) {

    let timelineHTML = "";

    order.stages.forEach(function (stage) {

        let className = "";

        if (stage.completed) {
            className = "completed";
        }

        if (stage.current) {
            className = "current";
        }

        let symbol = "•";

        if (stage.completed) {
            symbol = "✓";
        }

        if (stage.current) {
            symbol = "●";
        }

        timelineHTML += `
            <div class="timeline-item ${className}">
                <div class="timeline-dot">${symbol}</div>

                <div class="timeline-text">
                    <h4>${stage.title}</h4>
                    <p>${stage.description}</p>
                    <time>${stage.time}</time>
                </div>
            </div>
        `;
    });


    let alertClass = "";

    if (order.statusClass === "delayed") {
        alertClass = "warning";
    }


    trackingResult.innerHTML = `

        <div class="result-header">
            <div>
                <span class="section-tag">DEMO ORDER</span>
                <h3>${order.id}</h3>
            </div>

            <span class="order-status ${order.statusClass}">
                ${order.status}
            </span>
        </div>

        <div class="delivery-details">

            <div class="detail-box">
                <span>Estimated delivery</span>
                <strong>${order.expectedDate}</strong>
            </div>

            <div class="detail-box">
                <span>Current location</span>
                <strong>${order.location}</strong>
            </div>

            <div class="detail-box">
                <span>Estimate indicator</span>
                <strong>${order.confidence}</strong>
            </div>

        </div>

        <div class="delivery-alert ${alertClass}">
            <h4>ℹ️ ${order.alertTitle}</h4>
            <p>${order.alertMessage}</p>
        </div>

        <h3>Delivery journey</h3>

        <div class="timeline">
            ${timelineHTML}
        </div>

        <p class="demo-note">
            Academic prototype: all tracking details shown here are simulated.
        </p>
    `;
}


// OPTIONAL: SURVEY DATA DISPLAY

/*
Actual survey findings yaha add karna.

Example format (real data use karna):

document.getElementById("responseCount").textContent = "34";

document.getElementById("lateDelivery").textContent = "50%";

document.getElementById("topProblem").textContent = "Late Delivery";

IMPORTANT:
Example numbers ko apne actual Google Form
responses ke according hi update karna.
*/
