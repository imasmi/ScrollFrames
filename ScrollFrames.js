class ScrollFrames {
    constructor (item, frames = {}) {
        this.item = typeof item == "string" ? document.querySelector(item) : item;
        if (item === window) {
            this.frames = frames;
            if(!this.frames.duration){ this.frames.duration = 1200;}
            if(!this.frames.ease){ this.frames.ease = t => Math.min(1, 1.001 - Math.pow(2, -10 * t));}
            if(!this.frames.multiply){ this.frames.multiply = 1;}
            this.scrollOffset = 0;
            this.scrollTimeout;

            window.addEventListener("wheel", e => {
                e.preventDefault();
                let scrollLeft = e.deltaY > 0 ? document.body.scrollHeight - window.scrollY : -window.scrollY; 
                this.scrollOffset += e.deltaY * this.frames.multiply;
                if (Math.abs(scrollLeft) < Math.abs(this.scrollOffset)) {this.scrollOffset = scrollLeft;}
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => this.scrollOffset = 0, 100);
                this.scrollToBottom(this.scrollOffset);
            }, { passive:false });
        } else {
            if (!this.item.classList.contains("ScrollFrames")) {this.item.classList.add("ScrollFrames")}
            this.index = 0;
            this.frames = this.framesToObject(frames);
            this.framesKeys = Object.keys(this.frames);
            this.totalFrames = this.framesKeys.length - 1;
    
            this.setFramePosition();
            window.addEventListener("scroll", () => this.setFramePosition());
            window.addEventListener("resize", () => {
                    new Promise((myResolve, myReject) => {
                        document.querySelectorAll(".ScrollFrames").forEach(el => el.removeAttribute("style"));
                        myResolve();
                        myReject();
                    }).then(
                    (value) => { this.setFramePosition(); },
                    (error) => { alert("An unexpected error occured. Please reload the page."); }
                    );
            });
        }
    }
    
    framesToObject (frames) {
        let object = {};
        for (let frame in frames) {
            object[frame] = this.stylesToObject(frames[frame]);
        }
        return object;
    }

    stylesToObject(style) {
        let object = {}
        let values = style.split(";");
        values.filter(x => x != "");
        for (let el of values) {
            let pair = el.split(":");
            if (pair.length == 2) {
                object[pair[0].trim()] = pair[1].trim();
            }
        };
        return object;
    }

    percentsCompleted () {
        let bottom = this.scrollPosition();
        if (bottom < this.framesKeys[this.index - 1]) {
            return 0;
        } else if (bottom > this.framesKeys[this.index]) {
            return 100;
        } else {
            return Number(((bottom - this.framesKeys[this.index - 1]) / (this.framesKeys[this.index] - this.framesKeys[this.index - 1])) * 100);
        }
    }

    updateIndex () {
        let bottom = this.scrollPosition();
        for (let i = 0; i <= this.totalFrames; i++) {
            if (bottom <= this.framesKeys[0]) {
                this.index = 0;
                break;
            } else if (bottom > this.framesKeys[i-1] && bottom <= this.framesKeys[i]){
                this.index = i;
                break;
            } else {
                this.index = this.totalFrames + 1;
            }
        }
    }

    scrollPosition () {
        return window.scrollY + window.innerHeight;
    }

    setFramePosition(){
        this.updateIndex();

        if (this.index == 0 || this.index > this.totalFrames) {
            let obj = this.frames[this.framesKeys[this.index == 0 ? 0 : this.totalFrames]];
            for (let key in obj) {
                this.item.style[key] = obj[key];
            }
        } else {
            let currentStart = this.frames[this.framesKeys[this.index - 1]];
            let currentEnd = this.frames[this.framesKeys[this.index]];
            for (let key in currentStart) {
                let pattern = /(-?\d\.\d)|-?\d+/g;
                let isDynamic = key in currentEnd && pattern.test(currentStart[key]);
                
                if (isDynamic) {
                    let endMatch = currentEnd[key].match(pattern);
                    let cnt = 0;
                    let currentValue = currentStart[key].replace(pattern, (match) => {
                        let current = Number(match) + ((((endMatch[cnt] - match) * this.percentsCompleted()) / 100));
                        cnt++;
                        return current.toFixed(2);
                    });
                    this.item.style[key] = currentValue;
                } else {
                    this.item.style[key] = currentStart[key];
                }
            }
        }
    }

    scrollToBottom(scrollOffset) {
        // Get the current scroll position
        const startScroll = window.scrollY;
    
        // Define the target scroll position (bottom of the page)
        const targetScroll = startScroll + scrollOffset;
        
        // Set the duration of the scroll animation in milliseconds
        const duration = this.frames.duration; // 1 second
    
        // Define the easing function (ease-out)
        const easeOutQuad = this.frames.ease;
        // Create a timestamp for the start of the animation
        const startTime = performance.now();
    
        // Define the scroll animation function
        function animateScroll() {
          // Calculate the elapsed time since the start of the animation
          const elapsedTime = performance.now() - startTime;
    
          // Calculate the progress of the animation (between 0 and 1)
          const progress = Math.min(elapsedTime / duration, 1);
    
          // Apply the ease-out function to the progress
          const easedProgress = easeOutQuad(progress);
    
          // Calculate the new scroll position based on the eased progress
          const newScroll = startScroll + (targetScroll - startScroll) * easedProgress;

          // Set the new scroll position
          window.scrollTo(0, newScroll);
    
          // Continue the animation if it's not finished
          if (progress < 1) {
            window.requestAnimationFrame(animateScroll);
          }
        }

        // Start the scroll animation
        window.requestAnimationFrame(animateScroll);
    }
}
