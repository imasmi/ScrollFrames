class ScrollFrames {
    constructor (item, frames) {
        this.item = typeof item == "string" ? document.querySelector(item) : item;
        if (!this.item.classList.contains("ScrollFrames")) {this.item.classList.add("ScrollFrames")}
        this.index = 0;
        this.frames = this.framesToObject(frames);
        this.framesKeys = Object.keys(this.frames);
        this.totalFrames = this.framesKeys.length - 1;

        this.setFramePosition();
        window.addEventListener("scroll", () => this.setFramePosition());
        window.addEventListener("resize", () => {
            document.querySelectorAll(".ScrollFrames").forEach(el => el.removeAttribute("style"));
            this.setFramePosition()
        });
    }
    
    framesToObject (frames) {
        let object = {};
        for (let frame in frames) {
            console.log(frame);
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
            if (bottom < this.framesKeys[0]) {
                this.index = 0;
                break;
            } else if (bottom > this.framesKeys[i-1] && bottom < this.framesKeys[i]){
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
                let pattern = /(\d\.\d)|\d+/g;
                let isDynamic = key in currentEnd && pattern.test(currentStart[key]);
                
                if (isDynamic) {
                    let endMatch = currentEnd[key].match(pattern);
                    let cnt = 0;
                    let currentValue = currentStart[key].replace(pattern, (match) => {
                        let current = Number(match) + ((((endMatch[cnt] - match) * this.percentsCompleted()) / 100));
                        cnt++;
                        return current.toFixed(2);
                    });
                    console.log(currentValue);
                    this.item.style[key] = currentValue;
                } else {
                    this.item.style[key] = currentStart[key];
                }
            }
        }
    }
}
