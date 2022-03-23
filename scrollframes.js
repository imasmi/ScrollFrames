class Scroll {
    constructor (item) {
        this.item = typeof item == "string" ? document.querySelector(item) : item;
        if (!this.item.classList.contains("scroll-attached")) {this.item.classList.add("scroll-attached")}
        this.units = ["%", "px", "vh", "vw"];
        this.cssMetricUnits = ["opacity"]; 
        this.current = 0;
        this.objects = [];
        this.totalObjects = 0;
        this.from = [];
        this.to = [];
        this.fromValues = [];
        this.toValues = [];
        this.valuesUnits = [];
        this.startMetrics = [];
        
        window.addEventListener("scroll", this.scroll.bind(this));
        window.addEventListener("resize", this.reset.bind(this));
    }
    
    set (obj) {
        this.totalObjects++;
        this.current = this.objects.push(obj) - 1;
        this.from.push(this.stylesToObject(obj.from));
        this.to.push(this.stylesToObject(obj.to));
        
        //Set objects for values and units to be recalculated 
        //for position change (this.fromValues, this.fromUnits, this.toValues, this.toUnits)
        //and start static metrics to
        //be set once at the start of class instance (startMetrics)
        this.getMetrics();
        this.scroll();
        return this;
    }
    
    reset () {
        let objects = JSON.parse(JSON.stringify(this.objects));
        this.objects = [];
        this.totalObjects = 0;
        for ( let object of objects){
            this.set(object);
        }
    }
    
    getMetrics() {
        this.fromValues[this.current] = {};
        this.toValues[this.current] = {};
        this.valuesUnits[this.current] = {};
        this.startMetrics[this.current] = {};
        
        for (let key in this.from[this.current]) {
            let isMetricSet = false;
            
            if (this.to[this.current][key]) {
                for (let unit of this.units) {
                    if (this.from[this.current][key].includes(unit)) {
                        this.fromValues[this.current][key] = Number(this.from[this.current][key].replace(unit, ''));
                        this.toValues[this.current][key] = Number(this.to[this.current][key].replace(unit, ''));
                        this.valuesUnits[this.current][key] = unit;
                        isMetricSet = true;
                    }
                }
                
                if (this.cssMetricUnits.indexOf(key) !== -1) {
                    this.fromValues[this.current][key] = Number(this.from[this.current][key]);
                    this.toValues[this.current][key] = Number(this.to[this.current][key]);
                    this.valuesUnits[this.current][key] = "";
                    isMetricSet = true;
                }
            }
            if (!isMetricSet) { this.startMetrics[this.current][key] = this.from[this.current][key]; }
        }
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
    
    percentsCompleted (i) {
        let bottom = window.scrollY + window.innerHeight;
        if (bottom < this.objects[i].start) {
            return 0;
        } else if (bottom > this.objects[i].end) {
            return 100;
        } else {
            return Number(((bottom - this.objects[i].start) / (this.objects[i].end - this.objects[i].start)) * 100);
        }
    }
    
    styleCurrentValue(key, i){
        let from = this.fromValues[i][key];
        let to = this.toValues[i][key];
        let current = ((to - from) * this.percentsCompleted(i)) / 100;
        return `${(from += current).toFixed(1)}${this.valuesUnits[i][key]}`;
    }
    
    scroll(){
        if  (this.percentsCompleted(0) == 0 || this.percentsCompleted(this.totalObjects - 1) == 100) {
            for (let key in this.from[0] ) {
                if (this.percentsCompleted(this.totalObjects - 1) == 100) {
                    if (!this.to[this.totalObjects - 1][key]) {this.item.style.removeProperty(key);}
                } else {
                    this.item.style.removeProperty(key);
                }
            }
        }
        
        for (let i = 0; i < this.totalObjects; i++ ) {
            if (this.percentsCompleted(i) !== 0 && this.percentsCompleted(this.totalObjects - 1) != 100) {
                this.item.style.removeProperty('transform');
                for (let key in this.from[i] ) {
                    if (key in this.fromValues[i]) { 
                        this.item.style[key] = this.styleCurrentValue(key, i);
                    } else {
                        if (!this.item.style[key]) {this.item.style[key] = this.startMetrics[i][key];}
                    }
                }
            }
        }
        
        if (this.percentsCompleted(this.totalObjects - 1) == 100) {
            for (let key in this.to[this.totalObjects - 1] ) {
                if (!this.item.style[key]) {this.item.style[key] = this.to[this.totalObjects - 1][key];}
            }
        }
    }
}

window.addEventListener("resize", () => {
    document.querySelectorAll(".scroll-attached").forEach(el => el.removeAttribute("style"));
});