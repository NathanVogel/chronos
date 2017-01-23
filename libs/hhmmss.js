/*
 * HHMMSS - An editable clock for time-based parametric projects
 *
 * Author:
 *    Romain Cazier
 *    romaincazier.com
 *    @romaincazier
 *
 * Project page:
 *    http://github.com/romaincazier/HHMMSS
 *
 */
function HHMMSS(options) {
    var type        = options.type            != undefined ? options.type : "horizontal",
    horizontalAlign = options.horizontalAlign != undefined ? options.horizontalAlign : "hcenter",
    verticalAlign   = options.verticalAlign   != undefined ? options.verticalAlign : "vcenter",
    size            = options.size            != undefined ? options.size : "medium",
    invert          = options.invert          != undefined ? options.invert : true,
    sleepTime       = options.sleepTime       != undefined ? options.sleepTime : 1000;

    var hhmmss = document.createElement('div');
    hhmmss.id = "hhmmss";
    if(invert) hhmmss.classList.add('invert');

    var clock = document.createElement('div');
    clock.id = "clock";
    clock.className = type + " " + horizontalAlign + " " + verticalAlign + " " + size;

    var hhmmss_h = document.createElement('div'),
        hhmmss_m = document.createElement('div'),
        hhmmss_s = document.createElement('div');

    clock.appendChild(hhmmss_h);
    clock.appendChild(document.createElement('span'));
    clock.appendChild(hhmmss_m);
    clock.appendChild(document.createElement('span'));
    clock.appendChild(hhmmss_s);

    hhmmss.appendChild(clock);

    document.body.appendChild(hhmmss);

    var date = new Date(),
        h    = date.getHours(),
        m    = date.getMinutes(),
        s    = date.getSeconds(),
        mill = date.getMilliseconds();

    hhmmss_h.innerHTML = h < 10 ? "0" + h : h;
    hhmmss_m.innerHTML = m < 10 ? "0" + m : m;
    hhmmss_s.innerHTML = s < 10 ? "0" + s : s;

    function updateTime() {
        var tempMill = (new Date()).getMilliseconds();

        if(!s_active && !m_active && !h_active && mill > tempMill) {
            s++;
            if (s >= 60) {
                s = 0;
                m++;
                if (m >= 60) {
                    m = 0;
                    h++;
                    if (h >= 24) {
                        h = 0;
                    }
                }
            }
        }

        mill = tempMill;

        updateDisplayedTime();
    }

    function updateDisplayedTime() {
        if(!h_waitingForInput) hhmmss_h.innerHTML = h < 10 ? "0" + h : h;
        if(!m_waitingForInput) hhmmss_m.innerHTML = m < 10 ? "0" + m : m;
        if(!s_waitingForInput) hhmmss_s.innerHTML = s < 10 ? "0" + s : s;
    }

    setTimeout(function() {
        setInterval(updateTime, 1000);
    }, 1000 - mill);

    this.getS = function() {
        return s;
    }

    this.getM = function() {
        return m;
    }

    this.getH = function() {
        return h;
    }

    this.getMillis = function() {
        var d = new Date();
        if(Math.abs(mill - d.getMilliseconds()) < 100) {
            mill = d.getMilliseconds();
        }
        return mill;
    }

    var doubleClick = false,
    doubleClickTimeout;
    hhmmss.addEventListener('click', function(e) {
        if(!doubleClick) {
            doubleClick = true;
            clearTimeout(doubleClickTimeout);
            doubleClickTimeout = setTimeout(function() {
                doubleClick = false;
            }, 300);
            if(e.target != hhmmss_h && e.target != hhmmss_m && e.target != hhmmss_s && input != null) {
                if(input.innerHTML != "") {
                    if(s_waitingForInput) {
                        s = parseInt(input.innerHTML);
                    } else if(m_waitingForInput) {
                        m = parseInt(input.innerHTML);
                    } else if(h_waitingForInput) {
                        h = parseInt(input.innerHTML);
                    }
                }

                s_waitingForInput = false;
                hhmmss_s.classList.remove('waiting');
                m_waitingForInput = false;
                hhmmss_m.classList.remove('waiting');
                h_waitingForInput = false;
                hhmmss_h.classList.remove('waiting');

                input = null;
                updateDisplayedTime();

                inactiveTimeout = setTimeout(function() {
                    hhmmss.classList.remove('active');
                }, sleepTime);
            }
        } else {
            date = new Date();
            h    = date.getHours();
            m    = date.getMinutes();
            s    = date.getSeconds();
            mill = date.getMilliseconds();

            updateDisplayedTime();

            doubleClick = false;
        }
    }, false);

    var s_active = false,
        m_active = false,
        h_active = false,
        prevX;

    var s_Click,
        m_Click,
        h_Click,
        clickTimeout,
        s_waitingForInput = false,
        m_waitingForInput = false,
        h_waitingForInput = false,
        input = null;

    hhmmss_s.addEventListener("mousedown", function() {
        s_active = true;
        s_Click = true;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(function() { s_Click = false; }, 150);
        hhmmss_s.classList.add('active');
    }, false);

    hhmmss_m.addEventListener("mousedown", function() {
        m_active = true;
        m_Click = true;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(function() { m_Click = false; }, 150);
        hhmmss_m.classList.add('active');
    }, false);

    hhmmss_h.addEventListener("mousedown", function() {
        h_active = true;
        h_Click = true;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(function() { h_Click = false; }, 150);
        hhmmss_h.classList.add('active');
    }, false);

    hhmmss_s.addEventListener("click", function() {
        if(s_Click) {
            hhmmss.classList.add('active');
            clearTimeout(clickTimeout);
            if(m_waitingForInput) {
                if(input.innerHTML != "") {
                    m = parseInt(input.innerHTML);
                }
                m_waitingForInput = false;
                hhmmss_m.classList.remove('waiting');
            }
            if(h_waitingForInput) {
                if(input.innerHTML != "") {
                    h = parseInt(input.innerHTML);
                }
                h_waitingForInput = false;
                hhmmss_h.classList.remove('waiting');
            }
            input = hhmmss_s;
            s_waitingForInput = true;
            hhmmss_s.innerHTML = "";
            hhmmss_s.classList.add('waiting');
            updateDisplayedTime();
            clearTimeout(inactiveTimeout);
        }
    }, false);

    hhmmss_m.addEventListener("click", function() {
        if(m_Click) {
            hhmmss.classList.add('active');
            clearTimeout(clickTimeout);
            if(s_waitingForInput) {
                if(input.innerHTML != "") {
                    s = parseInt(input.innerHTML);
                }
                s_waitingForInput = false;
                hhmmss_s.classList.remove('waiting');
            }
            if(h_waitingForInput) {
                if(input.innerHTML != "") {
                    h = parseInt(input.innerHTML);
                }
                h_waitingForInput = false;
                hhmmss_h.classList.remove('waiting');
            }
            input = hhmmss_m;
            m_waitingForInput = true;
            hhmmss_m.innerHTML = "";
            hhmmss_m.classList.add('waiting');
            updateDisplayedTime();
            clearTimeout(inactiveTimeout);
        }
    }, false);

    hhmmss_h.addEventListener("click", function(e) {
        if(h_Click) {
            hhmmss.classList.add('active');
            clearTimeout(clickTimeout);
            if(s_waitingForInput) {
                if(input.innerHTML != "") {
                    s = parseInt(input.innerHTML);
                }
                s_waitingForInput = false;
                hhmmss_s.classList.remove('waiting');
            }
            if(m_waitingForInput) {
                if(input.innerHTML != "") {
                    m = parseInt(input.innerHTML);
                }
                m_waitingForInput = false;
                hhmmss_m.classList.remove('waiting');
            }
            input = hhmmss_h;
            h_waitingForInput = true;
            hhmmss_h.innerHTML = "";
            hhmmss_h.classList.add('waiting');
            updateDisplayedTime();
            clearTimeout(inactiveTimeout);
        }
    }, false);

    var inactiveTimeout;

    hhmmss.addEventListener("mousemove", function(e) {
        if(!s_waitingForInput && !m_waitingForInput && !h_waitingForInput) {
            hhmmss.classList.add('active');
            clearTimeout(inactiveTimeout);
            inactiveTimeout = setTimeout(function() {
                hhmmss.classList.remove('active');
            }, sleepTime);

            if(s_active || m_active || h_active) {
                var delta = e.pageX - prevX;
                prevX = e.pageX;
            }

            if(s_active) {
                if(delta > 0) {
                    s++;
                    if (s >= 60) {
                        s = 0;
                        m++;
                        if (m >= 60) {
                            m = 0;
                            h++;
                            if (h >= 24) {
                                h = 0;
                            }
                        }
                    }
                } else if(delta < 0) {
                    s--;
                    if (s <= -1) {
                        s = 59;
                        m--;
                        if (m <= -1) {
                            m = 59;
                            h--;
                            if (h <= -1) {
                                h = 0;
                            }
                        }
                    }
                }
                updateDisplayedTime();
            } else if(m_active) {
                if(delta > 0) {
                    m++;
                    if (m >= 60) {
                        m = 0;
                        h++;
                        if (h >= 24) {
                            h = 0;
                        }
                    }
                } else if(delta < 0) {
                    m--;
                    if (m <= -1) {
                        m = 59;
                        h--;
                        if (h <= -1) {
                            h = 0;
                        }
                    }
                }
                updateDisplayedTime();
            } else if(h_active) {
                if(delta > 0) {
                    h++;
                    if (h >= 24) {
                        h = 0;
                    }
                } else if(delta < 0) {
                    h--;
                    if (h <= -1) {
                        h = 23;
                    }
                }
                updateDisplayedTime();
            }
        }
    }, false);

    hhmmss.addEventListener("mouseup", function() {
        hhmmss_s.classList.remove('active');
        hhmmss_m.classList.remove('active');
        hhmmss_h.classList.remove('active');
        s_active = false;
        m_active = false;
        h_active = false;
    }, false);

    window.addEventListener("keyup", function(e) {
        if(e.keyCode == 13 && input != null) {
            if(input.innerHTML != "") {
                if(s_waitingForInput) {
                    s = parseInt(input.innerHTML);
                } else if(m_waitingForInput) {
                    m = parseInt(input.innerHTML);
                } else if(h_waitingForInput) {
                    h = parseInt(input.innerHTML);
                }
            }

            s_waitingForInput = false;
            hhmmss_s.classList.remove('waiting');
            m_waitingForInput = false;
            hhmmss_m.classList.remove('waiting');
            h_waitingForInput = false;
            hhmmss_h.classList.remove('waiting');

            input = null;
            updateDisplayedTime();

            inactiveTimeout = setTimeout(function() {
                hhmmss.classList.remove('active');
            }, sleepTime);
        } else if(e.keyCode >= 48 && e.keyCode <= 57) {
            if(input.innerHTML.length < 2) {
                if(parseInt(input.innerHTML + String.fromCharCode(e.keyCode)) < (h_waitingForInput ? 24 : 60))
                input.innerHTML += String.fromCharCode(e.keyCode);
            }
        } else if(e.keyCode == 8) {
            if(input.innerHTML > 0) {
                input.innerHTML = input.innerHTML.substr(0, input.innerHTML.length - 1);
            }
        }
    }, false);

    document.addEventListener("visibilitychange", function() {
        if(document.visibilityState == "visible") {
            date = new Date();
            h    = date.getHours();
            m    = date.getMinutes();
            s    = date.getSeconds();
            mill = date.getMilliseconds();

            updateDisplayedTime();
        }
    });
}
