let adminMainData = JSON.parse(localStorage.getItem("adminMainData"));
let renderReports = function() {
    fetch(`${domain}/admin/AccountsNew`, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${adminMainData.token}`}
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('overlay').classList.add('hide-overlay');
        document.querySelector("html").style.overflow = "auto";
        window.scrollTo(0, 0);
        let imagesSourses = ["./images/video3.png", "./images/payment2.png", "./images/payment2.png"];
        let descrips = ["Total Sessions", "Total Payment", "Net Profit"];
        for (i = 0; i < 3; i++) {
            $("<div>").addClass("report").html(`
                <div>
                    <img src=${imagesSourses[i]}>
                </div>
                <div>
                    <span>${i == 0 ? data.totals.totalOrders + " Session" : i == 1 ? data.totals.totalPaid + "$" : data.totals.profit + "$"}</span>
                    <span>${descrips[i]}</span>
                </div>
            `).appendTo(".parent .content .dash .reports");
        }
    })
    .catch(error => {
        console.error(error);
    });
}
let dash = document.querySelector(".parent .content .dash");
let renderRequests = function() {
    fetch(`${domain}/admin/verfy-doctors`, {
        headers: {
            'Authorization': `Bearer ${adminMainData.token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        renderReports();
        let h2 = document.createElement("h2");
        h2.innerHTML = (data["data"].length ? `Doctor’s Requests<span>${data["data"].length} Request</span>` : "Doctor’s Requests");
        dash.appendChild(h2);
        let attrs = document.createElement("div");
        attrs.classList.add("attrs");
        attrs.innerHTML = (`
            <span>Name</span>
            <span>E-mail</span>
            <span>Age</span>
            <span>National ID</span>
            <span>License</span>
            <span></span>
        `);
        dash.appendChild(attrs);
        let requestsDiv = document.createElement("div");
        requestsDiv.classList.add("requests");
        if (data.data.length == 0) {
            let noRequestesP = document.createElement("p");
            noRequestesP.innerHTML = ("New requestes will be shown here.");
            noRequestesP.style.cssText = "margin-top: 15px; margin-left: 40px; color: var(--main-color); font-size: 33px;";
            requestsDiv.appendChild(noRequestesP);
            dash.appendChild(requestsDiv);
        }
        else {
            for (i = 0; i < data["data"].length; i++) {
                let request = document.createElement("div");
                request.classList.add("request");
                request.innerHTML = (`
                    <div>
                        <img src=${data["data"][i].photo}>${data["data"][i].userName}
                    </div>
                    <span>${data["data"][i].email}</span>
                    <span>${!isNaN(data["data"][i].birthDate) ? data["data"][i].birthDate : "Not set!"}</span>
                    <span>
                        <button>View</button>
                    </span>
                    <span>
                        <button>View</button>
                    </span>
                    <div>
                        <img src="./images/accept2.png">
                        <img src="./images/deny2.png">
                        <div class="spinner"></div>
                    </div>
                `);
                requestsDiv.appendChild(request);
            }
            dash.appendChild(requestsDiv);
            let profPhotos = document.querySelectorAll(".parent .content .dash .requests .request div:first-of-type img");
            let licenses = document.querySelectorAll(".parent .content .dash .requests .request span:nth-of-type(3) button");
            let licenses2 = document.querySelectorAll(".parent .content .dash .requests .request span:nth-of-type(4) button");
            let showImgOver = function(toAddEvent, toShow) {
                for (i = 0; i < toAddEvent.length; i++) {
                    toAddEvent[i].onclick = function() {
                        swal({
                            icon: data.data[Array.prototype.indexOf.call(toAddEvent, this)][toShow],
                            className: "custom-swal"
                        });
                    }
                }
            }
            showImgOver(profPhotos, "photo");
            showImgOver(licenses, "license");
            showImgOver(licenses2, "license");
            let allAcceptButtons = document.querySelectorAll(".parent .content .dash .requests .request div:last-of-type img:first-of-type");
            let allRequestsSnippers = document.querySelectorAll(".parent .content .dash .requests .request div:last-of-type .spinner");
            let allDenyButtons = document.querySelectorAll(".parent .content .dash .requests .request div:last-of-type img:last-of-type");
            let acceptAndDeny = function(userId, confirm) {
                fetch(`${domain}/admin/verfy-doctors`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminMainData.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "userId": userId,
                        "confirm": confirm
                    })
                })
                .then(response => response.json())
                .then(data => {
                    for (i = 0; i < allRequestsSnippers.length; i++) {
                        allRequestsSnippers[i].style.display = "none";
                    }
                    swal(data["message"])
                    .then(() => {
                        location.reload();
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
            for (i = 0; i < data["data"].length; i++) {
                allAcceptButtons[i].onclick = function() {
                    let index = Array.prototype.indexOf.call(allAcceptButtons, this);
                    allRequestsSnippers[index].style.display = "block";
                    acceptAndDeny(data["data"][index]["_id"], true);
                }
                allDenyButtons[i].onclick = function() {
                    let index = Array.prototype.indexOf.call(allDenyButtons, this);
                    allRequestsSnippers[index].style.display = "block";
                    acceptAndDeny(data["data"][index]["_id"], false);
                }
            }
        }  
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
renderRequests();
let ourDoctors = document.createElement("div");
ourDoctors.classList.add("our-doctors");
let getDoctorsHasComplaints = function() {
    fetch(`${domain}/admin/complaints/allDoctors`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminMainData.token}`,
        }
    })
    .then(response => response.json())
    .then(doctorsHaveComplaints => {
        for (a = 0; a < doctorsHaveComplaints.length; a++) {
            fetch(`${domain}/admin/complaints/${doctorsHaveComplaints[a]._id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminMainData.token}`,
                },
            })
            .then(response => response.json())
            .then(data => {
                for (b = 0; b < data.complaints.length; b++) {
                    let doctorCompsDiv = document.querySelector(".parent .content .comp .doctor-comps");
                    let doctorCompDiv = document.createElement("div");
                    doctorCompDiv.classList.add("doctor-comp");
                    doctorCompDiv.innerHTML = (`
                        <div>
                            <img src="../images/user.png">
                            <span>${data.complaints[b].user != null ? data.complaints[b].user.userName : "Revomed Account"} &nbsp;> &nbsp;Dr. ${data.userName}</span>
                        </div>
                        <div>${data.complaints[b].details}</div>
                    `);
                    doctorCompsDiv.appendChild(doctorCompDiv);
                }
            })
            .catch(error => {
                console.error(error);
            });
        }
    })
    .catch(error => {
        console.error(error);
    });
}
async function renderSiteComplaints() {
    try {
        const response = await axios.get(`${domain}/allContactus/con`);
        let siteCompsDiv = document.querySelector(".parent .content .comp .site-comps");
        for (i = 0; i < response.data.length; i++) {
            let siteCompDiv = document.createElement("div");
            siteCompDiv.classList.add("site-comp");
            siteCompDiv.innerHTML = (`
                <div class="top">
                    <img src="../images/user.png">
                    <div>
                        <span>${response.data[i].userName}</span>
                        <span>${response.data[i].email}</span>
                    </div>
                </div>
                <div class="details">${response.data[i].details}</div>
            `);
            siteCompsDiv.appendChild(siteCompDiv);
        }
    } 
    catch (error) {
        console.error(error);
    }
}
fetch(`${domain}/admin/accepted-doctors`, {
    method: 'GET'
})
.then(response => response.json())
.then(finalResponse => {
    ourDoctors.innerHTML = (`
        <div class="main">
            <h2>Doctor’s list<span>${finalResponse.data.length !== 0 ? finalResponse.data.length + ' Doctor' : ''}</span></h2>
            <div class="attrs">
                <span>Name</span>
                <span>E-mail</span>
                <span>Specialization</span>
                <span>Age</span>
                <span>Rating</span>
            </div>
            <div class="doctors"></div>
        </div>
        <div class="alter"></div>
    `);
    let content = document.querySelector(".parent .content");
    content.appendChild(ourDoctors);
    for (i = 0; i < finalResponse.data.length; i++) {
        let doctor = document.createElement("div");
        doctor.classList.add("doctor");
        doctor.innerHTML = (`
            <div>
                <img src="${finalResponse.data[i].photo}">${finalResponse.data[i].userName}
            </div>
            <span>${finalResponse.data[i].email}</span>
            <span>${finalResponse.data[i].specialty ? finalResponse.data[i].specialty : "Cardiology (Heart)"}</span>
            <span>${!isNaN(finalResponse.data[i].birthDate) ? finalResponse.data[i].birthDate : "Not set!"}</span>
            <div>
                ${finalResponse.data[i].raiting ? `<img src="./images/rate5.png">${finalResponse.data[i].raiting.toFixed(1)} / 5` : "Not Yet!"}
            </div>
            <div class="spinner"></div>
        `);
        document.querySelector(".parent .content .our-doctors .main .doctors").appendChild(doctor);
    }
    let getDoctorProfile = function() {
        let doctorsDivs = document.querySelectorAll(".parent .content .our-doctors .doctors .doctor");
        let doctorsSpinners = document.querySelectorAll(".parent .content .our-doctors .doctors .doctor .spinner");
        let main = document.querySelector(".parent .content .our-doctors .main");
        let alter = document.querySelector(".parent .content .our-doctors .alter");
        for (i = 0; i < finalResponse.data.length; i++) {
            doctorsDivs[i].onclick = function() {
                let index = Array.prototype.indexOf.call(doctorsDivs, this);
                doctorsSpinners[index].style.display = "block";
                fetch(`${domain}/doctor/account/profile/${finalResponse.data[index]._id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${adminMainData.token}`
                    }
                })
                .then(response => response.json())
                .then(doctorFullData => {
                    alter.innerHTML = (`
                        <img src="./images/back3.png" class="back">
                        <div class="doc-card">
                            <div class="left">
                                <div class="head">
                                    <img src=${finalResponse.data[index].photo}>
                                    <div>
                                        <h3>${finalResponse.data[index].userName}</h3>
                                        <span>${finalResponse.data[index].specialty ? finalResponse.data[index].specialty : "Cardiology (Heart)"}</span>
                                    </div>
                                </div>
                                <div class="body">
                                    <div>
                                        <span>About Me:</span>
                                        <span>Experience:</span>
                                        <span>Ratings:</span>
                                    </div>
                                    <div>
                                        <p>${doctorFullData.aboutme ? doctorFullData.aboutme : "Hasn't Been Set Yet!"}</p>
                                        <span>${Math.floor(Math.random() * 8) + 3} Year</span>
                                        <span>${doctorFullData.raiting ? doctorFullData.raiting.toFixed(1) + " / 5" : "Not Yet!"}</span>
                                    </div>
                                </div>
                            </div>
                            <button>Block</button>
                            <div class="spinner"></div>
                        </div>
                        <h5>Complaints</h5>
                        <div class="complaints"></div>
                    `);
                    let getDoctorComplaints = function() {
                        fetch(`${domain}/admin/complaints/${finalResponse.data[index]._id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${adminMainData.token}`,
                            },
                        })
                        .then(response => response.json())
                        .then(data => {
                            let complaintsInDoc = document.querySelector(".parent .content .our-doctors .alter .complaints");
                            if (data.complaints.length == 0) {
                                let noCompP = document.createElement("p");
                                noCompP.innerHTML = ("New complaints on this doctor will be shown here.");
                                noCompP.style.cssText = "margin-top: 8px; margin-left: 15px; color: var(--alter-color2); font-size: 33px;;";
                                complaintsInDoc.appendChild(noCompP);
                            }
                            else {
                                for (j = 0; j < data.complaints.length; j++) {
                                    let complaint = document.createElement("div");
                                    complaint.classList.add("complaint");
                                    complaint.innerHTML = (`
                                        <div>
                                            <img src="../images/user.png">
                                            <span>${data.complaints[j].user != null ? data.complaints[j].user.userName : "Removed Account"}</span>
                                        </div>
                                        <div>${data.complaints[j].details}</div>
                                    `);
                                    complaintsInDoc.appendChild(complaint);
                                }
                            }
                            main.style.display = "none";
                            doctorsSpinners[index].style.display = "none";
                            alter.style.display = "block";
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    }
                    getDoctorComplaints();
                    document.querySelector(".parent .content .our-doctors .alter .back").onclick = () => {
                        alter.style.display = "none";
                        main.style.display = "block";
                    }
                    let blockDoctorSpinner = document.querySelector(".parent .content .our-doctors .alter .doc-card .spinner");
                    let blockDoctor = function() {
                        document.querySelector(".parent .content .our-doctors .alter .doc-card button").onclick = function() {
                            blockDoctorSpinner.style.display = "block";
                            fetch(`${domain}/admin//deleteDoctor/${finalResponse.data[index]._id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${adminMainData.token}`,
                                },
                            })
                            .then(response => response.json())
                            .then(data => {
                                blockDoctorSpinner.style.display = "none";
                                swal(data.message)
                                .then(() => {
                                    location.reload();
                                })
                            }) 
                            .catch(error => {
                                console.error(error);
                            });
                        }
                    }
                    blockDoctor();
                })
                .catch(error => {
                    console.error(error);
                });
            }
        }
    }
    getDoctorProfile();
    let comp = document.createElement("div");
    comp.classList.add("comp");
    comp.innerHTML = (`
        <h2>Complaints</h2>
        <div class="head">
            <div class="active">Doctor Complaints</div>
            <div>Site Complaints</div>
        </div>
        <div class="doctor-comps handle-comps"></div>
        <div class="site-comps handle-comps"</div>
    `);
    content.appendChild(comp);
    let headButtons = document.querySelectorAll(".parent .content .comp .head div");
    let handleComps = document.querySelectorAll(".parent .content .comp .handle-comps");
    for (i = 0; i < 2; i++) {
        headButtons[i].onclick = function() {
            let index = Array.prototype.indexOf.call(headButtons, this);
            if (index == 0) {
                headButtons[1].classList.remove("active");
                handleComps[1].style.display = "none";
                headButtons[0].classList.add("active");
                handleComps[0].style.display = "block";
            }
            else {
                headButtons[0].classList.remove("active");
                handleComps[0].style.display = "none";
                headButtons[1].classList.add("active");
                handleComps[1].style.display = "block";
            }
        }
    }
    getDoctorsHasComplaints();
    renderSiteComplaints();
    let lis = document.querySelectorAll(".parent .content nav ul li");
    let pages = [dash, ourDoctors, comp];
    for (i = 0; i < 3; i++) {
        lis[i].onclick = function() {
            for (j = 0; j < 3; j++) {
                lis[j].classList.remove("active");
                pages[j].style.display = "none";
            }
            this.classList.add("active");
            pages[Array.prototype.indexOf.call(lis, this)].style.display = "block";
            window.scrollTo(0, 0);
        }
    }
    lis[3].onclick = function() {
        localStorage.clear();
        location.href = "4y9LsG7nQ8I2D3a5F6P0dX1vZwTjRiBtCkMlN2oHqWmEuKxYz.html"
    }
})
.catch(error => {
    console.error('Error:', error);
});