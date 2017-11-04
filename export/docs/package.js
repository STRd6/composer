(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2014 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
      "mode": "100644",
      "type": "blob"
    },
    "NOTES.md": {
      "path": "NOTES.md",
      "content": "Data Types\n==========\n\nA note is a number. `C4` is `0`, `C#4` is `1`, `B3` is `-1`, etc.\n\nA phrase is a collection of (note, beat, instrument) tuples.\n\nScale is a collection of notes modulo 12.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "Paint Composer\n==============\n\nCreate music online with this simple Mario Paint inspired music composer.\n",
      "mode": "100644",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "content": "TODO\n====\n\nPadding for first beat, currently crammed up on the left edge\n\nFull Undo/Redo\n\nImprove performance on large patterns\n\n\n\nBugs\n----\n\nTo Later\n========\n\nSpecify additional resources to add to the cache manifest.\n",
      "mode": "100644",
      "type": "blob"
    },
    "arranger_view.coffee.md": {
      "path": "arranger_view.coffee.md",
      "content": "Arranger View\n=============\n\n    {LIGHT, DARK, CURSOR} = require \"./colors\"\n\n    patternCount = 10\n    patternColors = [\n      200\n      0\n      180\n      -90\n      130\n      -50\n      60\n      0\n      -60\n      40\n    ].map (h, i) ->\n      if i is 6\n        s = \"0%\"\n      else\n        s = \"87%\"\n\n      if i is 8\n        v = \"100%\"\n      else\n        v = \"50%\"\n      \"hsl(#{h}, #{s}, #{v})\"\n\n    require \"cornerstone\"\n\n    unitX = 20\n    unitY = 20\n\n    module.exports = (I={}, self=Model(I))->\n      Canvas = require \"touch-canvas\"\n      canvas = Canvas\n        height: 80\n        width: 128 * unitX\n\n      canvasHelpers canvas\n\n      element = document.createElement \"div\"\n      element.classList.add \"arranger-wrap\"\n\n      element.appendChild canvas.element()\n\n      pos =\n        channel: 0\n        beat: -20\n\n      $(canvas.element()).mousemove (e) ->\n        {left, top} = canvas.element().getBoundingClientRect()\n\n        {pageX:x, pageY:y} = e\n\n        pos.beat = 0|((x - left) / unitX)\n        pos.channel = 0|((y - top) / unitY)\n\n      canvas.on \"touch\", (p) ->\n        beat = Math.floor(p.x * canvas.width() / unitX)\n        channel = Math.floor(p.y * canvas.height() / unitY)\n\n        self.trigger \"arrangerClick\", channel, beat\n\n      drawPosition = (canvas) ->\n        canvas.drawText\n          text: \"#{pos.beat}, #{pos.channel}\"\n          x: 20\n          y: 30\n          color: \"black\"\n\n      drawPattern = (canvas, channel, beat, size, color) ->\n        canvas.drawRect\n          x: beat * unitX\n          y: channel * unitY\n          width: size * unitX\n          height: unitY - 1\n          color: color\n          stroke:\n            width: 1\n            color: DARK\n\n      drawChannel = (canvas, patterns, i) ->\n        patterns.forEach ([start, end, pattern, index]) ->\n          drawPattern(canvas, i, start, pattern.size(), patternColors[index])\n\n        if i is pos.channel and self.activeToolIndex() is 0\n          size = self.patterns()[self.patternToolIndex()].size()\n          # Draw hover\n          canvas.withAlpha 0.25, ->\n            drawPattern(canvas, i, pos.beat, size, patternColors[self.patternToolIndex()])\n\n        # Draw line\n        canvas.drawRect\n          x: 0\n          y: 20 * (i + 1) - 1\n          width: canvas.width()\n          height: 1\n          color: LIGHT\n\n      self.on \"draw\", ->\n        song = self.song()\n\n        canvas.fill(\"white\")\n\n        song.channels().forEach (channel, i) ->\n          patterns = song.channelPatterns(i)\n          drawChannel(canvas, patterns, i)\n\n        if self.patternMode()\n          # TODO\n        else\n          canvas.drawRect\n            x: self.playTime() * unitX\n            y: 0\n            width: 1\n            height: canvas.height()\n            color: CURSOR\n\n      self.extend\n        arrangerElement: ->\n          element\n\nHelpers\n-------\n\n    canvasHelpers = (canvas) ->\n      canvas.withAlpha = (alpha, fn) ->\n        oldAlpha = canvas.globalAlpha()\n        canvas.globalAlpha alpha * oldAlpha\n\n        try\n          fn(canvas)\n        finally\n          canvas.globalAlpha oldAlpha\n\n        return canvas\n",
      "mode": "100644",
      "type": "blob"
    },
    "channel.coffee.md": {
      "path": "channel.coffee.md",
      "content": "Channel\n=======\n\nA channel holds a sequence of patterns. The patterns are stored in the `data`\ntable at beat keys with `patternId` values.\n\n    require \"cornerstone\"\n\n    module.exports = (I={}, self=Model(I)) ->\n      defaults I,\n        data: {}\n\n      patternStarts = (patterns) ->\n        Object.keys(I.data).map (start) ->\n          start = parseInt(start, 10)\n          patternIndex = parseInt(I.data[start], 10)\n          pattern = patterns[patternIndex]\n          end = start + pattern.size()\n\n          [start, end, pattern, patternIndex]\n\n      self.extend\n        patterns: patternStarts\n\n        canSet: (beat, patternIndex, patterns) ->\n          size = patterns[patternIndex].size()\n\n          toInsert = [beat, beat + size]\n\n          # Can't set if there are any overlaps\n          !patternStarts(patterns).some (segment) ->\n            overlap(toInsert, segment)\n\n        patternDataAt: (beat, patterns) ->\n          patternStarts(patterns).filter ([start, end]) ->\n            start <= beat < end\n\n        patternAt: (beat, patterns) ->\n          self.patternDataAt(beat, patterns)\n          .map ([start, end, pattern, patternIndex]) ->\n            patternIndex\n          .first()\n\n        setPattern: (beat, patternIndex) ->\n          I.data[beat] = patternIndex\n\n        removePattern: (beat, patterns) ->\n          patternsAtBeat = patternStarts(patterns).filter ([start, end]) ->\n            start <= beat < end\n\n          patternsAtBeat.forEach ([start]) ->\n            delete I.data[start]\n\n          return patternsAtBeat.length > 0\n\n        upcomingNotes: (t, dt, patterns) ->\n          patternStarts(patterns).filter ([start, end, pattern]) ->\n            (start <= t < end) or # t is within pattern or\n            (t <= start < t + dt) # pattern start is within [t, t + dt)\n          .map ([start, end, pattern]) ->\n            offset = t - start\n\n            pattern.upcomingNotes(offset, dt)\n          .flatten()\n\n        size: (patterns) ->\n          patternStarts(patterns).map ([start, end]) ->\n            end\n          .maximum() ? 0\n\n      return self\n\nHelpers\n-------\n\n    {min, max} = Math\n\n    overlap = ([a1, a2], [b1, b2]) ->\n      max(0, min(a2, b2) - max(a1, b1)) > 0\n",
      "mode": "100644",
      "type": "blob"
    },
    "extensions.coffee": {
      "path": "extensions.coffee",
      "content": "Blob::readAsText = ->\n  file = this\n\n  new Promise (resolve, reject) ->\n    reader = new FileReader\n    reader.onload = ->\n      resolve reader.result\n    reader.onerror = reject\n    reader.readAsText(file)\n\nBlob::readAsJSON = ->\n  @readAsText()\n  .then JSON.parse\n",
      "mode": "100644",
      "type": "blob"
    },
    "note.coffee.md": {
      "path": "note.coffee.md",
      "content": "Note\n====\n\nTranslate a number to a music note name.\n\n    notes = \"C C# D D# E F F# G G# A A# B\".split(\" \")\n\n-1 is B3\n0 is C4\n1 is C#4\n...\n\n    module.exports = (noteNumber) ->\n      noteNumber |= 0\n\n      note = notes.wrap noteNumber\n\n      octave = 4 + (noteNumber / 12)|0\n\n      \"#{note}#{octave}\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "pattern.coffee.md": {
      "path": "pattern.coffee.md",
      "content": "Pattern\n=======\n\nA `Pattern` is a list of [beat, note, instrument] tuples.\n\n`beats` is the length of the pattern.\n\n    require \"cornerstone\"\n\n    module.exports = (I={}, self=Model(I)) ->\n      defaults I,\n        beats: 8\n        notes: []\n\n      I.beats = parseInt(I.beats, 10) or 4 # Force Int\n\n      self.attrObservable \"beats\"\n      self.attrAccessor \"notes\"\n\n      extend self,\n        addNote: (note) ->\n          I.notes.push(note)\n\n        removeNote: ([time, note]) ->\n          matched = I.notes.filter ([t, n]) ->\n            time is t and note is n\n\n          self.notes().remove matched.last()\n\n        size: ->\n          self.beats()\n\n`t` and `dt` are in beats.\n\n        upcomingNotes: (t, dt) ->\n          self.notes().filter ([time]) ->\n            if dt > 0\n              t <= time < t + dt\n            else if dt < 0\n              t + dt < time <= t\n          .map ([time, note, instrument]) ->\n            [time - t, note, instrument]\n",
      "mode": "100644",
      "type": "blob"
    },
    "pattern_tools.coffee.md": {
      "path": "pattern_tools.coffee.md",
      "content": "Pattern Tools\n=============\n\n    require \"cornerstone\"\n\n    tools = [\n      (self, {beat, note}) ->\n        # Add Note to Score\n        instrument = self.activeInstrument()\n\n        self.addNote [beat, note, instrument]\n\n        self.playNote instrument, note\n\n      (self, {beat, note}) ->\n        if self.activePattern().removeNote [beat, note]\n          ;# TODO: Play remove sound\n    ]\n\n    module.exports = (I, self) ->\n      defaults I,\n        activeInstrument: 1\n        activeToolIndex: 0\n\n      self.attrObservable \"activeInstrument\", \"activeToolIndex\"\n\n      self.extend\n        activeTool: ->\n          tools[self.activeToolIndex()]\n\n      self.activeInstrument.observe (instrument) ->\n        self.setCursor()\n\n      self.activeToolIndex.observe ->\n        self.setCursor()\n\n      # Hotkeys\n      self.include require \"hotkeys\"\n\n      self.addHotkey \"space\", \"pause\"\n\n      [1..9].forEach (i) ->\n        self.addHotkey i.toString(), ->\n          self.playNote i - 1\n          self.activeInstrument i - 1\n          self.activeToolIndex(0)\n\n      self.addHotkey \"0\", ->\n        self.playNote 9\n        self.activeInstrument 9\n        self.activeToolIndex(0)\n\n      self.addHotkey \"e\", ->\n        self.activeToolIndex(1)\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "pattern_view.coffee.md": {
      "path": "pattern_view.coffee.md",
      "content": "Pattern View\n============\n\n    {LIGHT, DARK, CURSOR} = require \"./colors\"\n\n    require \"cornerstone\"\n\n    noteName = require \"./note\"\n\n    pageSize = 8\n\n    module.exports = (I={}, self=Model(I)) ->\n      defaults I,\n        gamut: [-12, 18]\n        quantize: 4\n\n      # Beat length of active pattern\n      beats = self.beats = Observable self.activePattern().beats()\n\n      self.activePattern.observe (p) ->\n        beats p.beats()\n      beats.observe (value) ->\n        self.activePattern().beats parseInt(value, 10)\n\n      pageStart = 0\n\n      notes = ->\n        if self.patternMode()\n          self.activePattern().notes()\n        else\n          pageStart = self.playTime() - self.playTime() % pageSize\n          self.upcomingSounds(pageStart, pageSize)\n\n      self.attrObservable \"gamut\", \"quantize\"\n\n      Canvas = require \"touch-canvas\"\n\n      canvas = Canvas()\n\n      $(canvas.element()).mousemove (e) ->\n        {left, top} = canvas.element().getBoundingClientRect()\n\n        {pageX:x, pageY:y} = e\n\n        x = x - left\n        y = y - top\n\n        note = Math.round positionToNote(y)\n        beat = quantize(x / canvas.width() * beats(), self.quantize())\n        $(\".position\").text \"T: #{beat.toFixed(2)}, #{noteName note}\"\n\n      canvas.on \"touch\", (p) ->\n        note = Math.round(positionToNote(p.y * canvas.height()))\n\n        if self.patternMode()\n          beat = quantize(p.x * beats(), self.quantize())\n          data =\n            note: note\n            beat: beat\n        else\n          beat = quantize(p.x * pageSize, self.quantize())\n          # Need to find/select pattern at given position\n          # and insert beat into correct place within the pattern\n          beat += pageStart\n          patternsData = self.song().patternsDataAt(beat)\n\n          patternData = patternsData[self.lastChannelIndex()] or patternsData.compact().first()\n\n          if patternData\n            [patternStart, patternEnd, pattern] = patternData\n\n            self.activePattern pattern\n\n            data =\n              note: note\n              beat: beat - patternStart\n\n        if data\n          self.activeTool()(self, data)\n\n      # TODO: Need to move this out\n      document.body.appendChild canvas.element()\n\n      handleResize =  ->\n        # TODO: Get rid of these hardcoded hacks!\n        canvas.width(window.innerWidth - 40)\n        canvas.height(window.innerHeight - (25 + 94))\n\n      handleResize()\n      window.addEventListener \"resize\", handleResize, false\n\n      drawNote = (canvas, note) ->\n        [time, note, instrument] = note\n\n        {width, height} = img = self.samples.get(instrument).image\n\n        if self.patternMode()\n          size = self.activePattern().size()\n        else\n          size = pageSize\n\n        x = time * (canvas.width()/size) - width/2\n        y = noteToPosition(note) - height/2\n\n        canvas.drawImage img, x|0, y|0\n\n      drawTemporalGuides = (canvas) ->\n        if self.patternMode()\n          n = self.activePattern().size() * self.quantize()\n        else\n          n = pageSize * self.quantize()\n\n        width = canvas.width()/n\n\n        [0..n-1].forEach (i) ->\n          if mod(i, self.quantize()) is 0\n            color = DARK\n          else\n            color = LIGHT\n\n          canvas.drawRect\n            x: width * i\n            y: 0\n            width: 1\n            height: canvas.height()\n            color: color\n\n      noteToPosition = (note) ->\n        [low, high] = self.gamut()\n\n        n = (high - low) + 1\n        mid = (high + low) / 2\n        height = canvas.height()/n\n\n        canvas.height() - (note - mid + n/2) * height\n\n      positionToNote = (position) ->\n        [low, high] = self.gamut()\n\n        n = (high - low) + 1\n        mid = (high + low) / 2\n        height = canvas.height()/n\n\n        note = canvas.height() / height - (position / height + n/2 - mid)\n\n      drawScaleGuides = (canvas) ->\n        [low, high] = self.gamut()\n\n        [low..high].forEach (i, index) ->\n          if inScale(i)\n            color = DARK\n          else\n            color = LIGHT\n\n          canvas.drawRect\n            x: 0\n            y: noteToPosition(i)\n            width: canvas.width()\n            height: 1\n            color: color\n\n      inScale = (i, scale=0) ->\n        i = mod i + scale, 12\n\n        [0, 2, 4, 5, 7, 9, 11].some (n) ->\n          n is i\n\n      render = ->\n        canvas.fill \"white\"\n\n        drawScaleGuides(canvas)\n        drawTemporalGuides(canvas)\n\n        # Draw notes\n        notes().forEach (note) ->\n          drawNote(canvas, note)\n\n        # Draw player cursor\n        if self.patternMode()\n          canvas.drawRect\n            x: self.playTime() * canvas.width() / beats()\n            y: 0\n            width: 1\n            height: canvas.height()\n            color: CURSOR\n        else\n          canvas.drawRect\n            x: (self.playTime() % pageSize) * canvas.width() / pageSize\n            y: 0\n            width: 1\n            height: canvas.height()\n            color: CURSOR\n\n      self.on \"draw\", render\n\n      self.samples.observe ->\n        self.setCursor()\n\n      self.include require \"./pattern_tools\"\n\n      self.extend\n        setCursor: ->\n          if self.activeToolIndex() is 0\n            if sample = self.samples.get(self.activeInstrument())\n              {width, height, src:url} = img = sample.image\n\n              # Kill query string so we don't accidentally cache the crossdomain image as\n              # non-crossdomain\n              # TODO: handle it better, probably need to generate resource URLs from the\n              # raw data of the crossdomain images\n              url = url.replace(/\\?.*/, \"\")\n\n              # Center cursor\n              x = width/2\n              y = height/2\n\n              $(document.body).css\n                cursor: \"url(#{url}) #{x} #{y}, default\"\n          else # Eraser\n            $(document.body).css\n              cursor: \"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==) 8 8, default\"\n\nHelpers\n-------\n\n    mod = (n, k) ->\n      (n % k + k) % k\n\n    quantize = (x, n) ->\n      (((x + 1/(2*n)) * n)|0)/n\n",
      "mode": "100644",
      "type": "blob"
    },
    "persistence.coffee": {
      "path": "persistence.coffee",
      "content": "Gist = require \"./lib/gist\"\n\nmodule.exports = (I={}, self) ->\n  # Autoload from location hash\n  defaults I,\n    unsaved: false\n\n  self.attrAccessor \"unsaved\"\n\n  # NOTE: Track `prompted` so in an iframe it won't trigger twice\n  prompted = false\n  window.addEventListener \"beforeunload\", (e) ->\n    return if prompted\n    prompted = true\n    setTimeout ->\n      prompted = false\n\n    if self.unsaved()\n      e.returnValue = \"Your changes haven't yet been saved. If you leave now you will lose your work.\"\n\n    return e.returnValue\n\n  setTimeout ->\n    if hash = location.hash\n      self.loadGist hash.substr(1)\n  , 0\n\n  # Demo song\n  try\n    localStorage.songs_demo ?= JSON.stringify require \"./data/demo\"\n\n  self.extend\n    saveAs: ->\n      if name = prompt \"Name\"\n        data = self.song().toJSON()\n\n        localStorage[\"songs_#{name}\"] = JSON.stringify data\n\n        self.unsaved false\n\n    loadSong: ->\n      # TODO: Prompt unsaved\n\n      if name = prompt \"Name\", \"demo\"\n        data = JSON.parse localStorage[\"songs_#{name}\"]\n\n        self.fromJSON(data)\n\n    fromJSON: (data) ->\n      self.song().fromJSON(data)\n\n      self.reset()\n\n    publish: ->\n      Gist.save(self.song().toJSON()).then (id) ->\n        location.hash = id\n\n        alert \"Published as #{location}\\nShare this by copying the url!\"\n\n        self.unsaved false\n\n    loadGist: (id) ->\n      Gist.load(id).then (data) ->\n        self.fromJSON(data)\n        location.hash = id\n      , ->\n        alert \"Couldn't load gist with id: #{id}\"\n\n    loadGistPrompt: ->\n      if id = prompt \"Gist id\", location.hash.substr(1) || \"0b4c4656a6eb1d246829\"\n        self.loadGist(id)\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "title: \"Mario Paint Music Composer - danielx.net\"\ndescription: \"\"\"\nThis Mario Paint inspired composer tool is easy and fun. You can create simple and\nbeautiful songs right in your browser and share them with the world!\n\"\"\"\nversion: \"0.1.0\"\npublish:\n  s3:\n    basePath: \"public/danielx.net\"\nremoteDependencies: [\n  \"https://code.jquery.com/jquery-1.11.0.min.js\"\n]\ndependencies:\n  ajax: \"distri/ajax:v0.1.5-pre.0\"\n  analytics: \"distri/google-analytics:v0.1.0\"\n  cornerstone: \"distri/cornerstone:v0.3.0-pre.2\"\n  hotkeys: \"distri/hotkeys:v0.2.0\"\n  \"jquery-utils\": \"distri/jquery-utils:v0.2.0\"\n  observable: \"distri/observable:v0.3.8\"\n  postmaster: \"distri/postmaster:v0.5.1\"\n  \"touch-canvas\": \"distri/touch-canvas:v0.3.1\"\n  ui: \"STRd6/ui:master\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "player.coffee": {
      "path": "player.coffee",
      "content": "require \"cornerstone\"\nrequire \"./extensions\"\n\nAjax = require \"ajax\"\n{Progress, Modal, Style} = UI = require \"ui\"\nPostmaster = require \"postmaster\"\n\nSample = require \"./sample\"\nSong = require \"./song\"\n\nPatternView = require \"./pattern_view\"\n\nstyle = document.createElement \"style\"\nstyle.innerHTML = Style.all\ndocument.head.appendChild style\n\nmodule.exports = (I={}, self=Model(I)) ->\n  defaults I,\n    samples: []\n    patternMode: false\n    lastChannelIndex: 0\n\n  ajax = Ajax()\n\n  self.include Bindable\n\n  self.attrObservable \"samples\"\n\n  self.attrAccessor \"patternMode\", \"lastChannelIndex\"\n\n  song = Song()\n\n  # Loading default sample pack\n  Sample.loadPack(require(\"../samples\"))\n  .then self.samples\n\n  # TODO: Make it a real observable function\n  activePattern = Observable song.patterns()[0]\n\n  self.extend\n    activePattern: activePattern\n    size: ->\n      if self.patternMode()\n        activePattern().size()\n      else\n        song.size()\n\n    addNote: (note) ->\n      self.unsaved true\n      activePattern().notes().push(note)\n\n    # Currently instruments map 1 to 1 with patterns.\n    patternToolIndex: ->\n      self.activeInstrument()\n\n    patterns: song.patterns\n\n    song: ->\n      song\n\n    tempo: song.tempo\n\n    about: ->\n      console.log \"about\"\n      # TODO: Display About page\n\n    exportAudio: ->\n      self.exportSong(self.song())\n      .then console.log\n\n    removeNote: ->\n      activePattern().removeNote arguments...\n\n    upcomingSounds: (current, dt) ->\n      if self.patternMode()\n        activePattern().upcomingNotes(current, dt)\n      else\n        song.upcomingNotes(current, dt)\n\n    loadFromURL: (url) ->\n      progressView = Progress\n        value: 0\n        message: \"Loading...\"\n\n      Modal.show progressView.element,\n        cancellable: false\n\n      ajax.ajax\n        url: url\n        responseType: \"json\"\n      .progress ({lengthComputable, loaded, total}) ->\n        if lengthComputable\n          progressView.value loaded / total\n      .then self.fromJSON\n      .then ->\n        Modal.hide()\n      .catch (e) ->\n        if e.statusText\n          Modal.alert \"An error has occurred: #{e.status} - #{e.statusText}\"\n        else\n          Modal.alert \"An error has occurred: #{e.message}\"\n\n  self.include require \"./player-audio\"\n  self.include require \"./persistence\"\n\n  element = document.body\n\n  self.include PatternView\n  element.appendChild require(\"./tools\")(self)\n\n  self.include require(\"./arranger_view\")\n\n  self.on \"arrangerClick\", (channel, beat) ->\n    if self.activeToolIndex() is 1 # Eraser\n      if song.removePattern channel, beat\n        self.unsaved true\n    else\n      patternIndex = self.activeInstrument()\n\n      if song.canSet(channel, beat, patternIndex)\n        activePattern song.patterns()[patternIndex]\n        song.setPattern channel, beat, patternIndex\n        self.lastChannelIndex channel\n        self.unsaved true\n      else if (patternIndex = song.patternAt(channel, beat))?\n        self.patternMode true unless self.playing()\n        activePattern song.patterns()[patternIndex]\n\n  element.appendChild self.arrangerElement()\n\n  animate ->\n    self.trigger(\"draw\")\n\n  postmaster = Postmaster\n    loadFile: (blob) ->\n      blob.readAsJSON()\n      .then self.fromJSON\n\n    loadFromURL: self.loadFromURL\n\n  postmaster.invokeRemote \"ready\"\n  .catch (e) ->\n    console.warn e.message\n\n  return self\n\nanimate = (fn) ->\n  step = ->\n    try\n      fn()\n    catch e\n      debugger\n      console.error e\n\n    requestAnimationFrame(step)\n\n  step()\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html, body\n  height: 100%\n\nbody\n  font-family: Sans-Serif\n  margin: 0\n  overflow: hidden\n\n  & > canvas\n    position: absolute\n    top: 45px\n    left: 0px\n\ncanvas\n  user-select: none\n\n.actions\n  background-color: white\n  border-bottom: 1px solid rgba(103, 58, 183, 0.5)\n  position: absolute\n  font-size: 14px\n  top: 0\n  left: 0\n  padding: 4px 4px 6px 4px\n  width: 100%\n\n  > button, > label\n    margin-right: 0.5em\n\n  > label\n    border: 1px solid #673ab7\n    border-radius: 4px\n    color: #673ab7\n    padding: 8px\n\n    &:hover\n      background-color: lightyellow\n\n    > input\n      border: none\n      background-color: rgba(103, 58, 183, 0.19)\n      border-left: 1px solid rgba(103, 58, 183, 0.5)\n      border-top: 1px solid rgba(103, 58, 183, 0.5)\n      color: inherit\n      font-size: 1em\n      padding-right: 4px\n      text-align: right\n      width: 30px\n\n      &:focus\n        padding-right: 3px\n        margin-right: 1px\n\n    > h2\n      display: inline\n      font-size: 1em\n      font-weight: normal\n\nbutton\n  background-color: white\n  border 1px solid #673ab7\n  border-radius: 4px\n  color: #673ab7\n  cursor: pointer\n  font-size: inherit\n  line-height: 1em\n  padding: 9px 16px\n\n  &:hover\n    background-color: lightyellow\n\n  &:active\n    background-color: #673ab7\n    color: white\n\n.tools\n  background-color: rgba(103, 58, 183, 0.19)\n  border-left: 1px solid rgba(103, 58, 183, 0.5)\n  width: 40px\n  height: 100%\n  position: absolute\n  right: 0\n  top: 45px\n\n  .tool\n    width: 40px\n    height: 40px\n    background-repeat: no-repeat\n    background-position: 50% 50%\n\n  > .eraser\n    background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\")\n\n.position\n  color: #673ab7\n  pointer-events: none\n  padding: 4px\n  position: absolute\n  right: 0px\n  top: 0px\n\n\n.arranger-wrap\n  border-top: 1px solid rgba(103, 58, 183, 0.5)\n  overflow-x: scroll\n  overflow-y: hidden\n  position: absolute\n  bottom: 0\n  left: 0\n  width: 100%\n  height: 94px\n\n#feedback\n  background-color: rgb(103, 58, 183)\n  border: 2px solid white\n  border-top: 0\n  box-shadow: 1px 2px 5px black\n  color: white\n  font-weight: bold\n  padding: 4px 0.5em\n  position: absolute\n  left: 700px\n  text-decoration: none\n  text-shadow: 1px 1px black\n  top: 0\n  transition-property: padding-top\n  transition-duration: 0.25s\n\n  &:hover\n    padding-top: 1em\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/about.jadelet": {
      "path": "templates/about.jadelet",
      "content": "about\n  h1 About\n  p Created by Daniel X. Moore\n  p TODO: Feedack\n  email\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/loader.coffee": {
      "path": "test/loader.coffee",
      "content": "loader = require \"../lib/audio-loader\"\n\ndescribe \"Loader\", ->\n  it \"should load array buffers\", (done) ->\n    loader(\"https://addressable.s3.amazonaws.com/composer/data/f122a3a8f29ec09b0d61d0254022c0fc338240b3\")\n    .then (buffer) ->\n      console.log buffer\n      done()\n    .catch done\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/sample.coffee": {
      "path": "test/sample.coffee",
      "content": "Sample = require \"../sample\"\n\ndescribe \"Sample\", ->\n  it \"should be able to load a sample pack\", (done) ->\n    Sample.loadPack(require(\"../samples\"))\n    .then (samples) ->\n      console.log samples\n      done()\n    .catch done\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/song.coffee": {
      "path": "test/song.coffee",
      "content": "Song = require \"../song\"\nPattern = require \"../pattern\"\n\ndescribe \"Song\", ->\n  it \"Should know it's size\", ->\n    song = Song\n      patterns: [\n        beats: 4\n      ]\n\n    assert.equal song.size(), 4, \"song.size() is #{song.size()}\"\n\n  it \"Should know the correct size when the pattern has a different size\", ->\n    song = Song\n      patterns: [\n        beats: 10\n      ]\n\n    assert.equal song.size(), 10\n\n  it \"Should have ten patterns\", ->\n    song = Song()\n    assert.equal song.toJSON().patterns.length, 10\n\n  it \"Should know it's tempo\", ->\n    song = Song\n      tempo: 54\n\n    assert.equal song.tempo(), 54\n\n  it \"Should return upcoming notes\", ->\n    song = Song()\n\n    assert.equal song.upcomingNotes(0, 1).length, 0\n\n  describe \"With a single pattern\", ->\n    pattern = Pattern\n      notes: [0..3].map (i) ->\n        [i, 0, 0]\n\n    song = Song\n      channels: [\n        {\n          data:\n            0: 0\n        }\n      ]\n      patterns: [\n        pattern.I\n      ]\n\n    it \"should return all the notes\", ->\n      assert.equal song.upcomingNotes(0, 1).length, 1\n      assert.equal song.upcomingNotes(1, 1).length, 1\n      assert.equal song.upcomingNotes(2, 1).length, 1\n      assert.equal song.upcomingNotes(3, 1).length, 1\n\n      assert.equal song.upcomingNotes(0, 4).length, 4\n\n    it \"shouldn't loop past the end\", ->\n      assert.equal song.upcomingNotes(4, 1).length, 0\n      assert.equal song.upcomingNotes(0, 8).length, 4\n\n  describe \"With multiple patterns in parallel\", ->\n    pattern1 = Pattern\n      notes: [0..3].map (i) ->\n        [i, 0, 0]\n\n    pattern2 = Pattern\n      notes: [0..3].map (i) ->\n        [i + 0.5, 0, 1]\n\n    song = Song\n      channels: [\n        {\n          data:\n            0: 0\n        }, {\n          data:\n            0: 1\n        }\n      ]\n      patterns: [\n        pattern1.I\n        pattern2.I\n      ]\n\n    it \"should return all the notes\", ->\n      assert.equal song.upcomingNotes(0, 1).length, 2\n      assert.equal song.upcomingNotes(1, 1).length, 2\n      assert.equal song.upcomingNotes(2, 1).length, 2\n      assert.equal song.upcomingNotes(3, 1).length, 2\n\n      assert.equal song.upcomingNotes(0, 4).length, 8\n\n    it \"shouldn't loop past the end\", ->\n      assert.equal song.upcomingNotes(4, 1).length, 0\n      assert.equal song.upcomingNotes(3, 2).length, 2\n\n  describe \"With two patterns in sequence\", ->\n    pattern1 = Pattern\n      notes: [0..3].map (i) ->\n        [i, 0, 0]\n\n    song = Song\n      channels: [\n        {\n          data:\n            0: 0\n            4: 0\n        }\n      ]\n      patterns: [\n        pattern1.I\n      ]\n\n    it \"should return all the notes in short timesteps\", ->\n      assert.equal song.upcomingNotes(0, 1).length, 1\n      assert.equal song.upcomingNotes(1, 1).length, 1\n      assert.equal song.upcomingNotes(2, 1).length, 1\n      assert.equal song.upcomingNotes(3, 1).length, 1\n\n      assert.equal song.upcomingNotes(4, 1).length, 1\n      assert.equal song.upcomingNotes(5, 1).length, 1\n      assert.equal song.upcomingNotes(6, 1).length, 1\n      assert.equal song.upcomingNotes(7, 1).length, 1\n\n    it \"should Work with larger timesteps\", ->\n      assert.equal song.upcomingNotes(0, 4).length, 4\n      assert.equal song.upcomingNotes(4, 4).length, 4\n\n    it \"should cross pattern boundries\", ->\n      assert.equal song.upcomingNotes(0, 8).length, 8\n\n    it \"shouldn't loop past the end\", ->\n      assert.equal song.upcomingNotes(8, 1).length, 0\n      assert.equal song.upcomingNotes(0, 16).length, 8\n\n    it \"should have the correct times for the later notes\", ->\n      notes = song.upcomingNotes(0, 16)\n\n      assert.equal notes[4][0], 4\n\n      notes = song.upcomingNotes(3, 16)\n\n      assert.equal notes[1][0], 1\n\n  describe \"#canSet\", ->\n    it \"should allow placing a pattern if there is space, not if not\", ->\n      song = Song\n        patterns: [\n          beats: 8\n        ]\n        channels: [\n          {\n            data:\n              0: 0\n              8: 0\n          }\n        ]\n\n      assert song.canSet(0, 16, 0)\n      assert !song.canSet(0, 15, 0)\n\n  describe \"#patternsDataAt\", ->\n    it \"should get a pattern from each channel\", ->\n      song = Song\n        patterns: [{\n          beats: 8\n        }, {\n          beats: 8\n        }]\n        channels: [\n          {\n            data:\n              0: 0\n          }, {\n            data:\n              7: 0\n          }\n        ]\n\n      assert.equal song.patternsDataAt(0).compact().length, 1\n      assert.equal song.patternsDataAt(7).compact().length, 2\n      assert.equal song.patternsDataAt(8).compact().length, 1\n",
      "mode": "100644",
      "type": "blob"
    },
    "tools.jadelet": {
      "path": "tools.jadelet",
      "content": "- editor = this\n\ndiv\n  .actions\n    button(click=@play) ►\n    button(click=@patternPlay) P►\n    label\n      h2 Tempo\n      input(value=@tempo)\n    label\n      h2 Length\n      input(value=@beats)\n    button(click=@saveAs) Save\n    button(click=@loadSong) Load\n    button(click=@publish) Publish\n    button(click=@loadGistPrompt) Load Gist\n    button(click=@exportAudio) Export\n\n  .tools\n    .instruments\n      - @samples.forEach (sample, i) ->\n        - activate = -> editor.activeToolIndex(0); editor.activeInstrument(i); editor.playNote i\n        - # TODO: Shouldn't need to replace querystring in image... but this CORS shit is nuts\n        .tool.instrument(style=\"background-image: url(#{sample.image.src.replace(/\\?.*/, '')})\" click=activate)\n\n    - eraser = -> editor.activeToolIndex(1)\n    .tool.eraser(click=eraser)\n\n  .position\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/loader.coffee": {
      "path": "lib/loader.coffee",
      "content": "###\nLoad binary data and return a promise that will be fullflled with an ArrayBuffer\nor rejected with an error.\n###\n\nmodule.exports = (url) ->\n  new Promise (resolve, reject) ->\n    request = new XMLHttpRequest()\n    request.open \"GET\", url\n    request.responseType = \"arraybuffer\"\n\n    request.onload = ->\n      resolve request.response\n\n    request.onerror = ->\n      reject Error(\"Failed to load #{url}\")\n\n    request.send()\n",
      "mode": "100644"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "# Google Analytics\nrequire(\"analytics\").init(\"UA-3464282-15\")\n\nrequire \"cornerstone\"\nrequire \"jquery-utils\"\n\nstyle = document.createElement \"style\"\nstyle.innerHTML = require \"./style\"\ndocument.head.appendChild style\n\nglobal.player = require(\"./player\")()\n\nFeedbackTabTemplate = require(\"./templates/feedback-tab\")\ndocument.body.appendChild FeedbackTabTemplate(\"https://docs.google.com/forms/d/e/1FAIpQLSeRz9rCsLJLacvpJNAtAPhj0AN0LM155INP01Y8Tt4k2pIlmA/viewform\")\n",
      "mode": "100644"
    },
    "templates/feedback-tab.coffee": {
      "path": "templates/feedback-tab.coffee",
      "content": "module.exports = (href) ->\n  tab = document.createElement 'a'\n  tab.textContent = \"Feedback\"\n  tab.id = \"feedback\"\n  tab.href = href\n  tab.target = \"_blank\"\n\n  return tab\n",
      "mode": "100644"
    },
    "lib/audio-loader.coffee": {
      "path": "lib/audio-loader.coffee",
      "content": "loader = require \"./loader\"\n\ncontext = require \"./audio-context\"\n\nmodule.exports = (url) ->\n  new Promise (resolve, reject) ->\n    loader(url)\n    .then (buffer) ->\n      context.decodeAudioData buffer, resolve, reject\n",
      "mode": "100644"
    },
    "lib/audio-context.coffee": {
      "path": "lib/audio-context.coffee",
      "content": "AudioContext = window.AudioContext or window.webkitAudioContext\n\nmodule.exports = new AudioContext\n",
      "mode": "100644"
    },
    "samples.coffee": {
      "path": "samples.coffee",
      "content": "# Base\nbase = \"https://addressable.s3.amazonaws.com/composer/data/\"\n\nsamples =\n  synth:\n    sample: \"f122a3a8f29ec09b0d61d0254022c0fc338240b3\"\n    sprite: \"e99777fe5a3c514d3ae7d9078cd705c6495838cc\"\n  piano: # toy piano\n    sample: \"b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6\"\n    sprite: \"dcac2056d205c401bbcf5939171ce6aa1d5bb0fe\"\n  guitar:\n    sample: \"824188ae0fcf3cda0a508c563577a98efa6fe384\"\n    sprite: \"3518ee95f9f047ec45adbb47a964f7b6864fecc6\"\n  horn:\n    sample: \"64916bf1576808add3711c647b3773a3d40eeaec\"\n    sprite: \"c68b9502dd74c020b11519a4c37562b724c255af\"\n  orch_hit:\n    sample: \"b761c6d420c8af2309def0dc408c7ac98008dc5b\"\n    sprite: \"c98d94ab15a922c4ad96e719a02ea7e5eff3930b\"\n  drum:\n    sample: \"d16a30a4d5ec1b32ccb98a048d5dc18d3592ddc7\"\n    sprite: \"cff35c7a508c1dc9e05d608a594bd88bbe0b6890\"\n  snare:\n    sample: \"df1f06afcda30a67672e8ee054e306b7a459a94c\"\n    sprite: \"f738c3e6f1734e1c6216add824aa2db779876c2f\"\n  clap:\n    sample: \"8a5e245b4149ddf0c15c887c1b4a40d94bab0f4e\"\n    sprite: \"191d6bc3012513af8957f4fef9b923c7c830ada1\"\n  cat:\n    sample: \"06c7e53fcae1b07628357344e73ab1782353cd82\"\n    sprite: \"5d6a625888bd45ac1d9d33a86d7a0206709acbba\"\n  dog:\n    sample: \"ef7e42d463e8994c5bd8b84256f4dade3faf32fb\"\n    sprite: \"88e70bd36b7aba07b64a8cfb626b8002fa214772\"\n\nmodule.exports = Object.keys(samples).map (name, i) ->\n  sample = samples[name]\n  sample.name = name\n  sample.index = i\n\n  sample\n",
      "mode": "100644"
    },
    "sample.coffee": {
      "path": "sample.coffee",
      "content": "bufferLoader = require \"./lib/audio-loader\"\n\nurlFor = (sha) ->\n  n = 4\n  i = parseInt(sha.slice(-1), 0x10) % n\n\n  \"https://a#{i}.pixiecdn.com/composer/data/#{sha}?xdomain\"\n\ngetImage = (url) ->\n  image = new Image\n  image.crossOrigin = true\n  image.src = url\n\n  return image\n\nmodule.exports = Sample = (I={}) ->\n\n  self =\n    image: getImage(I.spriteURL)\n    buffer: null\n\n  return self\n\nSample.load = (data) ->\n  {sprite, sample} = data\n\n  # Load audio buffer\n  bufferLoader(urlFor(sample))\n  .then (buffer) ->\n    buffer: buffer\n    image: getImage(urlFor(sprite))\n\nSample.loadPack = (samplePack) ->\n  Promise.all(samplePack.map(Sample.load))\n",
      "mode": "100644"
    },
    "song.coffee": {
      "path": "song.coffee",
      "content": "###\nSong\n====\n\nA song has a tempo, a number of channels, and a number of patterns.\n\nPatterns are placed in the channels.\n###\n\nrequire \"cornerstone\"\n\nChannel = require \"./channel\"\nPattern = require \"./pattern\"\n\nmodule.exports = (I={}, self=Model(I)) ->\n  defaults I,\n    channels: [{\n      data:\n        0: 0\n    }, {}, {}, {}]\n    patterns: [{}]\n    tempo: 90\n\n  self.attrObservable \"tempo\"\n\n  self.attrModels \"channels\", Channel\n  self.attrModels \"patterns\", Pattern\n\n  numPatterns = 10\n\n  # Init Patterns\n  initPatterns = ->\n    [0...numPatterns].forEach (n) ->\n      self.patterns()[n] ?= Pattern()\n\n    # Be sure that our patterns and data are in sync!\n    # TODO: Shouldn't need this hack\n    self.patterns self.patterns().copy()\n\n  initPatterns()\n\n  self.extend\n    channelPatterns: (n) ->\n      self.channels.get(n).patterns(self.patterns())\n\n    setPattern: (channel, beat, patternIndex) ->\n      self.channels.get(channel).setPattern(beat, patternIndex)\n\n    canSet: (channel, beat, patternIndex) ->\n      self.channels.get(channel).canSet(beat, patternIndex, self.patterns())\n\n    patternAt: (channel, beat) ->\n      self.channels.get(channel).patternAt(beat, self.patterns())\n\n    patternsDataAt: (beat) ->\n      self.channels().map (channel) ->\n        channel.patternDataAt(beat, self.patterns()).first()\n\n    removePattern: (channel, beat) ->\n      self.channels.get(channel).removePattern(beat, self.patterns())\n\n    upcomingNotes: (t, dt) ->\n      patterns = self.patterns()\n\n      self.channels.map (channel) ->\n        channel.upcomingNotes t, dt, patterns\n      .flatten()\n\n    size: ->\n      self.channels().map (channel) ->\n        channel.size(self.patterns())\n      .maximum()\n\n    fromJSON: (data) ->\n      if data.patterns?\n        self.patterns data.patterns.map (data) ->\n          Pattern(data)\n        self.channels data.channels.map (data) -> \n          Channel(data)\n      else\n        self.patterns [0...numPatterns].map (i) ->\n          if i is 0\n            Pattern\n              beats: parseInt data.beats, 10\n              notes: data.notes\n          else\n            Pattern()\n\n        self.channels [{\n          data:\n            0: 0\n        }, {}, {}, {}].map (channelData) ->\n          Channel(channelData)\n\n      initPatterns()\n\n      self.tempo data.tempo\n\n      self\n\n  return self\n",
      "mode": "100644"
    },
    "data/demo.json": {
      "path": "data/demo.json",
      "content": "{\"channels\":[{\"data\":{\"0\":0,\"8\":3,\"16\":0,\"24\":4,\"32\":1,\"40\":5,\"48\":8,\"60\":9,\"64\":8,\"76\":6}},{\"data\":{\"0\":2,\"4\":2,\"8\":2,\"12\":2,\"16\":2,\"20\":2,\"24\":2,\"28\":2,\"48\":2,\"52\":2,\"56\":2,\"64\":2,\"68\":2,\"72\":2,\"76\":2}},{\"data\":{}},{\"data\":{}}],\"patterns\":[{\"beats\":8,\"notes\":[[0,10,0],[0,7,0],[3.25,10,0],[3.75,10,0],[4,9,0],[4,5,0],[4.75,5,0],[7,5,0],[7.5,7,0],[3.5,12,0],[7,-4,0],[7.5,-2,0]]},{\"beats\":8,\"notes\":[[0,5,0],[0.5,5,0],[0.5,3,0],[1,2,0],[1,5,0],[1.5,0,0],[1.5,5,0],[2,7,0],[2.5,8,0],[3,7,0],[3.5,5,0],[2,-1,0],[2.5,-1,0],[3,0,0],[3.5,2,0],[0,-9,2],[0.5,-9,2],[1,-9,2],[1.5,-9,2],[1.75,-5,2],[2.25,-5,2],[3.5,-5,2],[3,-5,2],[2.75,-5,2],[4,0,0],[4,3,0],[5,2,0],[5,5,0],[6,3,0],[6,7,0],[4,0,2],[4.5,0,2],[5,0,2],[5.5,0,2],[5.75,-2,2],[6.25,-2,2],[6.75,-2,2],[7,-2,2],[7.5,-2,2],[6.75,10,0],[6.75,7,0]]},{\"beats\":4,\"notes\":[[0,-9,2],[0.5,-9,2],[1,-9,2],[1.75,-9,2],[2.25,-9,2],[2.75,-9,2],[3,-9,2],[3.5,-9,2]]},{\"beats\":8,\"notes\":[[0,-1,0],[0,8,0],[3.25,8,0],[3.5,10,0],[3.75,8,0],[4,3,0],[4,7,0],[4.75,7,0],[4.75,15,0]]},{\"beats\":8,\"notes\":[[0,-1,0],[0,8,0],[3.25,8,0],[3.25,-1,0],[3.5,7,0],[3.5,-2,0],[3.75,5,0],[3.75,-4,0],[4,3,0],[4,-5,0]]},{\"beats\":8,\"notes\":[[0,12,0],[0.5,15,0],[0.5,10,0],[1,9,0],[1,15,0],[1.5,15,0],[1.5,7,0],[2,6,0],[2,14,0],[2.5,6,0],[3,7,0],[3.5,9,0],[3.5,12,0],[3,11,0],[2.5,12,0],[0,-3,2],[0.5,-3,2],[1,-3,2],[1.5,-3,2],[1.75,2,2],[2.25,2,2],[2.75,2,2],[3,2,2],[3.5,2,2],[4,-5,2],[4.5,-5,2],[5,-3,2],[5.5,-3,2],[6,-1,2],[6.5,-1,2],[7.25,-2,2],[7.25,2,0],[7.25,8,0],[7.25,10,0],[4,11,0],[4,14,0],[5,12,0],[5,15,0],[6,14,0],[6,17,0]]},{\"beats\":4,\"notes\":[[0,7,0],[0,-2,0],[0.25,5,0],[0.25,-4,0],[0.5,3,0],[0.5,-6,0]]},{\"beats\":4,\"notes\":[]},{\"beats\":12,\"notes\":[[0.5,12,0],[1.25,10,0],[1.25,19,0],[2,15,0],[2,7,0],[2.75,10,0],[2.75,3,0],[4,9,0],[4.5,9,0],[5,9,0],[5.5,9,0],[5.75,9,0],[5.75,17,0],[7,5,0],[7.5,7,0],[8,8,0],[4,5,0],[8.5,11,0],[8.5,15,0],[9.25,11,0],[9.25,8,0],[10,8,0],[10,-1,0],[10.75,3,0],[10.75,-4,0],[11.5,-1,0],[11.5,5,0]]},{\"beats\":4,\"notes\":[[0,-2,0],[0,7,0],[0,-9,2],[0.5,-9,2],[1,-9,2],[1.5,-9,2],[1.75,-2,2],[2.25,-2,2],[2.75,-2,2],[3,-2,2],[3.5,-2,2]]}],\"tempo\":\"120\"}",
      "mode": "100644"
    },
    "lib/gist.coffee": {
      "path": "lib/gist.coffee",
      "content": "base = \"https://api.github.com/gists\"\n\nmodule.exports =\n  save: (data) ->\n    data =\n      description: \"A song created with #{window.location}\"\n      public: true\n      files:\n        \"data.json\":\n          content: JSON.stringify data\n\n    $.ajax base,\n      headers:\n        Accept: \"application/vnd.github.v3+json\"\n      contentType: \"application/json; charset=utf-8\"\n      data: JSON.stringify data\n      dataType: \"json\"\n      type: \"POST\"\n    .then (result) ->\n      result.id\n\n  load: (gistId) ->\n    $.get(\"#{base}/#{gistId}\").then (data) ->\n      data = data.files[\"data.json\"]?.content or data.files[\"pattern0.json\"]?.content\n\n      if data\n        JSON.parse data\n      else\n        alert \"Failed to load gist with id: #{gistId}\"\n",
      "mode": "100644"
    },
    "colors.coffee": {
      "path": "colors.coffee",
      "content": "module.exports =\n  LIGHT: \"rgba(103, 58, 183, 0.19)\"\n  DARK: \"rgba(103, 58, 183, 0.5)\"\n  CURSOR: \"#F0F\"\n",
      "mode": "100644"
    },
    "player-audio.coffee": {
      "path": "player-audio.coffee",
      "content": "###\nPlayer Audio\n============\n\nMain audio loop\n\nPlays a \"Playable\". Playables have an `upcomingSounds` method that returns an\narray of notes to be played with beat offsets.\n\nNeeds tempo, playable, start beat, end beat, looping mode to play.\n\nProvides playTime and playing methods.\n###\n\ncontext = require \"./lib/audio-context\"\n\nmodule.exports = (I, self) ->\n  playing = false\n  playTime = 0\n  timestep = 1/60 # Animation Frame timestep, seconds\n  minute = 60 # seconds\n\n  scheduleSound = ([time, note, instrument]) ->\n    self.playNote instrument, note, time * minute / self.tempo()\n\n  # Schedules upcoming sounds to play\n  playUpcomingSounds = (current, dt) ->\n    self.upcomingSounds(current, dt)\n    .forEach (note) ->\n      scheduleSound(note)\n\n  playLoop = ->\n    if playing\n      # dt is measured in beats\n      dt = timestep * self.tempo() / minute\n      playUpcomingSounds(playTime, dt)\n\n      playTime += dt\n\n      if playTime >= self.size()\n        if self.loop()\n          dt = playTime - self.size() # \"left over\" section wraps to beginning\n          playUpcomingSounds(0, dt)\n          playTime = dt\n        else\n          playTime = 0\n          playing = false\n\n    requestAnimationFrame playLoop\n\n  playLoop()\n\n  self.extend\n    # Schedule a note to be played, use the buffer at the given index, pitch shift by\n    # `note` semitones, and play at `time` seconds in the future.\n    \n    exportSong: (song) ->\n      beats = song.size()\n      bpm = song.tempo()\n      \n      audioChannels = 1\n      samplesPerSecond = 44100\n      lengthInSeconds = 60 * (beats / bpm) + 3 # Add 3s\n      offlineContext = new OfflineAudioContext(audioChannels, samplesPerSecond * lengthInSeconds, samplesPerSecond)\n\n      new Promise (resolve, reject) ->\n        t = 0 # beats\n        dt = 1 # beats\n\n        work = ->\n          console.log \"rendering: #{t}\"\n          song.upcomingNotes(t, dt).forEach ([time, note, instrument]) ->\n            self.playNote instrument, note, t + time * minute / self.tempo(), offlineContext\n\n          t += 1\n\n          if t <= beats\n            setTimeout work, 0\n          else\n            offlineContext.startRendering().then(resolve, reject)\n\n        work()\n\n      .then (buffer) ->\n        self.audioBufferToWave(buffer)\n      .then (blob) ->\n        url = window.URL.createObjectURL(blob)\n        a = document.createElement(\"a\")\n        a.href = url\n        a.download = \"song.wav\"\n        a.click()\n        window.URL.revokeObjectURL(url)\n\n    audioBufferToWave: (audioBuffer) ->\n      new Promise (resolve, reject) ->\n        workerSource = new Blob [PACKAGE.distribution[\"lib/wave-worker\"].content], type: \"application/javascript\"\n\n        worker = new Worker(URL.createObjectURL(workerSource))\n\n        worker.onmessage = (e) ->\n          blob = new Blob([e.data.buffer], {type:\"audio/wav\"})\n          resolve(blob)\n\n        pcmArrays = [audioBuffer.getChannelData(0)]\n\n        worker.postMessage \n          pcmArrays: pcmArrays,\n          config:\n            sampleRate: audioBuffer.sampleRate\n\n    # TODO: Should different patterns have different sample banks?\n    playNote: (instrument, note, time, _context) ->\n      buffer = self.samples.get(instrument).buffer\n      self.playBufferNote(buffer, note, time, _context or context)\n\n    playBufferNote: (buffer, note=0,  time=0, context) ->\n      rate = Math.pow 2, note / 12\n\n      self.playBuffer(buffer, rate, time, context)\n\n    playBuffer: (buffer, rate=1, time=0, context) ->\n      source = context.createBufferSource()\n      source.buffer = buffer\n      source.connect(context.destination)\n      source.start(time + context.currentTime)\n      source.playbackRate.value = rate\n\n    playTime: ->\n      playTime\n\n    playing: ->\n      playing\n\n    pause: ->\n      playing = !playing\n\n    play: ->\n      if self.patternMode()\n        playTime = 0\n\n      self.pause()\n      self.patternMode false\n\n    reset: ->\n      playing = false\n      playTime = 0\n\n      self.activePattern self.patterns.get(0)\n\n    patternPlay: ->\n      self.pause()\n      playTime = 0\n      self.patternMode true\n\n    loop: ->\n      true\n",
      "mode": "100644"
    },
    "lib/wave-worker.js": {
      "path": "lib/wave-worker.js",
      "content": "// https://stackoverflow.com/a/42632646/68210\r\n\r\nself.onmessage = function( e ){\r\n  var wavPCM = new WavePCM( e['data']['config'] );\r\n  wavPCM.record( e['data']['pcmArrays'] );\r\n  wavPCM.requestData();\r\n};\r\n\r\nvar WavePCM = function( config ){\r\n  this.sampleRate = config['sampleRate'] || 48000;\r\n  this.bitDepth = config['bitDepth'] || 16;\r\n  this.recordedBuffers = [];\r\n  this.bytesPerSample = this.bitDepth / 8;\r\n};\r\n\r\nWavePCM.prototype.record = function( buffers ){\r\n  this.numberOfChannels = this.numberOfChannels || buffers.length;\r\n  var bufferLength = buffers[0].length;\r\n  var reducedData = new Uint8Array( bufferLength * this.numberOfChannels * this.bytesPerSample );\r\n\r\n  // Interleave\r\n  for ( var i = 0; i < bufferLength; i++ ) {\r\n    for ( var channel = 0; channel < this.numberOfChannels; channel++ ) {\r\n\r\n      var outputIndex = ( i * this.numberOfChannels + channel ) * this.bytesPerSample;\r\n      var sample = buffers[ channel ][ i ];\r\n\r\n      // Check for clipping\r\n      if ( sample > 1 ) {\r\n        sample = 1;\r\n      }\r\n\r\n      else if ( sample < -1 ) {\r\n        sample = -1;\r\n      }\r\n\r\n      // bit reduce and convert to uInt\r\n      switch ( this.bytesPerSample ) {\r\n        case 4:\r\n          sample = sample * 2147483648;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          reducedData[ outputIndex + 2 ] = sample >> 16;\r\n          reducedData[ outputIndex + 3 ] = sample >> 24;\r\n          break;\r\n\r\n        case 3:\r\n          sample = sample * 8388608;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          reducedData[ outputIndex + 2 ] = sample >> 16;\r\n          break;\r\n\r\n        case 2:\r\n          sample = sample * 32768;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          break;\r\n\r\n        case 1:\r\n          reducedData[ outputIndex ] = ( sample + 1 ) * 128;\r\n          break;\r\n\r\n        default:\r\n          throw \"Only 8, 16, 24 and 32 bits per sample are supported\";\r\n      }\r\n    }\r\n  }\r\n\r\n  this.recordedBuffers.push( reducedData );\r\n};\r\n\r\nWavePCM.prototype.requestData = function(){\r\n  var bufferLength = this.recordedBuffers[0].length;\r\n  var dataLength = this.recordedBuffers.length * bufferLength;\r\n  var headerLength = 44;\r\n  var wav = new Uint8Array( headerLength + dataLength );\r\n  var view = new DataView( wav.buffer );\r\n\r\n  view.setUint32( 0, 1380533830, false ); // RIFF identifier 'RIFF'\r\n  view.setUint32( 4, 36 + dataLength, true ); // file length minus RIFF identifier length and file description length\r\n  view.setUint32( 8, 1463899717, false ); // RIFF type 'WAVE'\r\n  view.setUint32( 12, 1718449184, false ); // format chunk identifier 'fmt '\r\n  view.setUint32( 16, 16, true ); // format chunk length\r\n  view.setUint16( 20, 1, true ); // sample format (raw)\r\n  view.setUint16( 22, this.numberOfChannels, true ); // channel count\r\n  view.setUint32( 24, this.sampleRate, true ); // sample rate\r\n  view.setUint32( 28, this.sampleRate * this.bytesPerSample * this.numberOfChannels, true ); // byte rate (sample rate * block align)\r\n  view.setUint16( 32, this.bytesPerSample * this.numberOfChannels, true ); // block align (channel count * bytes per sample)\r\n  view.setUint16( 34, this.bitDepth, true ); // bits per sample\r\n  view.setUint32( 36, 1684108385, false); // data chunk identifier 'data'\r\n  view.setUint32( 40, dataLength, true ); // data chunk length\r\n\r\n  for (var i = 0; i < this.recordedBuffers.length; i++ ) {\r\n    wav.set( this.recordedBuffers[i], i * bufferLength + headerLength );\r\n  }\r\n\r\n  self.postMessage( wav, [wav.buffer] );\r\n  self.close();\r\n};\r\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "arranger_view": {
      "path": "arranger_view",
      "content": "(function() {\n  var CURSOR, DARK, LIGHT, canvasHelpers, patternColors, patternCount, unitX, unitY, _ref;\n\n  _ref = require(\"./colors\"), LIGHT = _ref.LIGHT, DARK = _ref.DARK, CURSOR = _ref.CURSOR;\n\n  patternCount = 10;\n\n  patternColors = [200, 0, 180, -90, 130, -50, 60, 0, -60, 40].map(function(h, i) {\n    var s, v;\n    if (i === 6) {\n      s = \"0%\";\n    } else {\n      s = \"87%\";\n    }\n    if (i === 8) {\n      v = \"100%\";\n    } else {\n      v = \"50%\";\n    }\n    return \"hsl(\" + h + \", \" + s + \", \" + v + \")\";\n  });\n\n  require(\"cornerstone\");\n\n  unitX = 20;\n\n  unitY = 20;\n\n  module.exports = function(I, self) {\n    var Canvas, canvas, drawChannel, drawPattern, drawPosition, element, pos;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    Canvas = require(\"touch-canvas\");\n    canvas = Canvas({\n      height: 80,\n      width: 128 * unitX\n    });\n    canvasHelpers(canvas);\n    element = document.createElement(\"div\");\n    element.classList.add(\"arranger-wrap\");\n    element.appendChild(canvas.element());\n    pos = {\n      channel: 0,\n      beat: -20\n    };\n    $(canvas.element()).mousemove(function(e) {\n      var left, top, x, y, _ref1;\n      _ref1 = canvas.element().getBoundingClientRect(), left = _ref1.left, top = _ref1.top;\n      x = e.pageX, y = e.pageY;\n      pos.beat = 0 | ((x - left) / unitX);\n      return pos.channel = 0 | ((y - top) / unitY);\n    });\n    canvas.on(\"touch\", function(p) {\n      var beat, channel;\n      beat = Math.floor(p.x * canvas.width() / unitX);\n      channel = Math.floor(p.y * canvas.height() / unitY);\n      return self.trigger(\"arrangerClick\", channel, beat);\n    });\n    drawPosition = function(canvas) {\n      return canvas.drawText({\n        text: \"\" + pos.beat + \", \" + pos.channel,\n        x: 20,\n        y: 30,\n        color: \"black\"\n      });\n    };\n    drawPattern = function(canvas, channel, beat, size, color) {\n      return canvas.drawRect({\n        x: beat * unitX,\n        y: channel * unitY,\n        width: size * unitX,\n        height: unitY - 1,\n        color: color,\n        stroke: {\n          width: 1,\n          color: DARK\n        }\n      });\n    };\n    drawChannel = function(canvas, patterns, i) {\n      var size;\n      patterns.forEach(function(_arg) {\n        var end, index, pattern, start;\n        start = _arg[0], end = _arg[1], pattern = _arg[2], index = _arg[3];\n        return drawPattern(canvas, i, start, pattern.size(), patternColors[index]);\n      });\n      if (i === pos.channel && self.activeToolIndex() === 0) {\n        size = self.patterns()[self.patternToolIndex()].size();\n        canvas.withAlpha(0.25, function() {\n          return drawPattern(canvas, i, pos.beat, size, patternColors[self.patternToolIndex()]);\n        });\n      }\n      return canvas.drawRect({\n        x: 0,\n        y: 20 * (i + 1) - 1,\n        width: canvas.width(),\n        height: 1,\n        color: LIGHT\n      });\n    };\n    self.on(\"draw\", function() {\n      var song;\n      song = self.song();\n      canvas.fill(\"white\");\n      song.channels().forEach(function(channel, i) {\n        var patterns;\n        patterns = song.channelPatterns(i);\n        return drawChannel(canvas, patterns, i);\n      });\n      if (self.patternMode()) {\n\n      } else {\n        return canvas.drawRect({\n          x: self.playTime() * unitX,\n          y: 0,\n          width: 1,\n          height: canvas.height(),\n          color: CURSOR\n        });\n      }\n    });\n    return self.extend({\n      arrangerElement: function() {\n        return element;\n      }\n    });\n  };\n\n  canvasHelpers = function(canvas) {\n    return canvas.withAlpha = function(alpha, fn) {\n      var oldAlpha;\n      oldAlpha = canvas.globalAlpha();\n      canvas.globalAlpha(alpha * oldAlpha);\n      try {\n        fn(canvas);\n      } finally {\n        canvas.globalAlpha(oldAlpha);\n      }\n      return canvas;\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "channel": {
      "path": "channel",
      "content": "(function() {\n  var max, min, overlap;\n\n  require(\"cornerstone\");\n\n  module.exports = function(I, self) {\n    var patternStarts;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    defaults(I, {\n      data: {}\n    });\n    patternStarts = function(patterns) {\n      return Object.keys(I.data).map(function(start) {\n        var end, pattern, patternIndex;\n        start = parseInt(start, 10);\n        patternIndex = parseInt(I.data[start], 10);\n        pattern = patterns[patternIndex];\n        end = start + pattern.size();\n        return [start, end, pattern, patternIndex];\n      });\n    };\n    self.extend({\n      patterns: patternStarts,\n      canSet: function(beat, patternIndex, patterns) {\n        var size, toInsert;\n        size = patterns[patternIndex].size();\n        toInsert = [beat, beat + size];\n        return !patternStarts(patterns).some(function(segment) {\n          return overlap(toInsert, segment);\n        });\n      },\n      patternDataAt: function(beat, patterns) {\n        return patternStarts(patterns).filter(function(_arg) {\n          var end, start;\n          start = _arg[0], end = _arg[1];\n          return (start <= beat && beat < end);\n        });\n      },\n      patternAt: function(beat, patterns) {\n        return self.patternDataAt(beat, patterns).map(function(_arg) {\n          var end, pattern, patternIndex, start;\n          start = _arg[0], end = _arg[1], pattern = _arg[2], patternIndex = _arg[3];\n          return patternIndex;\n        }).first();\n      },\n      setPattern: function(beat, patternIndex) {\n        return I.data[beat] = patternIndex;\n      },\n      removePattern: function(beat, patterns) {\n        var patternsAtBeat;\n        patternsAtBeat = patternStarts(patterns).filter(function(_arg) {\n          var end, start;\n          start = _arg[0], end = _arg[1];\n          return (start <= beat && beat < end);\n        });\n        patternsAtBeat.forEach(function(_arg) {\n          var start;\n          start = _arg[0];\n          return delete I.data[start];\n        });\n        return patternsAtBeat.length > 0;\n      },\n      upcomingNotes: function(t, dt, patterns) {\n        return patternStarts(patterns).filter(function(_arg) {\n          var end, pattern, start;\n          start = _arg[0], end = _arg[1], pattern = _arg[2];\n          return ((start <= t && t < end)) || ((t <= start && start < t + dt));\n        }).map(function(_arg) {\n          var end, offset, pattern, start;\n          start = _arg[0], end = _arg[1], pattern = _arg[2];\n          offset = t - start;\n          return pattern.upcomingNotes(offset, dt);\n        }).flatten();\n      },\n      size: function(patterns) {\n        var _ref;\n        return (_ref = patternStarts(patterns).map(function(_arg) {\n          var end, start;\n          start = _arg[0], end = _arg[1];\n          return end;\n        }).maximum()) != null ? _ref : 0;\n      }\n    });\n    return self;\n  };\n\n  min = Math.min, max = Math.max;\n\n  overlap = function(_arg, _arg1) {\n    var a1, a2, b1, b2;\n    a1 = _arg[0], a2 = _arg[1];\n    b1 = _arg1[0], b2 = _arg1[1];\n    return max(0, min(a2, b2) - max(a1, b1)) > 0;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "extensions": {
      "path": "extensions",
      "content": "(function() {\n  Blob.prototype.readAsText = function() {\n    var file;\n    file = this;\n    return new Promise(function(resolve, reject) {\n      var reader;\n      reader = new FileReader;\n      reader.onload = function() {\n        return resolve(reader.result);\n      };\n      reader.onerror = reject;\n      return reader.readAsText(file);\n    });\n  };\n\n  Blob.prototype.readAsJSON = function() {\n    return this.readAsText().then(JSON.parse);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "note": {
      "path": "note",
      "content": "(function() {\n  var notes;\n\n  notes = \"C C# D D# E F F# G G# A A# B\".split(\" \");\n\n  module.exports = function(noteNumber) {\n    var note, octave;\n    noteNumber |= 0;\n    note = notes.wrap(noteNumber);\n    octave = 4 + (noteNumber / 12) | 0;\n    return \"\" + note + octave;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pattern": {
      "path": "pattern",
      "content": "(function() {\n  require(\"cornerstone\");\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    defaults(I, {\n      beats: 8,\n      notes: []\n    });\n    I.beats = parseInt(I.beats, 10) || 4;\n    self.attrObservable(\"beats\");\n    self.attrAccessor(\"notes\");\n    return extend(self, {\n      addNote: function(note) {\n        return I.notes.push(note);\n      },\n      removeNote: function(_arg) {\n        var matched, note, time;\n        time = _arg[0], note = _arg[1];\n        matched = I.notes.filter(function(_arg1) {\n          var n, t;\n          t = _arg1[0], n = _arg1[1];\n          return time === t && note === n;\n        });\n        return self.notes().remove(matched.last());\n      },\n      size: function() {\n        return self.beats();\n      },\n      upcomingNotes: function(t, dt) {\n        return self.notes().filter(function(_arg) {\n          var time;\n          time = _arg[0];\n          if (dt > 0) {\n            return (t <= time && time < t + dt);\n          } else if (dt < 0) {\n            return (t + dt < time && time <= t);\n          }\n        }).map(function(_arg) {\n          var instrument, note, time;\n          time = _arg[0], note = _arg[1], instrument = _arg[2];\n          return [time - t, note, instrument];\n        });\n      }\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pattern_tools": {
      "path": "pattern_tools",
      "content": "(function() {\n  var tools;\n\n  require(\"cornerstone\");\n\n  tools = [\n    function(self, _arg) {\n      var beat, instrument, note;\n      beat = _arg.beat, note = _arg.note;\n      instrument = self.activeInstrument();\n      self.addNote([beat, note, instrument]);\n      return self.playNote(instrument, note);\n    }, function(self, _arg) {\n      var beat, note;\n      beat = _arg.beat, note = _arg.note;\n      if (self.activePattern().removeNote([beat, note])) {\n\n      }\n    }\n  ];\n\n  module.exports = function(I, self) {\n    defaults(I, {\n      activeInstrument: 1,\n      activeToolIndex: 0\n    });\n    self.attrObservable(\"activeInstrument\", \"activeToolIndex\");\n    self.extend({\n      activeTool: function() {\n        return tools[self.activeToolIndex()];\n      }\n    });\n    self.activeInstrument.observe(function(instrument) {\n      return self.setCursor();\n    });\n    self.activeToolIndex.observe(function() {\n      return self.setCursor();\n    });\n    self.include(require(\"hotkeys\"));\n    self.addHotkey(\"space\", \"pause\");\n    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(i) {\n      return self.addHotkey(i.toString(), function() {\n        self.playNote(i - 1);\n        self.activeInstrument(i - 1);\n        return self.activeToolIndex(0);\n      });\n    });\n    self.addHotkey(\"0\", function() {\n      self.playNote(9);\n      self.activeInstrument(9);\n      return self.activeToolIndex(0);\n    });\n    self.addHotkey(\"e\", function() {\n      return self.activeToolIndex(1);\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pattern_view": {
      "path": "pattern_view",
      "content": "(function() {\n  var CURSOR, DARK, LIGHT, mod, noteName, pageSize, quantize, _ref;\n\n  _ref = require(\"./colors\"), LIGHT = _ref.LIGHT, DARK = _ref.DARK, CURSOR = _ref.CURSOR;\n\n  require(\"cornerstone\");\n\n  noteName = require(\"./note\");\n\n  pageSize = 8;\n\n  module.exports = function(I, self) {\n    var Canvas, beats, canvas, drawNote, drawScaleGuides, drawTemporalGuides, handleResize, inScale, noteToPosition, notes, pageStart, positionToNote, render;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    defaults(I, {\n      gamut: [-12, 18],\n      quantize: 4\n    });\n    beats = self.beats = Observable(self.activePattern().beats());\n    self.activePattern.observe(function(p) {\n      return beats(p.beats());\n    });\n    beats.observe(function(value) {\n      return self.activePattern().beats(parseInt(value, 10));\n    });\n    pageStart = 0;\n    notes = function() {\n      if (self.patternMode()) {\n        return self.activePattern().notes();\n      } else {\n        pageStart = self.playTime() - self.playTime() % pageSize;\n        return self.upcomingSounds(pageStart, pageSize);\n      }\n    };\n    self.attrObservable(\"gamut\", \"quantize\");\n    Canvas = require(\"touch-canvas\");\n    canvas = Canvas();\n    $(canvas.element()).mousemove(function(e) {\n      var beat, left, note, top, x, y, _ref1;\n      _ref1 = canvas.element().getBoundingClientRect(), left = _ref1.left, top = _ref1.top;\n      x = e.pageX, y = e.pageY;\n      x = x - left;\n      y = y - top;\n      note = Math.round(positionToNote(y));\n      beat = quantize(x / canvas.width() * beats(), self.quantize());\n      return $(\".position\").text(\"T: \" + (beat.toFixed(2)) + \", \" + (noteName(note)));\n    });\n    canvas.on(\"touch\", function(p) {\n      var beat, data, note, pattern, patternData, patternEnd, patternStart, patternsData;\n      note = Math.round(positionToNote(p.y * canvas.height()));\n      if (self.patternMode()) {\n        beat = quantize(p.x * beats(), self.quantize());\n        data = {\n          note: note,\n          beat: beat\n        };\n      } else {\n        beat = quantize(p.x * pageSize, self.quantize());\n        beat += pageStart;\n        patternsData = self.song().patternsDataAt(beat);\n        patternData = patternsData[self.lastChannelIndex()] || patternsData.compact().first();\n        if (patternData) {\n          patternStart = patternData[0], patternEnd = patternData[1], pattern = patternData[2];\n          self.activePattern(pattern);\n          data = {\n            note: note,\n            beat: beat - patternStart\n          };\n        }\n      }\n      if (data) {\n        return self.activeTool()(self, data);\n      }\n    });\n    document.body.appendChild(canvas.element());\n    handleResize = function() {\n      canvas.width(window.innerWidth - 40);\n      return canvas.height(window.innerHeight - (25 + 94));\n    };\n    handleResize();\n    window.addEventListener(\"resize\", handleResize, false);\n    drawNote = function(canvas, note) {\n      var height, img, instrument, size, time, width, x, y, _ref1, _ref2;\n      _ref1 = note, time = _ref1[0], note = _ref1[1], instrument = _ref1[2];\n      _ref2 = img = self.samples.get(instrument).image, width = _ref2.width, height = _ref2.height;\n      if (self.patternMode()) {\n        size = self.activePattern().size();\n      } else {\n        size = pageSize;\n      }\n      x = time * (canvas.width() / size) - width / 2;\n      y = noteToPosition(note) - height / 2;\n      return canvas.drawImage(img, x | 0, y | 0);\n    };\n    drawTemporalGuides = function(canvas) {\n      var n, width, _i, _ref1, _results;\n      if (self.patternMode()) {\n        n = self.activePattern().size() * self.quantize();\n      } else {\n        n = pageSize * self.quantize();\n      }\n      width = canvas.width() / n;\n      return (function() {\n        _results = [];\n        for (var _i = 0, _ref1 = n - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(i) {\n        var color;\n        if (mod(i, self.quantize()) === 0) {\n          color = DARK;\n        } else {\n          color = LIGHT;\n        }\n        return canvas.drawRect({\n          x: width * i,\n          y: 0,\n          width: 1,\n          height: canvas.height(),\n          color: color\n        });\n      });\n    };\n    noteToPosition = function(note) {\n      var height, high, low, mid, n, _ref1;\n      _ref1 = self.gamut(), low = _ref1[0], high = _ref1[1];\n      n = (high - low) + 1;\n      mid = (high + low) / 2;\n      height = canvas.height() / n;\n      return canvas.height() - (note - mid + n / 2) * height;\n    };\n    positionToNote = function(position) {\n      var height, high, low, mid, n, note, _ref1;\n      _ref1 = self.gamut(), low = _ref1[0], high = _ref1[1];\n      n = (high - low) + 1;\n      mid = (high + low) / 2;\n      height = canvas.height() / n;\n      return note = canvas.height() / height - (position / height + n / 2 - mid);\n    };\n    drawScaleGuides = function(canvas) {\n      var high, low, _i, _ref1, _results;\n      _ref1 = self.gamut(), low = _ref1[0], high = _ref1[1];\n      return (function() {\n        _results = [];\n        for (var _i = low; low <= high ? _i <= high : _i >= high; low <= high ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(i, index) {\n        var color;\n        if (inScale(i)) {\n          color = DARK;\n        } else {\n          color = LIGHT;\n        }\n        return canvas.drawRect({\n          x: 0,\n          y: noteToPosition(i),\n          width: canvas.width(),\n          height: 1,\n          color: color\n        });\n      });\n    };\n    inScale = function(i, scale) {\n      if (scale == null) {\n        scale = 0;\n      }\n      i = mod(i + scale, 12);\n      return [0, 2, 4, 5, 7, 9, 11].some(function(n) {\n        return n === i;\n      });\n    };\n    render = function() {\n      canvas.fill(\"white\");\n      drawScaleGuides(canvas);\n      drawTemporalGuides(canvas);\n      notes().forEach(function(note) {\n        return drawNote(canvas, note);\n      });\n      if (self.patternMode()) {\n        return canvas.drawRect({\n          x: self.playTime() * canvas.width() / beats(),\n          y: 0,\n          width: 1,\n          height: canvas.height(),\n          color: CURSOR\n        });\n      } else {\n        return canvas.drawRect({\n          x: (self.playTime() % pageSize) * canvas.width() / pageSize,\n          y: 0,\n          width: 1,\n          height: canvas.height(),\n          color: CURSOR\n        });\n      }\n    };\n    self.on(\"draw\", render);\n    self.samples.observe(function() {\n      return self.setCursor();\n    });\n    self.include(require(\"./pattern_tools\"));\n    return self.extend({\n      setCursor: function() {\n        var height, img, sample, url, width, x, y, _ref1;\n        if (self.activeToolIndex() === 0) {\n          if (sample = self.samples.get(self.activeInstrument())) {\n            _ref1 = img = sample.image, width = _ref1.width, height = _ref1.height, url = _ref1.src;\n            url = url.replace(/\\?.*/, \"\");\n            x = width / 2;\n            y = height / 2;\n            return $(document.body).css({\n              cursor: \"url(\" + url + \") \" + x + \" \" + y + \", default\"\n            });\n          }\n        } else {\n          return $(document.body).css({\n            cursor: \"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==) 8 8, default\"\n          });\n        }\n      }\n    });\n  };\n\n  mod = function(n, k) {\n    return (n % k + k) % k;\n  };\n\n  quantize = function(x, n) {\n    return (((x + 1 / (2 * n)) * n) | 0) / n;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "persistence": {
      "path": "persistence",
      "content": "(function() {\n  var Gist;\n\n  Gist = require(\"./lib/gist\");\n\n  module.exports = function(I, self) {\n    var prompted;\n    if (I == null) {\n      I = {};\n    }\n    defaults(I, {\n      unsaved: false\n    });\n    self.attrAccessor(\"unsaved\");\n    prompted = false;\n    window.addEventListener(\"beforeunload\", function(e) {\n      if (prompted) {\n        return;\n      }\n      prompted = true;\n      setTimeout(function() {\n        return prompted = false;\n      });\n      if (self.unsaved()) {\n        e.returnValue = \"Your changes haven't yet been saved. If you leave now you will lose your work.\";\n      }\n      return e.returnValue;\n    });\n    setTimeout(function() {\n      var hash;\n      if (hash = location.hash) {\n        return self.loadGist(hash.substr(1));\n      }\n    }, 0);\n    try {\n      if (localStorage.songs_demo == null) {\n        localStorage.songs_demo = JSON.stringify(require(\"./data/demo\"));\n      }\n    } catch (_error) {}\n    return self.extend({\n      saveAs: function() {\n        var data, name;\n        if (name = prompt(\"Name\")) {\n          data = self.song().toJSON();\n          localStorage[\"songs_\" + name] = JSON.stringify(data);\n          return self.unsaved(false);\n        }\n      },\n      loadSong: function() {\n        var data, name;\n        if (name = prompt(\"Name\", \"demo\")) {\n          data = JSON.parse(localStorage[\"songs_\" + name]);\n          return self.fromJSON(data);\n        }\n      },\n      fromJSON: function(data) {\n        self.song().fromJSON(data);\n        return self.reset();\n      },\n      publish: function() {\n        return Gist.save(self.song().toJSON()).then(function(id) {\n          location.hash = id;\n          alert(\"Published as \" + location + \"\\nShare this by copying the url!\");\n          return self.unsaved(false);\n        });\n      },\n      loadGist: function(id) {\n        return Gist.load(id).then(function(data) {\n          self.fromJSON(data);\n          return location.hash = id;\n        }, function() {\n          return alert(\"Couldn't load gist with id: \" + id);\n        });\n      },\n      loadGistPrompt: function() {\n        var id;\n        if (id = prompt(\"Gist id\", location.hash.substr(1) || \"0b4c4656a6eb1d246829\")) {\n          return self.loadGist(id);\n        }\n      }\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"title\":\"Mario Paint Music Composer - danielx.net\",\"description\":\"This Mario Paint inspired composer tool is easy and fun. You can create simple and\\nbeautiful songs right in your browser and share them with the world!\",\"version\":\"0.1.0\",\"publish\":{\"s3\":{\"basePath\":\"public/danielx.net\"}},\"remoteDependencies\":[\"https://code.jquery.com/jquery-1.11.0.min.js\"],\"dependencies\":{\"ajax\":\"distri/ajax:v0.1.5-pre.0\",\"analytics\":\"distri/google-analytics:v0.1.0\",\"cornerstone\":\"distri/cornerstone:v0.3.0-pre.2\",\"hotkeys\":\"distri/hotkeys:v0.2.0\",\"jquery-utils\":\"distri/jquery-utils:v0.2.0\",\"observable\":\"distri/observable:v0.3.8\",\"postmaster\":\"distri/postmaster:v0.5.1\",\"touch-canvas\":\"distri/touch-canvas:v0.3.1\",\"ui\":\"STRd6/ui:master\"}};",
      "type": "blob"
    },
    "player": {
      "path": "player",
      "content": "(function() {\n  var Ajax, Modal, PatternView, Postmaster, Progress, Sample, Song, Style, UI, animate, style, _ref;\n\n  require(\"cornerstone\");\n\n  require(\"./extensions\");\n\n  Ajax = require(\"ajax\");\n\n  _ref = UI = require(\"ui\"), Progress = _ref.Progress, Modal = _ref.Modal, Style = _ref.Style;\n\n  Postmaster = require(\"postmaster\");\n\n  Sample = require(\"./sample\");\n\n  Song = require(\"./song\");\n\n  PatternView = require(\"./pattern_view\");\n\n  style = document.createElement(\"style\");\n\n  style.innerHTML = Style.all;\n\n  document.head.appendChild(style);\n\n  module.exports = function(I, self) {\n    var activePattern, ajax, element, postmaster, song;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    defaults(I, {\n      samples: [],\n      patternMode: false,\n      lastChannelIndex: 0\n    });\n    ajax = Ajax();\n    self.include(Bindable);\n    self.attrObservable(\"samples\");\n    self.attrAccessor(\"patternMode\", \"lastChannelIndex\");\n    song = Song();\n    Sample.loadPack(require(\"../samples\")).then(self.samples);\n    activePattern = Observable(song.patterns()[0]);\n    self.extend({\n      activePattern: activePattern,\n      size: function() {\n        if (self.patternMode()) {\n          return activePattern().size();\n        } else {\n          return song.size();\n        }\n      },\n      addNote: function(note) {\n        self.unsaved(true);\n        return activePattern().notes().push(note);\n      },\n      patternToolIndex: function() {\n        return self.activeInstrument();\n      },\n      patterns: song.patterns,\n      song: function() {\n        return song;\n      },\n      tempo: song.tempo,\n      about: function() {\n        return console.log(\"about\");\n      },\n      exportAudio: function() {\n        return self.exportSong(self.song()).then(console.log);\n      },\n      removeNote: function() {\n        var _ref1;\n        return (_ref1 = activePattern()).removeNote.apply(_ref1, arguments);\n      },\n      upcomingSounds: function(current, dt) {\n        if (self.patternMode()) {\n          return activePattern().upcomingNotes(current, dt);\n        } else {\n          return song.upcomingNotes(current, dt);\n        }\n      },\n      loadFromURL: function(url) {\n        var progressView;\n        progressView = Progress({\n          value: 0,\n          message: \"Loading...\"\n        });\n        Modal.show(progressView.element, {\n          cancellable: false\n        });\n        return ajax.ajax({\n          url: url,\n          responseType: \"json\"\n        }).progress(function(_arg) {\n          var lengthComputable, loaded, total;\n          lengthComputable = _arg.lengthComputable, loaded = _arg.loaded, total = _arg.total;\n          if (lengthComputable) {\n            return progressView.value(loaded / total);\n          }\n        }).then(self.fromJSON).then(function() {\n          return Modal.hide();\n        })[\"catch\"](function(e) {\n          if (e.statusText) {\n            return Modal.alert(\"An error has occurred: \" + e.status + \" - \" + e.statusText);\n          } else {\n            return Modal.alert(\"An error has occurred: \" + e.message);\n          }\n        });\n      }\n    });\n    self.include(require(\"./player-audio\"));\n    self.include(require(\"./persistence\"));\n    element = document.body;\n    self.include(PatternView);\n    element.appendChild(require(\"./tools\")(self));\n    self.include(require(\"./arranger_view\"));\n    self.on(\"arrangerClick\", function(channel, beat) {\n      var patternIndex;\n      if (self.activeToolIndex() === 1) {\n        if (song.removePattern(channel, beat)) {\n          return self.unsaved(true);\n        }\n      } else {\n        patternIndex = self.activeInstrument();\n        if (song.canSet(channel, beat, patternIndex)) {\n          activePattern(song.patterns()[patternIndex]);\n          song.setPattern(channel, beat, patternIndex);\n          self.lastChannelIndex(channel);\n          return self.unsaved(true);\n        } else if ((patternIndex = song.patternAt(channel, beat)) != null) {\n          if (!self.playing()) {\n            self.patternMode(true);\n          }\n          return activePattern(song.patterns()[patternIndex]);\n        }\n      }\n    });\n    element.appendChild(self.arrangerElement());\n    animate(function() {\n      return self.trigger(\"draw\");\n    });\n    postmaster = Postmaster({\n      loadFile: function(blob) {\n        return blob.readAsJSON().then(self.fromJSON);\n      },\n      loadFromURL: self.loadFromURL\n    });\n    postmaster.invokeRemote(\"ready\")[\"catch\"](function(e) {\n      return console.warn(e.message);\n    });\n    return self;\n  };\n\n  animate = function(fn) {\n    var step;\n    step = function() {\n      var e;\n      try {\n        fn();\n      } catch (_error) {\n        e = _error;\n        debugger;\n        console.error(e);\n      }\n      return requestAnimationFrame(step);\n    };\n    return step();\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html,\\nbody {\\n  height: 100%;\\n}\\nbody {\\n  font-family: Sans-Serif;\\n  margin: 0;\\n  overflow: hidden;\\n}\\nbody > canvas {\\n  position: absolute;\\n  top: 45px;\\n  left: 0px;\\n}\\ncanvas {\\n  user-select: none;\\n}\\n.actions {\\n  background-color: #fff;\\n  border-bottom: 1px solid rgba(103,58,183,0.5);\\n  position: absolute;\\n  font-size: 14px;\\n  top: 0;\\n  left: 0;\\n  padding: 4px 4px 6px 4px;\\n  width: 100%;\\n}\\n.actions > button,\\n.actions > label {\\n  margin-right: 0.5em;\\n}\\n.actions > label {\\n  border: 1px solid #673ab7;\\n  border-radius: 4px;\\n  color: #673ab7;\\n  padding: 8px;\\n}\\n.actions > label:hover {\\n  background-color: #ffffe0;\\n}\\n.actions > label > input {\\n  border: none;\\n  background-color: rgba(103,58,183,0.19);\\n  border-left: 1px solid rgba(103,58,183,0.5);\\n  border-top: 1px solid rgba(103,58,183,0.5);\\n  color: inherit;\\n  font-size: 1em;\\n  padding-right: 4px;\\n  text-align: right;\\n  width: 30px;\\n}\\n.actions > label > input:focus {\\n  padding-right: 3px;\\n  margin-right: 1px;\\n}\\n.actions > label > h2 {\\n  display: inline;\\n  font-size: 1em;\\n  font-weight: normal;\\n}\\nbutton {\\n  background-color: #fff;\\n  border: 1px solid #673ab7;\\n  border-radius: 4px;\\n  color: #673ab7;\\n  cursor: pointer;\\n  font-size: inherit;\\n  line-height: 1em;\\n  padding: 9px 16px;\\n}\\nbutton:hover {\\n  background-color: #ffffe0;\\n}\\nbutton:active {\\n  background-color: #673ab7;\\n  color: #fff;\\n}\\n.tools {\\n  background-color: rgba(103,58,183,0.19);\\n  border-left: 1px solid rgba(103,58,183,0.5);\\n  width: 40px;\\n  height: 100%;\\n  position: absolute;\\n  right: 0;\\n  top: 45px;\\n}\\n.tools .tool {\\n  width: 40px;\\n  height: 40px;\\n  background-repeat: no-repeat;\\n  background-position: 50% 50%;\\n}\\n.tools > .eraser {\\n  background-image: url(\\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\\\");\\n}\\n.position {\\n  color: #673ab7;\\n  pointer-events: none;\\n  padding: 4px;\\n  position: absolute;\\n  right: 0px;\\n  top: 0px;\\n}\\n.arranger-wrap {\\n  border-top: 1px solid rgba(103,58,183,0.5);\\n  overflow-x: scroll;\\n  overflow-y: hidden;\\n  position: absolute;\\n  bottom: 0;\\n  left: 0;\\n  width: 100%;\\n  height: 94px;\\n}\\n#feedback {\\n  background-color: #673ab7;\\n  border: 2px solid #fff;\\n  border-top: 0;\\n  box-shadow: 1px 2px 5px #000;\\n  color: #fff;\\n  font-weight: bold;\\n  padding: 4px 0.5em;\\n  position: absolute;\\n  left: 700px;\\n  text-decoration: none;\\n  text-shadow: 1px 1px #000;\\n  top: 0;\\n  transition-property: padding-top;\\n  transition-duration: 0.25s;\\n}\\n#feedback:hover {\\n  padding-top: 1em;\\n}\\n\";",
      "type": "blob"
    },
    "templates/about": {
      "path": "templates/about",
      "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"about\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"h1\", this, {}, function(__root) {\n        __root.buffer(\"About\\n\");\n      }));\n      __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n        __root.buffer(\"Created by Daniel X. Moore\\n\");\n      }));\n      __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n        __root.buffer(\"TODO: Feedack\\n\");\n      }));\n      __root.buffer(__root.element(\"email\", this, {}, function(__root) {}));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
      "type": "blob"
    },
    "test/loader": {
      "path": "test/loader",
      "content": "(function() {\n  var loader;\n\n  loader = require(\"../lib/audio-loader\");\n\n  describe(\"Loader\", function() {\n    return it(\"should load array buffers\", function(done) {\n      return loader(\"https://addressable.s3.amazonaws.com/composer/data/f122a3a8f29ec09b0d61d0254022c0fc338240b3\").then(function(buffer) {\n        console.log(buffer);\n        return done();\n      })[\"catch\"](done);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "test/sample": {
      "path": "test/sample",
      "content": "(function() {\n  var Sample;\n\n  Sample = require(\"../sample\");\n\n  describe(\"Sample\", function() {\n    return it(\"should be able to load a sample pack\", function(done) {\n      return Sample.loadPack(require(\"../samples\")).then(function(samples) {\n        console.log(samples);\n        return done();\n      })[\"catch\"](done);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "test/song": {
      "path": "test/song",
      "content": "(function() {\n  var Pattern, Song;\n\n  Song = require(\"../song\");\n\n  Pattern = require(\"../pattern\");\n\n  describe(\"Song\", function() {\n    it(\"Should know it's size\", function() {\n      var song;\n      song = Song({\n        patterns: [\n          {\n            beats: 4\n          }\n        ]\n      });\n      return assert.equal(song.size(), 4, \"song.size() is \" + (song.size()));\n    });\n    it(\"Should know the correct size when the pattern has a different size\", function() {\n      var song;\n      song = Song({\n        patterns: [\n          {\n            beats: 10\n          }\n        ]\n      });\n      return assert.equal(song.size(), 10);\n    });\n    it(\"Should have ten patterns\", function() {\n      var song;\n      song = Song();\n      return assert.equal(song.toJSON().patterns.length, 10);\n    });\n    it(\"Should know it's tempo\", function() {\n      var song;\n      song = Song({\n        tempo: 54\n      });\n      return assert.equal(song.tempo(), 54);\n    });\n    it(\"Should return upcoming notes\", function() {\n      var song;\n      song = Song();\n      return assert.equal(song.upcomingNotes(0, 1).length, 0);\n    });\n    describe(\"With a single pattern\", function() {\n      var pattern, song;\n      pattern = Pattern({\n        notes: [0, 1, 2, 3].map(function(i) {\n          return [i, 0, 0];\n        })\n      });\n      song = Song({\n        channels: [\n          {\n            data: {\n              0: 0\n            }\n          }\n        ],\n        patterns: [pattern.I]\n      });\n      it(\"should return all the notes\", function() {\n        assert.equal(song.upcomingNotes(0, 1).length, 1);\n        assert.equal(song.upcomingNotes(1, 1).length, 1);\n        assert.equal(song.upcomingNotes(2, 1).length, 1);\n        assert.equal(song.upcomingNotes(3, 1).length, 1);\n        return assert.equal(song.upcomingNotes(0, 4).length, 4);\n      });\n      return it(\"shouldn't loop past the end\", function() {\n        assert.equal(song.upcomingNotes(4, 1).length, 0);\n        return assert.equal(song.upcomingNotes(0, 8).length, 4);\n      });\n    });\n    describe(\"With multiple patterns in parallel\", function() {\n      var pattern1, pattern2, song;\n      pattern1 = Pattern({\n        notes: [0, 1, 2, 3].map(function(i) {\n          return [i, 0, 0];\n        })\n      });\n      pattern2 = Pattern({\n        notes: [0, 1, 2, 3].map(function(i) {\n          return [i + 0.5, 0, 1];\n        })\n      });\n      song = Song({\n        channels: [\n          {\n            data: {\n              0: 0\n            }\n          }, {\n            data: {\n              0: 1\n            }\n          }\n        ],\n        patterns: [pattern1.I, pattern2.I]\n      });\n      it(\"should return all the notes\", function() {\n        assert.equal(song.upcomingNotes(0, 1).length, 2);\n        assert.equal(song.upcomingNotes(1, 1).length, 2);\n        assert.equal(song.upcomingNotes(2, 1).length, 2);\n        assert.equal(song.upcomingNotes(3, 1).length, 2);\n        return assert.equal(song.upcomingNotes(0, 4).length, 8);\n      });\n      return it(\"shouldn't loop past the end\", function() {\n        assert.equal(song.upcomingNotes(4, 1).length, 0);\n        return assert.equal(song.upcomingNotes(3, 2).length, 2);\n      });\n    });\n    describe(\"With two patterns in sequence\", function() {\n      var pattern1, song;\n      pattern1 = Pattern({\n        notes: [0, 1, 2, 3].map(function(i) {\n          return [i, 0, 0];\n        })\n      });\n      song = Song({\n        channels: [\n          {\n            data: {\n              0: 0,\n              4: 0\n            }\n          }\n        ],\n        patterns: [pattern1.I]\n      });\n      it(\"should return all the notes in short timesteps\", function() {\n        assert.equal(song.upcomingNotes(0, 1).length, 1);\n        assert.equal(song.upcomingNotes(1, 1).length, 1);\n        assert.equal(song.upcomingNotes(2, 1).length, 1);\n        assert.equal(song.upcomingNotes(3, 1).length, 1);\n        assert.equal(song.upcomingNotes(4, 1).length, 1);\n        assert.equal(song.upcomingNotes(5, 1).length, 1);\n        assert.equal(song.upcomingNotes(6, 1).length, 1);\n        return assert.equal(song.upcomingNotes(7, 1).length, 1);\n      });\n      it(\"should Work with larger timesteps\", function() {\n        assert.equal(song.upcomingNotes(0, 4).length, 4);\n        return assert.equal(song.upcomingNotes(4, 4).length, 4);\n      });\n      it(\"should cross pattern boundries\", function() {\n        return assert.equal(song.upcomingNotes(0, 8).length, 8);\n      });\n      it(\"shouldn't loop past the end\", function() {\n        assert.equal(song.upcomingNotes(8, 1).length, 0);\n        return assert.equal(song.upcomingNotes(0, 16).length, 8);\n      });\n      return it(\"should have the correct times for the later notes\", function() {\n        var notes;\n        notes = song.upcomingNotes(0, 16);\n        assert.equal(notes[4][0], 4);\n        notes = song.upcomingNotes(3, 16);\n        return assert.equal(notes[1][0], 1);\n      });\n    });\n    describe(\"#canSet\", function() {\n      return it(\"should allow placing a pattern if there is space, not if not\", function() {\n        var song;\n        song = Song({\n          patterns: [\n            {\n              beats: 8\n            }\n          ],\n          channels: [\n            {\n              data: {\n                0: 0,\n                8: 0\n              }\n            }\n          ]\n        });\n        assert(song.canSet(0, 16, 0));\n        return assert(!song.canSet(0, 15, 0));\n      });\n    });\n    return describe(\"#patternsDataAt\", function() {\n      return it(\"should get a pattern from each channel\", function() {\n        var song;\n        song = Song({\n          patterns: [\n            {\n              beats: 8\n            }, {\n              beats: 8\n            }\n          ],\n          channels: [\n            {\n              data: {\n                0: 0\n              }\n            }, {\n              data: {\n                7: 0\n              }\n            }\n          ]\n        });\n        assert.equal(song.patternsDataAt(0).compact().length, 1);\n        assert.equal(song.patternsDataAt(7).compact().length, 2);\n        return assert.equal(song.patternsDataAt(8).compact().length, 1);\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "tools": {
      "path": "tools",
      "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var editor, __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    editor = this;\n    __root.buffer(__root.element(\"div\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"actions\"]\n      }, function(__root) {\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.play\n        }, function(__root) {\n          __root.buffer(\"►\\n\");\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.patternPlay\n        }, function(__root) {\n          __root.buffer(\"P►\\n\");\n        }));\n        __root.buffer(__root.element(\"label\", this, {}, function(__root) {\n          __root.buffer(__root.element(\"h2\", this, {}, function(__root) {\n            __root.buffer(\"Tempo\\n\");\n          }));\n          __root.buffer(__root.element(\"input\", this, {\n            \"value\": this.tempo\n          }, function(__root) {}));\n        }));\n        __root.buffer(__root.element(\"label\", this, {}, function(__root) {\n          __root.buffer(__root.element(\"h2\", this, {}, function(__root) {\n            __root.buffer(\"Length\\n\");\n          }));\n          __root.buffer(__root.element(\"input\", this, {\n            \"value\": this.beats\n          }, function(__root) {}));\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.saveAs\n        }, function(__root) {\n          __root.buffer(\"Save\\n\");\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.loadSong\n        }, function(__root) {\n          __root.buffer(\"Load\\n\");\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.publish\n        }, function(__root) {\n          __root.buffer(\"Publish\\n\");\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.loadGistPrompt\n        }, function(__root) {\n          __root.buffer(\"Load Gist\\n\");\n        }));\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.exportAudio\n        }, function(__root) {\n          __root.buffer(\"Export\\n\");\n        }));\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"tools\"]\n      }, function(__root) {\n        var eraser;\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"instruments\"]\n        }, function(__root) {\n          this.samples.forEach(function(sample, i) {\n            var activate;\n            activate = function() {\n              editor.activeToolIndex(0);\n              editor.activeInstrument(i);\n              return editor.playNote(i);\n            };\n            return __root.buffer(__root.element(\"div\", this, {\n              \"class\": [\"tool\", \"instrument\"],\n              style: [\"background-image: url(\" + (sample.image.src.replace(/\\?.*/, '')) + \")\"],\n              \"click\": activate\n            }, function(__root) {}));\n          });\n        }));\n        eraser = function() {\n          return editor.activeToolIndex(1);\n        };\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"tool\", \"eraser\"],\n          \"click\": eraser\n        }, function(__root) {}));\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"position\"]\n      }, function(__root) {}));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
      "type": "blob"
    },
    "lib/loader": {
      "path": "lib/loader",
      "content": "\n/*\nLoad binary data and return a promise that will be fullflled with an ArrayBuffer\nor rejected with an error.\n */\n\n(function() {\n  module.exports = function(url) {\n    return new Promise(function(resolve, reject) {\n      var request;\n      request = new XMLHttpRequest();\n      request.open(\"GET\", url);\n      request.responseType = \"arraybuffer\";\n      request.onload = function() {\n        return resolve(request.response);\n      };\n      request.onerror = function() {\n        return reject(Error(\"Failed to load \" + url));\n      };\n      return request.send();\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var FeedbackTabTemplate, style;\n\n  require(\"analytics\").init(\"UA-3464282-15\");\n\n  require(\"cornerstone\");\n\n  require(\"jquery-utils\");\n\n  style = document.createElement(\"style\");\n\n  style.innerHTML = require(\"./style\");\n\n  document.head.appendChild(style);\n\n  global.player = require(\"./player\")();\n\n  FeedbackTabTemplate = require(\"./templates/feedback-tab\");\n\n  document.body.appendChild(FeedbackTabTemplate(\"https://docs.google.com/forms/d/e/1FAIpQLSeRz9rCsLJLacvpJNAtAPhj0AN0LM155INP01Y8Tt4k2pIlmA/viewform\"));\n\n}).call(this);\n",
      "type": "blob"
    },
    "templates/feedback-tab": {
      "path": "templates/feedback-tab",
      "content": "(function() {\n  module.exports = function(href) {\n    var tab;\n    tab = document.createElement('a');\n    tab.textContent = \"Feedback\";\n    tab.id = \"feedback\";\n    tab.href = href;\n    tab.target = \"_blank\";\n    return tab;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/audio-loader": {
      "path": "lib/audio-loader",
      "content": "(function() {\n  var context, loader;\n\n  loader = require(\"./loader\");\n\n  context = require(\"./audio-context\");\n\n  module.exports = function(url) {\n    return new Promise(function(resolve, reject) {\n      return loader(url).then(function(buffer) {\n        return context.decodeAudioData(buffer, resolve, reject);\n      });\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/audio-context": {
      "path": "lib/audio-context",
      "content": "(function() {\n  var AudioContext;\n\n  AudioContext = window.AudioContext || window.webkitAudioContext;\n\n  module.exports = new AudioContext;\n\n}).call(this);\n",
      "type": "blob"
    },
    "samples": {
      "path": "samples",
      "content": "(function() {\n  var base, samples;\n\n  base = \"https://addressable.s3.amazonaws.com/composer/data/\";\n\n  samples = {\n    synth: {\n      sample: \"f122a3a8f29ec09b0d61d0254022c0fc338240b3\",\n      sprite: \"e99777fe5a3c514d3ae7d9078cd705c6495838cc\"\n    },\n    piano: {\n      sample: \"b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6\",\n      sprite: \"dcac2056d205c401bbcf5939171ce6aa1d5bb0fe\"\n    },\n    guitar: {\n      sample: \"824188ae0fcf3cda0a508c563577a98efa6fe384\",\n      sprite: \"3518ee95f9f047ec45adbb47a964f7b6864fecc6\"\n    },\n    horn: {\n      sample: \"64916bf1576808add3711c647b3773a3d40eeaec\",\n      sprite: \"c68b9502dd74c020b11519a4c37562b724c255af\"\n    },\n    orch_hit: {\n      sample: \"b761c6d420c8af2309def0dc408c7ac98008dc5b\",\n      sprite: \"c98d94ab15a922c4ad96e719a02ea7e5eff3930b\"\n    },\n    drum: {\n      sample: \"d16a30a4d5ec1b32ccb98a048d5dc18d3592ddc7\",\n      sprite: \"cff35c7a508c1dc9e05d608a594bd88bbe0b6890\"\n    },\n    snare: {\n      sample: \"df1f06afcda30a67672e8ee054e306b7a459a94c\",\n      sprite: \"f738c3e6f1734e1c6216add824aa2db779876c2f\"\n    },\n    clap: {\n      sample: \"8a5e245b4149ddf0c15c887c1b4a40d94bab0f4e\",\n      sprite: \"191d6bc3012513af8957f4fef9b923c7c830ada1\"\n    },\n    cat: {\n      sample: \"06c7e53fcae1b07628357344e73ab1782353cd82\",\n      sprite: \"5d6a625888bd45ac1d9d33a86d7a0206709acbba\"\n    },\n    dog: {\n      sample: \"ef7e42d463e8994c5bd8b84256f4dade3faf32fb\",\n      sprite: \"88e70bd36b7aba07b64a8cfb626b8002fa214772\"\n    }\n  };\n\n  module.exports = Object.keys(samples).map(function(name, i) {\n    var sample;\n    sample = samples[name];\n    sample.name = name;\n    sample.index = i;\n    return sample;\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "sample": {
      "path": "sample",
      "content": "(function() {\n  var Sample, bufferLoader, getImage, urlFor;\n\n  bufferLoader = require(\"./lib/audio-loader\");\n\n  urlFor = function(sha) {\n    var i, n;\n    n = 4;\n    i = parseInt(sha.slice(-1), 0x10) % n;\n    return \"https://a\" + i + \".pixiecdn.com/composer/data/\" + sha + \"?xdomain\";\n  };\n\n  getImage = function(url) {\n    var image;\n    image = new Image;\n    image.crossOrigin = true;\n    image.src = url;\n    return image;\n  };\n\n  module.exports = Sample = function(I) {\n    var self;\n    if (I == null) {\n      I = {};\n    }\n    self = {\n      image: getImage(I.spriteURL),\n      buffer: null\n    };\n    return self;\n  };\n\n  Sample.load = function(data) {\n    var sample, sprite;\n    sprite = data.sprite, sample = data.sample;\n    return bufferLoader(urlFor(sample)).then(function(buffer) {\n      return {\n        buffer: buffer,\n        image: getImage(urlFor(sprite))\n      };\n    });\n  };\n\n  Sample.loadPack = function(samplePack) {\n    return Promise.all(samplePack.map(Sample.load));\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "song": {
      "path": "song",
      "content": "\n/*\nSong\n====\n\nA song has a tempo, a number of channels, and a number of patterns.\n\nPatterns are placed in the channels.\n */\n\n(function() {\n  var Channel, Pattern;\n\n  require(\"cornerstone\");\n\n  Channel = require(\"./channel\");\n\n  Pattern = require(\"./pattern\");\n\n  module.exports = function(I, self) {\n    var initPatterns, numPatterns;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    defaults(I, {\n      channels: [\n        {\n          data: {\n            0: 0\n          }\n        }, {}, {}, {}\n      ],\n      patterns: [{}],\n      tempo: 90\n    });\n    self.attrObservable(\"tempo\");\n    self.attrModels(\"channels\", Channel);\n    self.attrModels(\"patterns\", Pattern);\n    numPatterns = 10;\n    initPatterns = function() {\n      var _i, _results;\n      (function() {\n        _results = [];\n        for (var _i = 0; 0 <= numPatterns ? _i < numPatterns : _i > numPatterns; 0 <= numPatterns ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(n) {\n        var _base;\n        return (_base = self.patterns())[n] != null ? _base[n] : _base[n] = Pattern();\n      });\n      return self.patterns(self.patterns().copy());\n    };\n    initPatterns();\n    self.extend({\n      channelPatterns: function(n) {\n        return self.channels.get(n).patterns(self.patterns());\n      },\n      setPattern: function(channel, beat, patternIndex) {\n        return self.channels.get(channel).setPattern(beat, patternIndex);\n      },\n      canSet: function(channel, beat, patternIndex) {\n        return self.channels.get(channel).canSet(beat, patternIndex, self.patterns());\n      },\n      patternAt: function(channel, beat) {\n        return self.channels.get(channel).patternAt(beat, self.patterns());\n      },\n      patternsDataAt: function(beat) {\n        return self.channels().map(function(channel) {\n          return channel.patternDataAt(beat, self.patterns()).first();\n        });\n      },\n      removePattern: function(channel, beat) {\n        return self.channels.get(channel).removePattern(beat, self.patterns());\n      },\n      upcomingNotes: function(t, dt) {\n        var patterns;\n        patterns = self.patterns();\n        return self.channels.map(function(channel) {\n          return channel.upcomingNotes(t, dt, patterns);\n        }).flatten();\n      },\n      size: function() {\n        return self.channels().map(function(channel) {\n          return channel.size(self.patterns());\n        }).maximum();\n      },\n      fromJSON: function(data) {\n        var _i, _results;\n        if (data.patterns != null) {\n          self.patterns(data.patterns.map(function(data) {\n            return Pattern(data);\n          }));\n          self.channels(data.channels.map(function(data) {\n            return Channel(data);\n          }));\n        } else {\n          self.patterns((function() {\n            _results = [];\n            for (var _i = 0; 0 <= numPatterns ? _i < numPatterns : _i > numPatterns; 0 <= numPatterns ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).map(function(i) {\n            if (i === 0) {\n              return Pattern({\n                beats: parseInt(data.beats, 10),\n                notes: data.notes\n              });\n            } else {\n              return Pattern();\n            }\n          }));\n          self.channels([\n            {\n              data: {\n                0: 0\n              }\n            }, {}, {}, {}\n          ].map(function(channelData) {\n            return Channel(channelData);\n          }));\n        }\n        initPatterns();\n        self.tempo(data.tempo);\n        return self;\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "data/demo": {
      "path": "data/demo",
      "content": "module.exports = {\"channels\":[{\"data\":{\"0\":0,\"8\":3,\"16\":0,\"24\":4,\"32\":1,\"40\":5,\"48\":8,\"60\":9,\"64\":8,\"76\":6}},{\"data\":{\"0\":2,\"4\":2,\"8\":2,\"12\":2,\"16\":2,\"20\":2,\"24\":2,\"28\":2,\"48\":2,\"52\":2,\"56\":2,\"64\":2,\"68\":2,\"72\":2,\"76\":2}},{\"data\":{}},{\"data\":{}}],\"patterns\":[{\"beats\":8,\"notes\":[[0,10,0],[0,7,0],[3.25,10,0],[3.75,10,0],[4,9,0],[4,5,0],[4.75,5,0],[7,5,0],[7.5,7,0],[3.5,12,0],[7,-4,0],[7.5,-2,0]]},{\"beats\":8,\"notes\":[[0,5,0],[0.5,5,0],[0.5,3,0],[1,2,0],[1,5,0],[1.5,0,0],[1.5,5,0],[2,7,0],[2.5,8,0],[3,7,0],[3.5,5,0],[2,-1,0],[2.5,-1,0],[3,0,0],[3.5,2,0],[0,-9,2],[0.5,-9,2],[1,-9,2],[1.5,-9,2],[1.75,-5,2],[2.25,-5,2],[3.5,-5,2],[3,-5,2],[2.75,-5,2],[4,0,0],[4,3,0],[5,2,0],[5,5,0],[6,3,0],[6,7,0],[4,0,2],[4.5,0,2],[5,0,2],[5.5,0,2],[5.75,-2,2],[6.25,-2,2],[6.75,-2,2],[7,-2,2],[7.5,-2,2],[6.75,10,0],[6.75,7,0]]},{\"beats\":4,\"notes\":[[0,-9,2],[0.5,-9,2],[1,-9,2],[1.75,-9,2],[2.25,-9,2],[2.75,-9,2],[3,-9,2],[3.5,-9,2]]},{\"beats\":8,\"notes\":[[0,-1,0],[0,8,0],[3.25,8,0],[3.5,10,0],[3.75,8,0],[4,3,0],[4,7,0],[4.75,7,0],[4.75,15,0]]},{\"beats\":8,\"notes\":[[0,-1,0],[0,8,0],[3.25,8,0],[3.25,-1,0],[3.5,7,0],[3.5,-2,0],[3.75,5,0],[3.75,-4,0],[4,3,0],[4,-5,0]]},{\"beats\":8,\"notes\":[[0,12,0],[0.5,15,0],[0.5,10,0],[1,9,0],[1,15,0],[1.5,15,0],[1.5,7,0],[2,6,0],[2,14,0],[2.5,6,0],[3,7,0],[3.5,9,0],[3.5,12,0],[3,11,0],[2.5,12,0],[0,-3,2],[0.5,-3,2],[1,-3,2],[1.5,-3,2],[1.75,2,2],[2.25,2,2],[2.75,2,2],[3,2,2],[3.5,2,2],[4,-5,2],[4.5,-5,2],[5,-3,2],[5.5,-3,2],[6,-1,2],[6.5,-1,2],[7.25,-2,2],[7.25,2,0],[7.25,8,0],[7.25,10,0],[4,11,0],[4,14,0],[5,12,0],[5,15,0],[6,14,0],[6,17,0]]},{\"beats\":4,\"notes\":[[0,7,0],[0,-2,0],[0.25,5,0],[0.25,-4,0],[0.5,3,0],[0.5,-6,0]]},{\"beats\":4,\"notes\":[]},{\"beats\":12,\"notes\":[[0.5,12,0],[1.25,10,0],[1.25,19,0],[2,15,0],[2,7,0],[2.75,10,0],[2.75,3,0],[4,9,0],[4.5,9,0],[5,9,0],[5.5,9,0],[5.75,9,0],[5.75,17,0],[7,5,0],[7.5,7,0],[8,8,0],[4,5,0],[8.5,11,0],[8.5,15,0],[9.25,11,0],[9.25,8,0],[10,8,0],[10,-1,0],[10.75,3,0],[10.75,-4,0],[11.5,-1,0],[11.5,5,0]]},{\"beats\":4,\"notes\":[[0,-2,0],[0,7,0],[0,-9,2],[0.5,-9,2],[1,-9,2],[1.5,-9,2],[1.75,-2,2],[2.25,-2,2],[2.75,-2,2],[3,-2,2],[3.5,-2,2]]}],\"tempo\":\"120\"};",
      "type": "blob"
    },
    "lib/gist": {
      "path": "lib/gist",
      "content": "(function() {\n  var base;\n\n  base = \"https://api.github.com/gists\";\n\n  module.exports = {\n    save: function(data) {\n      data = {\n        description: \"A song created with \" + window.location,\n        \"public\": true,\n        files: {\n          \"data.json\": {\n            content: JSON.stringify(data)\n          }\n        }\n      };\n      return $.ajax(base, {\n        headers: {\n          Accept: \"application/vnd.github.v3+json\"\n        },\n        contentType: \"application/json; charset=utf-8\",\n        data: JSON.stringify(data),\n        dataType: \"json\",\n        type: \"POST\"\n      }).then(function(result) {\n        return result.id;\n      });\n    },\n    load: function(gistId) {\n      return $.get(\"\" + base + \"/\" + gistId).then(function(data) {\n        var _ref, _ref1;\n        data = ((_ref = data.files[\"data.json\"]) != null ? _ref.content : void 0) || ((_ref1 = data.files[\"pattern0.json\"]) != null ? _ref1.content : void 0);\n        if (data) {\n          return JSON.parse(data);\n        } else {\n          return alert(\"Failed to load gist with id: \" + gistId);\n        }\n      });\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "colors": {
      "path": "colors",
      "content": "(function() {\n  module.exports = {\n    LIGHT: \"rgba(103, 58, 183, 0.19)\",\n    DARK: \"rgba(103, 58, 183, 0.5)\",\n    CURSOR: \"#F0F\"\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "player-audio": {
      "path": "player-audio",
      "content": "\n/*\nPlayer Audio\n============\n\nMain audio loop\n\nPlays a \"Playable\". Playables have an `upcomingSounds` method that returns an\narray of notes to be played with beat offsets.\n\nNeeds tempo, playable, start beat, end beat, looping mode to play.\n\nProvides playTime and playing methods.\n */\n\n(function() {\n  var context;\n\n  context = require(\"./lib/audio-context\");\n\n  module.exports = function(I, self) {\n    var minute, playLoop, playTime, playUpcomingSounds, playing, scheduleSound, timestep;\n    playing = false;\n    playTime = 0;\n    timestep = 1 / 60;\n    minute = 60;\n    scheduleSound = function(_arg) {\n      var instrument, note, time;\n      time = _arg[0], note = _arg[1], instrument = _arg[2];\n      return self.playNote(instrument, note, time * minute / self.tempo());\n    };\n    playUpcomingSounds = function(current, dt) {\n      return self.upcomingSounds(current, dt).forEach(function(note) {\n        return scheduleSound(note);\n      });\n    };\n    playLoop = function() {\n      var dt;\n      if (playing) {\n        dt = timestep * self.tempo() / minute;\n        playUpcomingSounds(playTime, dt);\n        playTime += dt;\n        if (playTime >= self.size()) {\n          if (self.loop()) {\n            dt = playTime - self.size();\n            playUpcomingSounds(0, dt);\n            playTime = dt;\n          } else {\n            playTime = 0;\n            playing = false;\n          }\n        }\n      }\n      return requestAnimationFrame(playLoop);\n    };\n    playLoop();\n    return self.extend({\n      exportSong: function(song) {\n        var audioChannels, beats, bpm, lengthInSeconds, offlineContext, samplesPerSecond;\n        beats = song.size();\n        bpm = song.tempo();\n        audioChannels = 1;\n        samplesPerSecond = 44100;\n        lengthInSeconds = 60 * (beats / bpm) + 3;\n        offlineContext = new OfflineAudioContext(audioChannels, samplesPerSecond * lengthInSeconds, samplesPerSecond);\n        return new Promise(function(resolve, reject) {\n          var dt, t, work;\n          t = 0;\n          dt = 1;\n          work = function() {\n            console.log(\"rendering: \" + t);\n            song.upcomingNotes(t, dt).forEach(function(_arg) {\n              var instrument, note, time;\n              time = _arg[0], note = _arg[1], instrument = _arg[2];\n              return self.playNote(instrument, note, t + time * minute / self.tempo(), offlineContext);\n            });\n            t += 1;\n            if (t <= beats) {\n              return setTimeout(work, 0);\n            } else {\n              return offlineContext.startRendering().then(resolve, reject);\n            }\n          };\n          return work();\n        }).then(function(buffer) {\n          return self.audioBufferToWave(buffer);\n        }).then(function(blob) {\n          var a, url;\n          url = window.URL.createObjectURL(blob);\n          a = document.createElement(\"a\");\n          a.href = url;\n          a.download = \"song.wav\";\n          a.click();\n          return window.URL.revokeObjectURL(url);\n        });\n      },\n      audioBufferToWave: function(audioBuffer) {\n        return new Promise(function(resolve, reject) {\n          var pcmArrays, worker, workerSource;\n          workerSource = new Blob([PACKAGE.distribution[\"lib/wave-worker\"].content], {\n            type: \"application/javascript\"\n          });\n          worker = new Worker(URL.createObjectURL(workerSource));\n          worker.onmessage = function(e) {\n            var blob;\n            blob = new Blob([e.data.buffer], {\n              type: \"audio/wav\"\n            });\n            return resolve(blob);\n          };\n          pcmArrays = [audioBuffer.getChannelData(0)];\n          return worker.postMessage({\n            pcmArrays: pcmArrays,\n            config: {\n              sampleRate: audioBuffer.sampleRate\n            }\n          });\n        });\n      },\n      playNote: function(instrument, note, time, _context) {\n        var buffer;\n        buffer = self.samples.get(instrument).buffer;\n        return self.playBufferNote(buffer, note, time, _context || context);\n      },\n      playBufferNote: function(buffer, note, time, context) {\n        var rate;\n        if (note == null) {\n          note = 0;\n        }\n        if (time == null) {\n          time = 0;\n        }\n        rate = Math.pow(2, note / 12);\n        return self.playBuffer(buffer, rate, time, context);\n      },\n      playBuffer: function(buffer, rate, time, context) {\n        var source;\n        if (rate == null) {\n          rate = 1;\n        }\n        if (time == null) {\n          time = 0;\n        }\n        source = context.createBufferSource();\n        source.buffer = buffer;\n        source.connect(context.destination);\n        source.start(time + context.currentTime);\n        return source.playbackRate.value = rate;\n      },\n      playTime: function() {\n        return playTime;\n      },\n      playing: function() {\n        return playing;\n      },\n      pause: function() {\n        return playing = !playing;\n      },\n      play: function() {\n        if (self.patternMode()) {\n          playTime = 0;\n        }\n        self.pause();\n        return self.patternMode(false);\n      },\n      reset: function() {\n        playing = false;\n        playTime = 0;\n        return self.activePattern(self.patterns.get(0));\n      },\n      patternPlay: function() {\n        self.pause();\n        playTime = 0;\n        return self.patternMode(true);\n      },\n      loop: function() {\n        return true;\n      }\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/wave-worker": {
      "path": "lib/wave-worker",
      "content": "// https://stackoverflow.com/a/42632646/68210\r\n\r\nself.onmessage = function( e ){\r\n  var wavPCM = new WavePCM( e['data']['config'] );\r\n  wavPCM.record( e['data']['pcmArrays'] );\r\n  wavPCM.requestData();\r\n};\r\n\r\nvar WavePCM = function( config ){\r\n  this.sampleRate = config['sampleRate'] || 48000;\r\n  this.bitDepth = config['bitDepth'] || 16;\r\n  this.recordedBuffers = [];\r\n  this.bytesPerSample = this.bitDepth / 8;\r\n};\r\n\r\nWavePCM.prototype.record = function( buffers ){\r\n  this.numberOfChannels = this.numberOfChannels || buffers.length;\r\n  var bufferLength = buffers[0].length;\r\n  var reducedData = new Uint8Array( bufferLength * this.numberOfChannels * this.bytesPerSample );\r\n\r\n  // Interleave\r\n  for ( var i = 0; i < bufferLength; i++ ) {\r\n    for ( var channel = 0; channel < this.numberOfChannels; channel++ ) {\r\n\r\n      var outputIndex = ( i * this.numberOfChannels + channel ) * this.bytesPerSample;\r\n      var sample = buffers[ channel ][ i ];\r\n\r\n      // Check for clipping\r\n      if ( sample > 1 ) {\r\n        sample = 1;\r\n      }\r\n\r\n      else if ( sample < -1 ) {\r\n        sample = -1;\r\n      }\r\n\r\n      // bit reduce and convert to uInt\r\n      switch ( this.bytesPerSample ) {\r\n        case 4:\r\n          sample = sample * 2147483648;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          reducedData[ outputIndex + 2 ] = sample >> 16;\r\n          reducedData[ outputIndex + 3 ] = sample >> 24;\r\n          break;\r\n\r\n        case 3:\r\n          sample = sample * 8388608;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          reducedData[ outputIndex + 2 ] = sample >> 16;\r\n          break;\r\n\r\n        case 2:\r\n          sample = sample * 32768;\r\n          reducedData[ outputIndex ] = sample;\r\n          reducedData[ outputIndex + 1 ] = sample >> 8;\r\n          break;\r\n\r\n        case 1:\r\n          reducedData[ outputIndex ] = ( sample + 1 ) * 128;\r\n          break;\r\n\r\n        default:\r\n          throw \"Only 8, 16, 24 and 32 bits per sample are supported\";\r\n      }\r\n    }\r\n  }\r\n\r\n  this.recordedBuffers.push( reducedData );\r\n};\r\n\r\nWavePCM.prototype.requestData = function(){\r\n  var bufferLength = this.recordedBuffers[0].length;\r\n  var dataLength = this.recordedBuffers.length * bufferLength;\r\n  var headerLength = 44;\r\n  var wav = new Uint8Array( headerLength + dataLength );\r\n  var view = new DataView( wav.buffer );\r\n\r\n  view.setUint32( 0, 1380533830, false ); // RIFF identifier 'RIFF'\r\n  view.setUint32( 4, 36 + dataLength, true ); // file length minus RIFF identifier length and file description length\r\n  view.setUint32( 8, 1463899717, false ); // RIFF type 'WAVE'\r\n  view.setUint32( 12, 1718449184, false ); // format chunk identifier 'fmt '\r\n  view.setUint32( 16, 16, true ); // format chunk length\r\n  view.setUint16( 20, 1, true ); // sample format (raw)\r\n  view.setUint16( 22, this.numberOfChannels, true ); // channel count\r\n  view.setUint32( 24, this.sampleRate, true ); // sample rate\r\n  view.setUint32( 28, this.sampleRate * this.bytesPerSample * this.numberOfChannels, true ); // byte rate (sample rate * block align)\r\n  view.setUint16( 32, this.bytesPerSample * this.numberOfChannels, true ); // block align (channel count * bytes per sample)\r\n  view.setUint16( 34, this.bitDepth, true ); // bits per sample\r\n  view.setUint32( 36, 1684108385, false); // data chunk identifier 'data'\r\n  view.setUint32( 40, dataLength, true ); // data chunk length\r\n\r\n  for (var i = 0; i < this.recordedBuffers.length; i++ ) {\r\n    wav.set( this.recordedBuffers[i], i * bufferLength + headerLength );\r\n  }\r\n\r\n  self.postMessage( wav, [wav.buffer] );\r\n  self.close();\r\n};\r\n",
      "type": "blob"
    },
    "lib/jadelet-runtime": {
      "path": "lib/jadelet-runtime",
      "content": "!function(n){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=n();else if(\"function\"==typeof define&&define.amd)define([],n);else{(\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this).JadeletRuntime=n()}}(function(){return function n(e,t,r){function o(i,c){if(!t[i]){if(!e[i]){var f=\"function\"==typeof require&&require;if(!c&&f)return f(i,!0);if(u)return u(i,!0);var l=new Error(\"Cannot find module '\"+i+\"'\");throw l.code=\"MODULE_NOT_FOUND\",l}var a=t[i]={exports:{}};e[i][0].call(a.exports,function(n){var t=e[i][1][n];return o(t||n)},a,a.exports,n,e,t,r)}return t[i].exports}for(var u=\"function\"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(n,e,t){(function(){\"use strict\";var t,r,o,u,i,c,f,l,a,s,d,p,v,h,g,y,b,m,E,O,_,x,w,A,C;t=n(\"o_0\"),a=new WeakMap,s=new WeakMap,_=function(n){var e;e=s.get(n)||0,s.set(n,e+1)},O=function(n){var e;e=s.get(n)||0,--e>0?s.set(n,e):(s.delete(n),l(n))},l=function(n){var e,t;null!=(e=n.children)&&Array.prototype.forEach.call(e,l),null!=(t=a.get(n))&&t.forEach(function(e){e(),a.delete(n)})},o=function(n,e){var t;(t=a.get(n))?t.push(e):a.set(n,[e])},p=/^on(touch|animation|transition)(start|iteration|move|end|cancel)$/,h=function(n,e){return n.match(p)||n in e},A=function(n,e,t){switch(n.nodeName){case\"SELECT\":n.oninput=n.onchange=function(){var n,t,r;n=(t=this.children[this.selectedIndex]).value,r=t._value,\"function\"==typeof e&&e(r||n)},i(n,e,t,function(e){var t;n._value=e,(t=n._options)?null!=e.value?n.value=(\"function\"==typeof e.value?e.value():void 0)||e.value:n.selectedIndex=C(t,e):n.value=e});break;default:n.oninput=n.onchange=function(){\"function\"==typeof e&&e(n.value)},i(n,e,t,function(e){n.value!==e&&(n.value=e)})}},x={INPUT:{checked:function(n,e,t){return n.onchange=function(){\"function\"==typeof e&&e(n.checked)},i(n,e,t,function(e){n.checked=e})}},SELECT:{options:function(n,e,t){i(n,e,t,function(e){d(n),n._options=e,e.map(function(e,t){var r,o,u;return r=f(\"option\"),r._value=e,u=g(e)?(null!=e?e.value:void 0)||t:e.toString(),i(r,u,e,function(n){r.value=n}),o=(null!=e?e.name:void 0)||e,i(r,o,e,function(n){r.textContent=n}),n.appendChild(r),e===n._value&&(n.selectedIndex=t),r})})}}},b=function(n,e,t,r){var o,c,f;c=n.nodeName,\"value\"===t?A(n,r):(o=null!=(f=x[c])?f[t]:void 0)?o(n,r,e):t.match(/^on/)&&h(t,n)?u(n,t.substr(2),r,e):h(\"on\"+t,n)?u(n,t,r,e):i(n,r,e,function(e){null!=e&&!1!==e?n.setAttribute(t,e):n.removeAttribute(t)})},m=function(n,e,t){c(n,e,t,\"id\",function(e){var t;t=e[e.length-1],e.length?n.id=t:n.removeAttribute(\"id\")}),c(n,e,t,\"class\",function(e){n.className=e.join(\" \")}),c(n,e,t,\"style\",function(e){n.removeAttribute(\"style\"),e.forEach(function(e){return g(e)?Object.assign(n.style,e):n.setAttribute(\"style\",e)})}),Object.keys(t).forEach(function(r){b(n,e,r,t[r])})},i=function(n,e,r,u){var i;i=t(function(){u(v(e,r))}),o(n,i.releaseDependencies)},u=function(n,e,t,r){\"function\"==typeof t&&n.addEventListener(e,t.bind(r))},c=function(n,e,t,r,o){var u;null!=(u=t[r])&&(delete t[r],i(n,function(){return w(u,e)},e,o))},E=function(n,e,t){var r;r=function(e){null==e||(\"function\"==typeof e.forEach?e.forEach(r):e instanceof Node?(_(e),n.appendChild(e)):n.appendChild(document.createTextNode(e)))},i(n,function(){var n;return n=[],t.call(e,{buffer:function(t){n.push(v(t,e))},element:y}),n},e,function(e){d(n),e.forEach(r)})},y=function(n,e,t,r){var o;return o=f(n),m(o,e,t),\"SELECT\"!==o.nodeName&&E(o,e,r),o},(r=function(n){var e;return e={buffer:function(n){if(e.root)throw new Error(\"Cannot have multiple root elements\");e.root=n},element:y}}).Observable=t,r._elementCleaners=a,r._dispose=l,r.retain=_,r.release=O,e.exports=r,f=function(n){return document.createElement(n)},d=function(n){for(var e;e=n.firstChild;)n.removeChild(e),O(e)},g=function(n){return\"object\"==typeof n},C=function(n,e){return g(e)?n.indexOf(e):n.map(function(n){return n.toString()}).indexOf(e.toString())},w=function(n,e){return n.map(function(n){return v(n,e)}).reduce(function(n,e){return n.concat(v(e))},[]).filter(function(n){return null!=n})},v=function(n,e){return\"function\"==typeof n?n.call(e):n}}).call(this)},{o_0:2}],2:[function(n,e,t){(function(n){(function(){\"use strict\";var t,r,o,u,i,c,f,l,a=[].slice;e.exports=function(n,e){var u,s,d,p,v;return\"function\"==typeof(null!=n?n.observe:void 0)?n:(d=[],p=function(n){return r(d).forEach(function(e){return e(n)})},\"function\"==typeof n?(s=n,(v=function(){return i(v),n}).releaseDependencies=function(){var n;return null!=(n=v._observableDependencies)?n.forEach(function(n){return n.stopObserving(u)}):void 0},(u=function(){var t;return t=new Set,n=l(t,s,e),v.releaseDependencies(),v._observableDependencies=t,t.forEach(function(n){return n.observe(u)}),p(n)})()):(v=function(e){return arguments.length>0?n!==e&&(n=e,p(e)):i(v),n}).releaseDependencies=c,Array.isArray(n)&&([\"concat\",\"every\",\"filter\",\"forEach\",\"indexOf\",\"join\",\"lastIndexOf\",\"map\",\"reduce\",\"reduceRight\",\"slice\",\"some\"].forEach(function(e){return v[e]=function(){var t;return t=1<=arguments.length?a.call(arguments,0):[],i(v),n[e].apply(n,t)}}),[\"pop\",\"push\",\"reverse\",\"shift\",\"splice\",\"sort\",\"unshift\"].forEach(function(e){return v[e]=function(){var t,r;return t=1<=arguments.length?a.call(arguments,0):[],r=n[e].apply(n,t),p(n),r}}),t&&Object.defineProperty(v,\"length\",{get:function(){return i(v),n.length},set:function(e){var t;return t=n.length=e,p(n),t}}),o(v,{remove:function(e){var t,r;if((t=n.indexOf(e))>=0)return r=n.splice(t,1)[0],p(n),r},get:function(e){return i(v),n[e]},first:function(){return i(v),n[0]},last:function(){return i(v),n[n.length-1]},size:function(){return i(v),n.length}})),o(v,{listeners:d,observe:function(n){return d.push(n)},stopObserving:function(n){return f(d,n)},toggle:function(){return v(!n)},increment:function(e){return null==e&&(e=1),v(n+e)},decrement:function(e){return null==e&&(e=1),v(n-e)},toString:function(){return\"Observable(\"+n+\")\"}}),v)},o=Object.assign,n.OBSERVABLE_ROOT_HACK=[],i=function(e){var t;if(t=u(n.OBSERVABLE_ROOT_HACK))return t.add(e)},l=function(e,t,r){n.OBSERVABLE_ROOT_HACK.push(e);try{return t.call(r)}finally{n.OBSERVABLE_ROOT_HACK.pop()}},f=function(n,e){var t;if((t=n.indexOf(e))>=0)return n.splice(t,1)[0]},r=function(n){return n.concat([])},u=function(n){return n[n.length-1]},c=function(){};try{Object.defineProperty(function(){},\"length\",{get:c,set:c}),t=!0}catch(n){t=!1}}).call(this)}).call(this,\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:\"undefined\"!=typeof window?window:{})},{}]},{},[1])(1)});\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {
    "title": "Mario Paint Music Composer - danielx.net",
    "description": "This Mario Paint inspired composer tool is easy and fun. You can create simple and\nbeautiful songs right in your browser and share them with the world!",
    "version": "0.1.0",
    "publish": {
      "s3": {
        "basePath": "public/danielx.net"
      }
    },
    "remoteDependencies": [
      "https://code.jquery.com/jquery-1.11.0.min.js"
    ],
    "dependencies": {
      "ajax": "distri/ajax:v0.1.5-pre.0",
      "analytics": "distri/google-analytics:v0.1.0",
      "cornerstone": "distri/cornerstone:v0.3.0-pre.2",
      "hotkeys": "distri/hotkeys:v0.2.0",
      "jquery-utils": "distri/jquery-utils:v0.2.0",
      "observable": "distri/observable:v0.3.8",
      "postmaster": "distri/postmaster:v0.5.1",
      "touch-canvas": "distri/touch-canvas:v0.3.1",
      "ui": "STRd6/ui:master"
    }
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://code.jquery.com/jquery-1.11.0.min.js"
  ],
  "repository": {
    "branch": "export",
    "default_branch": "master",
    "full_name": "STRd6/composer",
    "homepage": null,
    "description": "Compose music on the internets?",
    "html_url": "https://github.com/STRd6/composer",
    "url": "https://api.github.com/repos/STRd6/composer",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "ajax": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2016 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "# ajax\n\nA Promise returning wrapper for XMLHttpRequest\n\nThis aims to be a very small and very direct wrapper for XMLHttpRequest. We\nreturn a native promise and configure the requets via an options object.\n\n\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "{extend, defaults} = require \"./util\"\n\nrequire \"./shims\"\n\nmodule.exports = ->\n  ajax = (options={}) ->\n    {data, headers, method, overrideMimeType, password, url, responseType, timeout, user, withCredentials} = options\n    data ?= \"\"\n    method ?= \"GET\"\n    password ?= \"\"\n    responseType ?= \"\"\n    timeout ?= 0\n    user ?= \"\"\n    withCredentials ?= false\n\n    new ProgressPromise (resolve, reject, progress) ->\n      xhr = new XMLHttpRequest()\n      xhr.open(method, url, true, user, password)\n      xhr.responseType = responseType\n      xhr.timeout = timeout\n      xhr.withCredentialls = withCredentials\n\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      if overrideMimeType\n        xhr.overrideMimeType overrideMimeType\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          resolve this.response\n          complete e, xhr, options\n        else\n          reject xhr\n          complete e, xhr, options\n\n      xhr.onerror = (e) ->\n        reject xhr\n        complete e, xhr, options\n\n      xhr.onprogress = progress\n\n      xhr.send(data)\n\n  complete = (args...) ->\n    completeHandlers.forEach (handler) ->\n      handler args...\n\n  configure = (optionDefaults) ->\n    (url, options={}) ->\n      if typeof url is \"object\"\n        options = url\n      else\n        options.url = url\n\n      defaults options, optionDefaults\n\n      ajax(options)\n\n  completeHandlers = []\n\n  extend ajax,\n    ajax: configure {}\n    complete: (handler) ->\n      completeHandlers.push handler\n\n    getJSON: configure\n      responseType: \"json\"\n\n    getBlob: configure\n      responseType: \"blob\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.5-pre.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "Ajax = require \"../main\"\n\ndescribe \"Ajax\", ->\n  it \"should provide progress\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .progress (e) ->\n      console.log e\n    .then (data) ->\n      assert data[0].id is 1\n      done()\n\n  it \"should getJSON\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n\n  it \"should have complete handlers\", (done) ->\n    ajax = Ajax()\n\n    ajax.complete (e, xhr, options) ->\n      done()\n\n    ajax.getJSON(\"https://api.github.com/users\")\n\n\n  it \"should work with options only\", (done) ->\n    ajax = Ajax()\n\n    ajax.getJSON(url: \"https://api.github.com/users\")\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n",
          "mode": "100644",
          "type": "blob"
        },
        "util.coffee": {
          "path": "util.coffee",
          "content": "module.exports =\n  defaults: (target, objects...) ->\n    for object in objects\n      for name of object\n        unless target.hasOwnProperty(name)\n          target[name] = object[name]\n\n    return target\n\n  extend: (target, sources...) ->\n    for source in sources\n      for name of source\n        target[name] = source[name]\n\n    return target\n",
          "mode": "100644",
          "type": "blob"
        },
        "shims.coffee": {
          "path": "shims.coffee",
          "content": "# Extend promises with `finally`\n# From: https://github.com/domenic/promises-unwrapping/issues/18\nPromise.prototype.finally ?= (callback) ->\n  # We don’t invoke the callback in here,\n  # because we want then() to handle its exceptions\n  this.then(\n    # Callback fulfills: pass on predecessor settlement\n    # Callback rejects: pass on rejection (=omit 2nd arg.)\n    (value) ->\n      Promise.resolve(callback())\n      .then -> return value\n    (reason) ->\n      Promise.resolve(callback())\n      .then -> throw reason\n  )\n\n# HACK: I really would prefer not to modify the native Promise prototype, but I\n# know no other way...\n\nPromise.prototype._notify ?= (event) ->\n  @_progressHandlers.forEach (handler) ->\n    try\n      handler(event)\n\nPromise.prototype.progress ?= (handler) ->\n  @_progressHandlers ?= []\n  @_progressHandlers.push handler\n\n  return this\n\nglobal.ProgressPromise = (fn) ->\n  p = new Promise (resolve, reject) ->\n    notify = ->\n      p._progressHandlers?.forEach (handler) ->\n        try\n          handler(event)\n\n    fn(resolve, reject, notify)\n\n  p.then = (onFulfilled, onRejected) ->\n    result = Promise.prototype.then.call(p, onFulfilled, onRejected)\n    # Pass progress through\n    p.progress result._notify.bind(result)\n\n    return result\n\n  return p\n",
          "mode": "100644"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var defaults, extend, _ref,\n    __slice = [].slice;\n\n  _ref = require(\"./util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  require(\"./shims\");\n\n  module.exports = function() {\n    var ajax, complete, completeHandlers, configure;\n    ajax = function(options) {\n      var data, headers, method, overrideMimeType, password, responseType, timeout, url, user, withCredentials;\n      if (options == null) {\n        options = {};\n      }\n      data = options.data, headers = options.headers, method = options.method, overrideMimeType = options.overrideMimeType, password = options.password, url = options.url, responseType = options.responseType, timeout = options.timeout, user = options.user, withCredentials = options.withCredentials;\n      if (data == null) {\n        data = \"\";\n      }\n      if (method == null) {\n        method = \"GET\";\n      }\n      if (password == null) {\n        password = \"\";\n      }\n      if (responseType == null) {\n        responseType = \"\";\n      }\n      if (timeout == null) {\n        timeout = 0;\n      }\n      if (user == null) {\n        user = \"\";\n      }\n      if (withCredentials == null) {\n        withCredentials = false;\n      }\n      return new ProgressPromise(function(resolve, reject, progress) {\n        var xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open(method, url, true, user, password);\n        xhr.responseType = responseType;\n        xhr.timeout = timeout;\n        xhr.withCredentialls = withCredentials;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        if (overrideMimeType) {\n          xhr.overrideMimeType(overrideMimeType);\n        }\n        xhr.onload = function(e) {\n          var _ref1;\n          if (((200 <= (_ref1 = this.status) && _ref1 < 300)) || this.status === 304) {\n            resolve(this.response);\n            return complete(e, xhr, options);\n          } else {\n            reject(xhr);\n            return complete(e, xhr, options);\n          }\n        };\n        xhr.onerror = function(e) {\n          reject(xhr);\n          return complete(e, xhr, options);\n        };\n        xhr.onprogress = progress;\n        return xhr.send(data);\n      });\n    };\n    complete = function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return completeHandlers.forEach(function(handler) {\n        return handler.apply(null, args);\n      });\n    };\n    configure = function(optionDefaults) {\n      return function(url, options) {\n        if (options == null) {\n          options = {};\n        }\n        if (typeof url === \"object\") {\n          options = url;\n        } else {\n          options.url = url;\n        }\n        defaults(options, optionDefaults);\n        return ajax(options);\n      };\n    };\n    completeHandlers = [];\n    return extend(ajax, {\n      ajax: configure({}),\n      complete: function(handler) {\n        return completeHandlers.push(handler);\n      },\n      getJSON: configure({\n        responseType: \"json\"\n      }),\n      getBlob: configure({\n        responseType: \"blob\"\n      })\n    });\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.5-pre.0\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"../main\");\n\n  describe(\"Ajax\", function() {\n    it(\"should provide progress\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).progress(function(e) {\n        return console.log(e);\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        return done();\n      });\n    });\n    it(\"should getJSON\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n    it(\"should have complete handlers\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      ajax.complete(function(e, xhr, options) {\n        return done();\n      });\n      return ajax.getJSON(\"https://api.github.com/users\");\n    });\n    return it(\"should work with options only\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax.getJSON({\n        url: \"https://api.github.com/users\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "util": {
          "path": "util",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "shims": {
          "path": "shims",
          "content": "(function() {\n  var _base, _base1, _base2;\n\n  if ((_base = Promise.prototype)[\"finally\"] == null) {\n    _base[\"finally\"] = function(callback) {\n      return this.then(function(value) {\n        return Promise.resolve(callback()).then(function() {\n          return value;\n        });\n      }, function(reason) {\n        return Promise.resolve(callback()).then(function() {\n          throw reason;\n        });\n      });\n    };\n  }\n\n  if ((_base1 = Promise.prototype)._notify == null) {\n    _base1._notify = function(event) {\n      return this._progressHandlers.forEach(function(handler) {\n        try {\n          return handler(event);\n        } catch (_error) {}\n      });\n    };\n  }\n\n  if ((_base2 = Promise.prototype).progress == null) {\n    _base2.progress = function(handler) {\n      if (this._progressHandlers == null) {\n        this._progressHandlers = [];\n      }\n      this._progressHandlers.push(handler);\n      return this;\n    };\n  }\n\n  global.ProgressPromise = function(fn) {\n    var p;\n    p = new Promise(function(resolve, reject) {\n      var notify;\n      notify = function() {\n        var _ref;\n        return (_ref = p._progressHandlers) != null ? _ref.forEach(function(handler) {\n          try {\n            return handler(event);\n          } catch (_error) {}\n        }) : void 0;\n      };\n      return fn(resolve, reject, notify);\n    });\n    p.then = function(onFulfilled, onRejected) {\n      var result;\n      result = Promise.prototype.then.call(p, onFulfilled, onRejected);\n      p.progress(result._notify.bind(result));\n      return result;\n    };\n    return p;\n  };\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "version": "0.1.5-pre.0",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.1.5-pre.0",
        "default_branch": "master",
        "full_name": "distri/ajax",
        "homepage": null,
        "description": "Promise returning Ajax lib",
        "html_url": "https://github.com/distri/ajax",
        "url": "https://api.github.com/repos/distri/ajax",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "analytics": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "google-analytics\n================\n\nGoogle analytics for distri apps\n",
          "type": "blob"
        },
        "lib/analytics.js": {
          "path": "lib/analytics.js",
          "mode": "100644",
          "content": "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\nm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Google Analytics\n================\n\n    module.exports =\n      init: (id) ->\n        require \"./lib/analytics\"\n\n        global.ga('create', id, 'auto')\n        global.ga('send', 'pageview')\n",
          "type": "blob"
        },
        "test/main.coffee": {
          "path": "test/main.coffee",
          "mode": "100644",
          "content": "mocha.globals(\"ga\")\n\ndescribe \"analytics\", ->\n  it \"should put analytics on the page\", ->\n    GA = require \"../main\"\n\n    GA.init(\"UA-XXXX-Y\")\n\n  it \"should be a chill bro\", ->\n    ga(\"send\", \"duder\")\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.1.0\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "lib/analytics": {
          "path": "lib/analytics",
          "content": "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\nm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n",
          "type": "blob"
        },
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = {\n    init: function(id) {\n      require(\"./lib/analytics\");\n      global.ga('create', id, 'auto');\n      return global.ga('send', 'pageview');\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "test/main": {
          "path": "test/main",
          "content": "(function() {\n  mocha.globals(\"ga\");\n\n  describe(\"analytics\", function() {\n    it(\"should put analytics on the page\", function() {\n      var GA;\n      GA = require(\"../main\");\n      return GA.init(\"UA-XXXX-Y\");\n    });\n    return it(\"should be a chill bro\", function() {\n      return ga(\"send\", \"duder\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.0\"};",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.0",
      "entryPoint": "main",
      "repository": {
        "id": 17791404,
        "name": "google-analytics",
        "full_name": "distri/google-analytics",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://gravatar.com/avatar/192f3f168409e79c42107f081139d9f3?d=https%3A%2F%2Fidenticons.github.com%2Ff90c81ffc1498e260c820082f2e7ca5f.png&r=x",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/google-analytics",
        "description": "Google analytics for distri apps",
        "fork": false,
        "url": "https://api.github.com/repos/distri/google-analytics",
        "forks_url": "https://api.github.com/repos/distri/google-analytics/forks",
        "keys_url": "https://api.github.com/repos/distri/google-analytics/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/google-analytics/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/google-analytics/teams",
        "hooks_url": "https://api.github.com/repos/distri/google-analytics/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/google-analytics/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/google-analytics/events",
        "assignees_url": "https://api.github.com/repos/distri/google-analytics/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/google-analytics/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/google-analytics/tags",
        "blobs_url": "https://api.github.com/repos/distri/google-analytics/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/google-analytics/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/google-analytics/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/google-analytics/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/google-analytics/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/google-analytics/languages",
        "stargazers_url": "https://api.github.com/repos/distri/google-analytics/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/google-analytics/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/google-analytics/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/google-analytics/subscription",
        "commits_url": "https://api.github.com/repos/distri/google-analytics/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/google-analytics/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/google-analytics/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/google-analytics/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/google-analytics/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/google-analytics/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/google-analytics/merges",
        "archive_url": "https://api.github.com/repos/distri/google-analytics/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/google-analytics/downloads",
        "issues_url": "https://api.github.com/repos/distri/google-analytics/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/google-analytics/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/google-analytics/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/google-analytics/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/google-analytics/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/google-analytics/releases{/id}",
        "created_at": "2014-03-16T03:39:25Z",
        "updated_at": "2014-03-16T03:39:25Z",
        "pushed_at": "2014-03-16T03:39:25Z",
        "git_url": "git://github.com/distri/google-analytics.git",
        "ssh_url": "git@github.com:distri/google-analytics.git",
        "clone_url": "https://github.com/distri/google-analytics.git",
        "svn_url": "https://github.com/distri/google-analytics",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://gravatar.com/avatar/192f3f168409e79c42107f081139d9f3?d=https%3A%2F%2Fidenticons.github.com%2Ff90c81ffc1498e260c820082f2e7ca5f.png&r=x",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.1.0",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "cornerstone": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "cornerstone\n===========\n\n`Cornerstone` is the foundation for complex applications. There is always a\ntradeoff between explicit dependencies and a robust standard environment.\n\nCornerstone is to be used when we want a better environment and don't mind\nnot explicitly requiring each individual dependency.\n",
          "mode": "100644",
          "type": "blob"
        },
        "cornerstone.coffee.md": {
          "path": "cornerstone.coffee.md",
          "content": "Cornerstone\n===========\n\n`Cornerstone` is the foundation for complex applications. There is always a\ntradeoff between explicit dependencies and a robust standard environment.\n\nCornerstone is to be used when we want a better environment and don't mind\nnot explicitly requiring each individual dependency.\n\nImplementation\n--------------\n\nAdd all of the built in extensions.\n\n    require \"extensions\"\n\n    {extend, defaults} = require \"util\"\n\n    Inflector = require(\"inflector\")\n    Q = require \"q\"\n\nPollute the global environment.\n\n    Model = require \"model\"\n\n    extend global,\n      Bindable: require \"bindable\"\n      Core: Model.Core\n      Deferred: Q.defer\n      Inflector: Inflector\n      defaults: defaults\n      extend: extend\n      Model: Model\n      Q: Q\n\n    global.Observable ?= Model.Observable\n\n    Inflector.pollute()\n    require(\"math\").pollute()\n\nAdd our extra Point extensions\n\n    require \"./point\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.3.0-pre.2\"\nentryPoint: \"cornerstone\"\ndependencies:\n  bindable: \"distri/bindable:v0.1.0\"\n  extensions: \"distri/extensions:v0.2.0\"\n  inflector: \"distri/inflector:v0.2.1\"\n  math: \"distri/math:v0.2.6-pre.0\"\n  model: \"distri/model:v0.2.0-pre.2\"\n  q: \"distri/q:v1.0.1\"\n  util: \"distri/util:v0.1.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "point.coffee.md": {
          "path": "point.coffee.md",
          "content": "Extend Point With Math Magic\n============================\n\nLet's add our number extensions to `Point`s.\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n    ].forEach (method) ->\n      Point.prototype[method] = ->\n        Point(@x[method](), @y[method]())\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/cornerstone.coffee": {
          "path": "test/cornerstone.coffee",
          "content": "require \"../cornerstone\"\n\ndescribe \"Cornerstone\", ->\n  it \"should provide Bindable\", ->\n    assert Bindable()\n\n  it \"should provide Core\", ->\n    assert Core()\n\n  it \"should provide Deferred\", (done) ->\n    deferred = Deferred()\n\n    promise = deferred.promise\n\n    promise.then done\n\n    deferred.fulfill()\n\n  it \"should provide Matrix\", ->\n    assert Matrix()\n\n  it \"should provide Model\", ->\n    assert Model()\n\n  it \"should provide Observable\", ->\n    assert Observable()\n\n  describe \"Point\", ->\n\n    it \"should provide Point\", ->\n      assert Point()\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n    ].forEach (method) ->\n      it \"should have Point::#{method}\", ->\n        assert Point()[method]\n\n  it \"should provide Q\", ->\n    assert Q\n\n  it \"should provide Random\", ->\n    assert Random\n\n  it \"should provide rand\", ->\n    assert rand\n\n  it \"should provide Size\", ->\n    assert Size\n\n  it \"should provide Function#debounce\", ->\n    assert (->).debounce\n\n  it \"should provide extend\", ->\n    assert extend\n\n  it \"should provied defaults\", ->\n    assert defaults\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/string_inflection.coffee": {
          "path": "test/string_inflection.coffee",
          "content": "sampleData = \"\"\"\n  address       addresses\n  boss          bosses\n  bus           buses\n  cat           cats\n  child         children\n  duder         duders\n  Hat           Hats\n  man           men\n  woman         women\n  zombie        zombies\n  octopus       octopi\n  walrus        walruses\n  guy           guys\n  person        people\n  status        statuses\n\"\"\".split(\"\\n\").map (line) ->\n  line.split(\" \").filter (piece) ->\n    piece != \"\"\n\ndescribe \"Inflector\", ->\n  describe \"pluralize\", ->\n    sampleData.forEach ([singular, plural]) ->\n      it \"#{singular} as #{plural}\", ->\n        assert.equal Inflector.pluralize(singular), plural\n\n      it \"#{plural} as #{plural}\", ->\n        assert.equal Inflector.pluralize(plural), plural\n\n  describe \"singularize\", ->\n    sampleData.forEach ([singular, plural]) ->\n      it \"#{plural} as #{singular}\", ->\n        assert.equal Inflector.singularize(plural), singular\n\n      it \"#{singular} as #{singular}\", ->\n        assert.equal Inflector.singularize(singular), singular\n\n  describe \"camelize\", ->\n    it \"message_properties as MessageProperties\", ->\n      assert.equal Inflector.camelize(\"message_properties\"), \"MessageProperties\"\n\n    it \"message_properties, true as messageProperties\", ->\n      assert.equal Inflector.camelize(\"message_properties\", true), \"messageProperties\"\n\n    it \"should replace / with scope resolution operator\", ->\n      assert.equal Inflector.camelize(\"models/person\"), \"Models.Person\"\n\n    it \"shouldn't overdo it\", ->\n      assert.equal Inflector.camelize(Inflector.camelize(\"anAlreadyCamelizedDude\")), \"AnAlreadyCamelizedDude\"\n\n  describe \"classify\", ->\n    it \"should convert a property name into a class name suitable for lookup\", ->\n      assert.equal Inflector.classify(\"message_bus_properties\"), \"MessageBusProperty\"\n\n    it \"should work for camel cased names too\", ->\n      assert.equal Inflector.classify(\"messageBusProperties\"), \"MessageBusProperty\"\n\n    it \"should convert directory separators to namespaces\", ->\n      assert.equal Inflector.classify(\"models/message_bus_properties\"), \"Models.MessageBusProperty\"\n\n  describe \"capitalize\", ->\n    it \"should work on underscored words\", ->\n      assert.equal Inflector.capitalize(\"message_properties\"), \"Message_properties\"\n\n    it \"should work on normal words\", ->\n      assert.equal Inflector.capitalize(\"message properties\"), \"Message properties\"\n\n  describe \"constantize\", ->\n    # Namespace for testing\n    Tempest =\n      Models:\n        Person: {}\n\n    it \"should look up global constants\", ->\n      assert.equal Inflector.constantize(\"String\"), String\n      assert.equal Inflector.constantize(\"Number\"), Number\n      assert.equal Inflector.constantize(\"Object\"), Object\n\n    it \"should traverse namespaces\", ->\n      assert.equal Inflector.constantize(\"Models.Person\", Tempest), Tempest.Models.Person\n\n    it \"should work with classify\", ->\n      assert.equal Inflector.constantize(Inflector.classify(\"models/person\"), Tempest), Tempest.Models.Person\n\n  describe \"humanize\", ->\n    it \"should replace underscores with spaces\", ->\n      assert.equal Inflector.humanize(\"message_properties\"), \"Message properties\"\n      assert.equal Inflector.humanize(\"message_properties\", true), \"message properties\"\n\n    it \"should remove id suffixes\", ->\n      assert.equal Inflector.humanize(\"message_id\"), \"Message\"\n      assert.equal Inflector.humanize(\"messageId\"), \"Message\"\n\n    it \"should also work for camelCased words\", ->\n      assert.equal Inflector.humanize(\"messageProperties\"), \"Message properties\"\n      assert.equal Inflector.humanize(\"messageProperties\", true), \"message properties\"\n\n  describe \"tableize\", ->\n    it \"should transform words for use in storage solutions\", ->\n      assert.equal Inflector.tableize(\"people\"), \"people\"\n      assert.equal Inflector.tableize(\"MessageBusProperty\"), \"message_bus_properties\"\n\n  describe \"titleize\", ->\n    it \"should transform words to title case\", ->\n      assert.equal Inflector.titleize(\"message_properties\"), \"Message Properties\"\n      assert.equal Inflector.titleize(\"message properties to keep\"), \"Message Properties to Keep\"\n\n  describe \"underscore\", ->\n    it \"should convert camelCased words to underscored words\", ->\n      assert.equal Inflector.underscore(\"MessageProperties\"), \"message_properties\"\n      assert.equal Inflector.underscore(\"messageProperties\"), \"message_properties\"\n\n    it \"should deal with acronyms\", ->\n      assert.equal Inflector.underscore(\"MP\"), \"mp\"\n      assert.equal Inflector.underscore(\"HTTPConnection\"), \"http_connection\"\n\n  describe \"dasherize\", ->\n    it \"should convert words with spaces into words with dashes\", ->\n      assert.equal Inflector.dasherize(\"A really cool Feature\"), \"a-really-cool-feature\"\n\ndescribe \"string inflection methods\", ->\n  [\"pluralize\", \"singularize\", \"dasherize\", \"underscore\", \"titleize\", \"humanize\", \"tableize\"].forEach (method) ->\n    it \"should have #{method}\", ->\n      assert typeof \"\"[method] == 'function'\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "cornerstone": {
          "path": "cornerstone",
          "content": "(function() {\n  var Inflector, Model, Q, defaults, extend, _ref;\n\n  require(\"extensions\");\n\n  _ref = require(\"util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  Inflector = require(\"inflector\");\n\n  Q = require(\"q\");\n\n  Model = require(\"model\");\n\n  extend(global, {\n    Bindable: require(\"bindable\"),\n    Core: Model.Core,\n    Deferred: Q.defer,\n    Inflector: Inflector,\n    defaults: defaults,\n    extend: extend,\n    Model: Model,\n    Q: Q\n  });\n\n  if (global.Observable == null) {\n    global.Observable = Model.Observable;\n  }\n\n  Inflector.pollute();\n\n  require(\"math\").pollute();\n\n  require(\"./point\");\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.3.0-pre.2\",\"entryPoint\":\"cornerstone\",\"dependencies\":{\"bindable\":\"distri/bindable:v0.1.0\",\"extensions\":\"distri/extensions:v0.2.0\",\"inflector\":\"distri/inflector:v0.2.1\",\"math\":\"distri/math:v0.2.6-pre.0\",\"model\":\"distri/model:v0.2.0-pre.2\",\"q\":\"distri/q:v1.0.1\",\"util\":\"distri/util:v0.1.0\"}};",
          "type": "blob"
        },
        "point": {
          "path": "point",
          "content": "(function() {\n  [\"abs\", \"ceil\", \"floor\"].forEach(function(method) {\n    return Point.prototype[method] = function() {\n      return Point(this.x[method](), this.y[method]());\n    };\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/cornerstone": {
          "path": "test/cornerstone",
          "content": "(function() {\n  require(\"../cornerstone\");\n\n  describe(\"Cornerstone\", function() {\n    it(\"should provide Bindable\", function() {\n      return assert(Bindable());\n    });\n    it(\"should provide Core\", function() {\n      return assert(Core());\n    });\n    it(\"should provide Deferred\", function(done) {\n      var deferred, promise;\n      deferred = Deferred();\n      promise = deferred.promise;\n      promise.then(done);\n      return deferred.fulfill();\n    });\n    it(\"should provide Matrix\", function() {\n      return assert(Matrix());\n    });\n    it(\"should provide Model\", function() {\n      return assert(Model());\n    });\n    it(\"should provide Observable\", function() {\n      return assert(Observable());\n    });\n    describe(\"Point\", function() {\n      it(\"should provide Point\", function() {\n        return assert(Point());\n      });\n      return [\"abs\", \"ceil\", \"floor\"].forEach(function(method) {\n        return it(\"should have Point::\" + method, function() {\n          return assert(Point()[method]);\n        });\n      });\n    });\n    it(\"should provide Q\", function() {\n      return assert(Q);\n    });\n    it(\"should provide Random\", function() {\n      return assert(Random);\n    });\n    it(\"should provide rand\", function() {\n      return assert(rand);\n    });\n    it(\"should provide Size\", function() {\n      return assert(Size);\n    });\n    it(\"should provide Function#debounce\", function() {\n      return assert((function() {}).debounce);\n    });\n    it(\"should provide extend\", function() {\n      return assert(extend);\n    });\n    return it(\"should provied defaults\", function() {\n      return assert(defaults);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/string_inflection": {
          "path": "test/string_inflection",
          "content": "(function() {\n  var sampleData;\n\n  sampleData = \"address       addresses\\nboss          bosses\\nbus           buses\\ncat           cats\\nchild         children\\nduder         duders\\nHat           Hats\\nman           men\\nwoman         women\\nzombie        zombies\\noctopus       octopi\\nwalrus        walruses\\nguy           guys\\nperson        people\\nstatus        statuses\".split(\"\\n\").map(function(line) {\n    return line.split(\" \").filter(function(piece) {\n      return piece !== \"\";\n    });\n  });\n\n  describe(\"Inflector\", function() {\n    describe(\"pluralize\", function() {\n      return sampleData.forEach(function(_arg) {\n        var plural, singular;\n        singular = _arg[0], plural = _arg[1];\n        it(\"\" + singular + \" as \" + plural, function() {\n          return assert.equal(Inflector.pluralize(singular), plural);\n        });\n        return it(\"\" + plural + \" as \" + plural, function() {\n          return assert.equal(Inflector.pluralize(plural), plural);\n        });\n      });\n    });\n    describe(\"singularize\", function() {\n      return sampleData.forEach(function(_arg) {\n        var plural, singular;\n        singular = _arg[0], plural = _arg[1];\n        it(\"\" + plural + \" as \" + singular, function() {\n          return assert.equal(Inflector.singularize(plural), singular);\n        });\n        return it(\"\" + singular + \" as \" + singular, function() {\n          return assert.equal(Inflector.singularize(singular), singular);\n        });\n      });\n    });\n    describe(\"camelize\", function() {\n      it(\"message_properties as MessageProperties\", function() {\n        return assert.equal(Inflector.camelize(\"message_properties\"), \"MessageProperties\");\n      });\n      it(\"message_properties, true as messageProperties\", function() {\n        return assert.equal(Inflector.camelize(\"message_properties\", true), \"messageProperties\");\n      });\n      it(\"should replace / with scope resolution operator\", function() {\n        return assert.equal(Inflector.camelize(\"models/person\"), \"Models.Person\");\n      });\n      return it(\"shouldn't overdo it\", function() {\n        return assert.equal(Inflector.camelize(Inflector.camelize(\"anAlreadyCamelizedDude\")), \"AnAlreadyCamelizedDude\");\n      });\n    });\n    describe(\"classify\", function() {\n      it(\"should convert a property name into a class name suitable for lookup\", function() {\n        return assert.equal(Inflector.classify(\"message_bus_properties\"), \"MessageBusProperty\");\n      });\n      it(\"should work for camel cased names too\", function() {\n        return assert.equal(Inflector.classify(\"messageBusProperties\"), \"MessageBusProperty\");\n      });\n      return it(\"should convert directory separators to namespaces\", function() {\n        return assert.equal(Inflector.classify(\"models/message_bus_properties\"), \"Models.MessageBusProperty\");\n      });\n    });\n    describe(\"capitalize\", function() {\n      it(\"should work on underscored words\", function() {\n        return assert.equal(Inflector.capitalize(\"message_properties\"), \"Message_properties\");\n      });\n      return it(\"should work on normal words\", function() {\n        return assert.equal(Inflector.capitalize(\"message properties\"), \"Message properties\");\n      });\n    });\n    describe(\"constantize\", function() {\n      var Tempest;\n      Tempest = {\n        Models: {\n          Person: {}\n        }\n      };\n      it(\"should look up global constants\", function() {\n        assert.equal(Inflector.constantize(\"String\"), String);\n        assert.equal(Inflector.constantize(\"Number\"), Number);\n        return assert.equal(Inflector.constantize(\"Object\"), Object);\n      });\n      it(\"should traverse namespaces\", function() {\n        return assert.equal(Inflector.constantize(\"Models.Person\", Tempest), Tempest.Models.Person);\n      });\n      return it(\"should work with classify\", function() {\n        return assert.equal(Inflector.constantize(Inflector.classify(\"models/person\"), Tempest), Tempest.Models.Person);\n      });\n    });\n    describe(\"humanize\", function() {\n      it(\"should replace underscores with spaces\", function() {\n        assert.equal(Inflector.humanize(\"message_properties\"), \"Message properties\");\n        return assert.equal(Inflector.humanize(\"message_properties\", true), \"message properties\");\n      });\n      it(\"should remove id suffixes\", function() {\n        assert.equal(Inflector.humanize(\"message_id\"), \"Message\");\n        return assert.equal(Inflector.humanize(\"messageId\"), \"Message\");\n      });\n      return it(\"should also work for camelCased words\", function() {\n        assert.equal(Inflector.humanize(\"messageProperties\"), \"Message properties\");\n        return assert.equal(Inflector.humanize(\"messageProperties\", true), \"message properties\");\n      });\n    });\n    describe(\"tableize\", function() {\n      return it(\"should transform words for use in storage solutions\", function() {\n        assert.equal(Inflector.tableize(\"people\"), \"people\");\n        return assert.equal(Inflector.tableize(\"MessageBusProperty\"), \"message_bus_properties\");\n      });\n    });\n    describe(\"titleize\", function() {\n      return it(\"should transform words to title case\", function() {\n        assert.equal(Inflector.titleize(\"message_properties\"), \"Message Properties\");\n        return assert.equal(Inflector.titleize(\"message properties to keep\"), \"Message Properties to Keep\");\n      });\n    });\n    describe(\"underscore\", function() {\n      it(\"should convert camelCased words to underscored words\", function() {\n        assert.equal(Inflector.underscore(\"MessageProperties\"), \"message_properties\");\n        return assert.equal(Inflector.underscore(\"messageProperties\"), \"message_properties\");\n      });\n      return it(\"should deal with acronyms\", function() {\n        assert.equal(Inflector.underscore(\"MP\"), \"mp\");\n        return assert.equal(Inflector.underscore(\"HTTPConnection\"), \"http_connection\");\n      });\n    });\n    return describe(\"dasherize\", function() {\n      return it(\"should convert words with spaces into words with dashes\", function() {\n        return assert.equal(Inflector.dasherize(\"A really cool Feature\"), \"a-really-cool-feature\");\n      });\n    });\n  });\n\n  describe(\"string inflection methods\", function() {\n    return [\"pluralize\", \"singularize\", \"dasherize\", \"underscore\", \"titleize\", \"humanize\", \"tableize\"].forEach(function(method) {\n      return it(\"should have \" + method, function() {\n        return assert(typeof \"\"[method] === 'function');\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "version": "0.3.0-pre.2",
      "entryPoint": "cornerstone",
      "repository": {
        "branch": "v0.3.0-pre.2",
        "default_branch": "master",
        "full_name": "distri/cornerstone",
        "homepage": null,
        "description": "Core JavaScript Extensions.",
        "html_url": "https://github.com/distri/cornerstone",
        "url": "https://api.github.com/repos/distri/cornerstone",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
        "bindable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.coffee.md": {
              "path": "README.coffee.md",
              "mode": "100644",
              "content": "Bindable\n========\n\n    Core = require \"core\"\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self=Core(I)) ->\n      eventCallbacks = {}\n\n      self.extend\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n        on: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          # HACK: Here we annotate the callback function with namespace metadata\n          # This will probably lead to some strange edge cases, but should work fine\n          # for simple cases.\n          if namespace\n            callback.__PIXIE ||= {}\n            callback.__PIXIE[namespace] = true\n\n          eventCallbacks[event] ||= []\n          eventCallbacks[event].push(callback)\n\n          return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n        off: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          if event\n            eventCallbacks[event] ||= []\n\n            if namespace\n              # Select only the callbacks that do not have this namespace metadata\n              eventCallbacks[event] = eventCallbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n            else\n              if callback\n                remove eventCallbacks[event], callback\n              else\n                eventCallbacks[event] = []\n          else if namespace\n            # No event given\n            # Select only the callbacks that do not have this namespace metadata\n            # for any events bound\n            for key, callbacks of eventCallbacks\n              eventCallbacks[key] = callbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n          return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n        trigger: (event, parameters...) ->\n          callbacks = eventCallbacks[event]\n\n          if callbacks\n            callbacks.forEach (callback) ->\n              callback.apply(self, parameters)\n\n          return self\n\nLegacy method aliases.\n\n      self.extend\n        bind: self.on\n        unbind: self.off\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"README\"\nversion: \"0.1.0\"\ndependencies:\n  core: \"distri/core:v0.6.0\"\n",
              "type": "blob"
            },
            "test/bindable.coffee": {
              "path": "test/bindable.coffee",
              "mode": "100644",
              "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#bind and #trigger\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.bind \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#unbind\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.bind \"test\", callback\n    # Unbind specific event\n    o.unbind \"test\", callback\n    o.trigger \"test\"\n\n    o.bind \"test\", callback\n    # Unbind all events\n    o.unbind \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#unbind namespaced\", ->\n    o = Bindable()\n\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\", ->\n    o.trigger \"test\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "README": {
              "path": "README",
              "content": "(function() {\n  var Core, remove,\n    __slice = [].slice;\n\n  Core = require(\"core\");\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    eventCallbacks = {};\n    self.extend({\n      on: function(namespacedEvent, callback) {\n        var event, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (namespace) {\n          callback.__PIXIE || (callback.__PIXIE = {});\n          callback.__PIXIE[namespace] = true;\n        }\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        eventCallbacks[event].push(callback);\n        return self;\n      },\n      off: function(namespacedEvent, callback) {\n        var callbacks, event, key, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (event) {\n          eventCallbacks[event] || (eventCallbacks[event] = []);\n          if (namespace) {\n            eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          } else {\n            if (callback) {\n              remove(eventCallbacks[event], callback);\n            } else {\n              eventCallbacks[event] = [];\n            }\n          }\n        } else if (namespace) {\n          for (key in eventCallbacks) {\n            callbacks = eventCallbacks[key];\n            eventCallbacks[key] = callbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          }\n        }\n        return self;\n      },\n      trigger: function() {\n        var callbacks, event, parameters;\n        event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n        callbacks = eventCallbacks[event];\n        if (callbacks) {\n          callbacks.forEach(function(callback) {\n            return callback.apply(self, parameters);\n          });\n        }\n        return self;\n      }\n    });\n    return self.extend({\n      bind: self.on,\n      unbind: self.off\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=README.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.1.0\",\"dependencies\":{\"core\":\"distri/core:v0.6.0\"}};",
              "type": "blob"
            },
            "test/bindable": {
              "path": "test/bindable",
              "content": "(function() {\n  var Bindable, equal, ok, test;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#bind and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.bind(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#unbind\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.bind(\"test\", callback);\n      o.unbind(\"test\", callback);\n      o.trigger(\"test\");\n      o.bind(\"test\", callback);\n      o.unbind(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    return test(\"#unbind namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/bindable.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.0",
          "entryPoint": "README",
          "repository": {
            "id": 17189431,
            "name": "bindable",
            "full_name": "distri/bindable",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/bindable",
            "description": "Event binding",
            "fork": false,
            "url": "https://api.github.com/repos/distri/bindable",
            "forks_url": "https://api.github.com/repos/distri/bindable/forks",
            "keys_url": "https://api.github.com/repos/distri/bindable/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/bindable/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/bindable/teams",
            "hooks_url": "https://api.github.com/repos/distri/bindable/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/bindable/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/bindable/events",
            "assignees_url": "https://api.github.com/repos/distri/bindable/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/bindable/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/bindable/tags",
            "blobs_url": "https://api.github.com/repos/distri/bindable/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/bindable/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/bindable/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/bindable/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/bindable/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/bindable/languages",
            "stargazers_url": "https://api.github.com/repos/distri/bindable/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/bindable/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/bindable/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/bindable/subscription",
            "commits_url": "https://api.github.com/repos/distri/bindable/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/bindable/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/bindable/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/bindable/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/bindable/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/bindable/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/bindable/merges",
            "archive_url": "https://api.github.com/repos/distri/bindable/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/bindable/downloads",
            "issues_url": "https://api.github.com/repos/distri/bindable/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/bindable/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/bindable/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/bindable/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/bindable/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/bindable/releases{/id}",
            "created_at": "2014-02-25T21:50:35Z",
            "updated_at": "2014-02-25T21:50:35Z",
            "pushed_at": "2014-02-25T21:50:35Z",
            "git_url": "git://github.com/distri/bindable.git",
            "ssh_url": "git@github.com:distri/bindable.git",
            "clone_url": "https://github.com/distri/bindable.git",
            "svn_url": "https://github.com/distri/bindable",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.0",
            "defaultBranch": "master"
          },
          "dependencies": {
            "core": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "core\n====\n\nAn object extension system.\n",
                  "type": "blob"
                },
                "core.coffee.md": {
                  "path": "core.coffee.md",
                  "mode": "100644",
                  "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
                  "type": "blob"
                },
                "test/core.coffee": {
                  "path": "test/core.coffee",
                  "mode": "100644",
                  "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "core": {
                  "path": "core",
                  "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
                  "type": "blob"
                },
                "test/core": {
                  "path": "test/core",
                  "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.6.0",
              "entryPoint": "core",
              "repository": {
                "id": 13567517,
                "name": "core",
                "full_name": "distri/core",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/core",
                "description": "An object extension system.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/core",
                "forks_url": "https://api.github.com/repos/distri/core/forks",
                "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/core/teams",
                "hooks_url": "https://api.github.com/repos/distri/core/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/core/events",
                "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/core/tags",
                "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/core/languages",
                "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/core/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/core/subscription",
                "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/core/merges",
                "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/core/downloads",
                "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
                "created_at": "2013-10-14T17:04:33Z",
                "updated_at": "2013-12-24T00:49:21Z",
                "pushed_at": "2013-10-14T23:49:11Z",
                "git_url": "git://github.com/distri/core.git",
                "ssh_url": "git@github.com:distri/core.git",
                "clone_url": "https://github.com/distri/core.git",
                "svn_url": "https://github.com/distri/core",
                "homepage": null,
                "size": 592,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.6.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            }
          }
        },
        "extensions": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "Extensions\n==========\n\nExtend built-in prototypes with helpful methods.\n",
              "type": "blob"
            },
            "array.coffee.md": {
              "path": "array.coffee.md",
              "mode": "100644",
              "content": "Array\n=====\n\n    {extend} = require \"./util\"\n\n    extend Array.prototype,\n\nCalculate the average value of an array. Returns undefined if some elements\nare not numbers.\n\n      average: ->\n        @sum()/@length\n\n>     #! example\n>     [1, 3, 5, 7].average()\n\n----\n\nReturns a copy of the array without null and undefined values.\n\n      compact: ->\n        @select (element) ->\n          element?\n\n>     #! example\n>     [null, undefined, 3, 3, undefined, 5].compact()\n\n----\n\nCreates and returns a copy of the array. The copy contains\nthe same objects.\n\n      copy: ->\n        @concat()\n\n>     #! example\n>     a = [\"a\", \"b\", \"c\"]\n>     b = a.copy()\n>\n>     # their elements are equal\n>     a[0] == b[0] && a[1] == b[1] && a[2] == b[2]\n>     # => true\n>\n>     # but they aren't the same object in memory\n>     a is b\n>     # => false\n\n----\n\nEmpties the array of its contents. It is modified in place.\n\n      clear: ->\n        @length = 0\n\n        return this\n\n>     #! example\n>     fullArray = [1, 2, 3]\n>     fullArray.clear()\n>     fullArray\n\n----\n\nFlatten out an array of arrays into a single array of elements.\n\n      flatten: ->\n        @inject [], (a, b) ->\n          a.concat b\n\n>     #! example\n>     [[1, 2], [3, 4], 5].flatten()\n>     # => [1, 2, 3, 4, 5]\n>\n>     # won't flatten twice nested arrays. call\n>     # flatten twice if that is what you want\n>     [[1, 2], [3, [4, 5]], 6].flatten()\n>     # => [1, 2, 3, [4, 5], 6]\n\n----\n\nInvoke the named method on each element in the array\nand return a new array containing the results of the invocation.\n\n      invoke: (method, args...) ->\n        @map (element) ->\n          element[method].apply(element, args)\n\n>     #! example\n>     [1.1, 2.2, 3.3, 4.4].invoke(\"floor\")\n\n----\n\n>     #! example\n>     ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n\n----\n\nRandomly select an element from the array.\n\n      rand: ->\n        @[rand(@length)]\n\n>     #! example\n>     [1, 2, 3].rand()\n\n----\n\nRemove the first occurrence of the given object from the array if it is\npresent. The array is modified in place.\n\n      remove: (object) ->\n        index = @indexOf(object)\n\n        if index >= 0\n          @splice(index, 1)[0]\n        else\n          undefined\n\n>     #! example\n>     a = [1, 1, \"a\", \"b\"]\n>     a.remove(1)\n>     a\n\n----\n\nReturns true if the element is present in the array.\n\n      include: (element) ->\n        @indexOf(element) != -1\n\n>     #! example\n>     [\"a\", \"b\", \"c\"].include(\"c\")\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument, the index of\nthe element as the second argument, and this array as the\nthird argument.\n\n      each: (iterator, context) ->\n        if @forEach\n          @forEach iterator, context\n        else\n          for element, i in this\n            iterator.call context, element, i, this\n\n        return this\n\n>     #! example\n>     word = \"\"\n>     indices = []\n>     [\"r\", \"a\", \"d\"].each (letter, index) ->\n>       word += letter\n>       indices.push(index)\n>\n>     # => [\"r\", \"a\", \"d\"]\n>\n>     word\n>     # => \"rad\"\n>\n>     indices\n\n----\n\nCall the given iterator once for each pair of objects in the array.\n\n      eachPair: (iterator, context) ->\n        length = @length\n        i = 0\n        while i < length\n          a = @[i]\n          j = i + 1\n          i += 1\n\n          while j < length\n            b = @[j]\n            j += 1\n\n            iterator.call context, a, b\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachPair (a, b) ->\n>       results.push [a, b]\n>\n>     results\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument and the given object\nas the second argument. Additional arguments are passed similar to\n`each`.\n\n      eachWithObject: (object, iterator, context) ->\n        @each (element, i, self) ->\n          iterator.call context, element, object, i, self\n\n        return object\n\nCall the given iterator once for each group of elements in the array,\npassing in the elements in groups of n. Additional arguments are\npassed as in `each`.\n\n      eachSlice: (n, iterator, context) ->\n        len = @length / n\n        i = -1\n\n        while ++i < len\n          iterator.call(context, @slice(i*n, (i+1)*n), i*n, this)\n\n        return this\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachSlice 2, (slice) ->\n>       results.push(slice)\n>\n>     results\n\n----\n\nPipe the input through each function in the array in turn. For example, if you have a\nlist of objects you can perform a series of selection, sorting, and other processing\nmethods and then receive the processed list. This array must contain functions that\naccept a single input and return the processed input. The output of the first function\nis fed to the input of the second and so on until the final processed output is returned.\n\n      pipeline: (input) ->\n        @inject input, (input, fn) ->\n          fn(input)\n\nReturns a new array with the elements all shuffled up.\n\n      shuffle: ->\n        shuffledArray = []\n\n        @each (element) ->\n          shuffledArray.splice(rand(shuffledArray.length + 1), 0, element)\n\n        return shuffledArray\n\n>     #! example\n>     [0..9].shuffle()\n\n----\n\nReturns the first element of the array, undefined if the array is empty.\n\n      first: ->\n        @[0]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].first()\n\n----\n\nReturns the last element of the array, undefined if the array is empty.\n\n      last: ->\n        @[@length - 1]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].last()\n\n----\n\nReturns an object containing the extremes of this array.\n\n      extremes: (fn=identity) ->\n        min = max = undefined\n        minResult = maxResult = undefined\n\n        @each (object) ->\n          result = fn(object)\n\n          if min?\n            if result < minResult\n              min = object\n              minResult = result\n          else\n            min = object\n            minResult = result\n\n          if max?\n            if result > maxResult\n              max = object\n              maxResult = result\n          else\n            max = object\n            maxResult = result\n\n        min: min\n        max: max\n\n>     #! example\n>     [-1, 3, 0].extremes()\n\n----\n\n      maxima: (valueFunction=identity) ->\n        @inject([-Infinity, []], (memo, item) ->\n          value = valueFunction(item)\n          [maxValue, maxItems] = memo\n\n          if value > maxValue\n            [value, [item]]\n          else if value is maxValue\n            [value, maxItems.concat(item)]\n          else\n            memo\n        ).last()\n\n      maximum: (valueFunction) ->\n        @maxima(valueFunction).first()\n\n      minima: (valueFunction=identity) ->\n        inverseFn = (x) ->\n          -valueFunction(x)\n\n        @maxima(inverseFn)\n\n      minimum: (valueFunction) ->\n        @minima(valueFunction).first()\n\nPretend the array is a circle and grab a new array containing length elements.\nIf length is not given return the element at start, again assuming the array\nis a circle.\n\n      wrap: (start, length) ->\n        if length?\n          end = start + length\n          i = start\n          result = []\n\n          while i < end\n            result.push(@[mod(i, @length)])\n            i += 1\n\n          return result\n        else\n          return @[mod(start, @length)]\n\n>     #! example\n>     [1, 2, 3].wrap(-1)\n\n----\n\n>     #! example\n>     [1, 2, 3].wrap(6)\n\n----\n\n>     #! example\n>     [\"l\", \"o\", \"o\", \"p\"].wrap(0, 12)\n\n----\n\nPartitions the elements into two groups: those for which the iterator returns\ntrue, and those for which it returns false.\n\n      partition: (iterator, context) ->\n        trueCollection = []\n        falseCollection = []\n\n        @each (element) ->\n          if iterator.call(context, element)\n            trueCollection.push element\n          else\n            falseCollection.push element\n\n        return [trueCollection, falseCollection]\n\n>     #! example\n>     [0..9].partition (n) ->\n>       n % 2 is 0\n\n----\n\nReturn the group of elements for which the return value of the iterator is true.\n\n      select: (iterator, context) ->\n        return @partition(iterator, context)[0]\n\nReturn the group of elements that are not in the passed in set.\n\n      without: (values) ->\n        @reject (element) ->\n          values.include(element)\n\n>     #! example\n>     [1, 2, 3, 4].without [2, 3]\n\n----\n\nReturn the group of elements for which the return value of the iterator is false.\n\n      reject: (iterator, context) ->\n        @partition(iterator, context)[1]\n\nCombines all elements of the array by applying a binary operation.\nfor each element in the arra the iterator is passed an accumulator\nvalue (memo) and the element.\n\n      inject: (initial, iterator) ->\n        @each (element) ->\n          initial = iterator(initial, element)\n\n        return initial\n\nAdd all the elements in the array.\n\n      sum: ->\n        @inject 0, (sum, n) ->\n          sum + n\n\n>     #! example\n>     [1, 2, 3, 4].sum()\n\n----\n\nMultiply all the elements in the array.\n\n      product: ->\n        @inject 1, (product, n) ->\n          product * n\n\n>     #! example\n>     [1, 2, 3, 4].product()\n\n----\n\nProduce a duplicate-free version of the array.\n\n      unique: ->\n        @inject [], (results, element) ->\n          results.push element if results.indexOf(element) is -1\n\n          results\n\nMerges together the values of each of the arrays with the values at the corresponding position.\n\n      zip: (args...) ->\n        @map (element, index) ->\n          output = args.map (arr) ->\n            arr[index]\n\n          output.unshift(element)\n\n          return output\n\n>     #! example\n>     ['a', 'b', 'c'].zip([1, 2, 3])\n\n----\n\nHelpers\n-------\n\n    identity = (x) ->\n      x\n\n    rand = (n) ->\n      Math.floor n * Math.random()\n\n    mod = (n, base) ->\n      result = n % base\n\n      if result < 0 and base > 0\n        result += base\n\n      return result\n",
              "type": "blob"
            },
            "extensions.coffee.md": {
              "path": "extensions.coffee.md",
              "mode": "100644",
              "content": "Extensions\n==========\n\nExtend built in prototypes with additional behavior.\n\n    require \"./array\"\n    require \"./function\"\n    require \"./number\"\n    require \"./string\"\n",
              "type": "blob"
            },
            "function.coffee.md": {
              "path": "function.coffee.md",
              "mode": "100644",
              "content": "Function\n========\n\n    {extend} = require \"./util\"\n\nAdd our `Function` extensions.\n\n    extend Function.prototype,\n      once: ->\n        func = this\n\n        ran = false\n        memo = undefined\n\n        return ->\n          return memo if ran\n          ran = true\n\n          return memo = func.apply(this, arguments)\n\nCalling a debounced function will postpone its execution until after\nwait milliseconds have elapsed since the last time the function was\ninvoked. Useful for implementing behavior that should only happen after\nthe input has stopped arriving. For example: rendering a preview of a\nMarkdown comment, recalculating a layout after the window has stopped\nbeing resized...\n\n      debounce: (wait) ->\n        timeout = null\n        func = this\n\n        return ->\n          context = this\n          args = arguments\n\n          later = ->\n            timeout = null\n            func.apply(context, args)\n\n          clearTimeout(timeout)\n          timeout = setTimeout(later, wait)\n\n>     lazyLayout = calculateLayout.debounce(300)\n>     $(window).resize(lazyLayout)\n\n----\n\n      delay: (wait, args...) ->\n        func = this\n\n        setTimeout ->\n          func.apply(null, args)\n        , wait\n\n      defer: (args...) ->\n        this.delay.apply this, [1].concat(args)\n\n    extend Function,\n      identity: (x) ->\n        x\n\n      noop: ->\n",
              "type": "blob"
            },
            "number.coffee.md": {
              "path": "number.coffee.md",
              "mode": "100644",
              "content": "Number\n======\n\nReturns the absolute value of this number.\n\n>     #! example\n>     (-4).abs()\n\nReturns the mathematical ceiling of this number. The number truncated to the\nnearest integer of greater than or equal value.\n\n>     #! example\n>     4.2.ceil()\n\n---\n\n>     #! example\n>     (-1.2).ceil()\n\n---\n\nReturns the mathematical floor of this number. The number truncated to the\nnearest integer of less than or equal value.\n\n>     #! example\n>     4.9.floor()\n\n---\n\n>     #! example\n>     (-1.2).floor()\n\n---\n\nReturns this number rounded to the nearest integer.\n\n>     #! example\n>     4.5.round()\n\n---\n\n>     #! example\n>     4.4.round()\n\n---\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n      \"round\"\n    ].forEach (method) ->\n      Number::[method] = ->\n        Math[method](this)\n\n    {extend} = require \"./util\"\n\n    extend Number.prototype,\n\nGet a bunch of points equally spaced around the unit circle.\n\n      circularPoints: ->\n        n = this\n\n        [0..n].map (i) ->\n          Point.fromAngle (i/n).turns\n\n>     #! example\n>     4.circularPoints()\n\n---\n\nReturns a number whose value is limited to the given range.\n\n      clamp: (min, max) ->\n        if min? and max?\n          Math.min(Math.max(this, min), max)\n        else if min?\n          Math.max(this, min)\n        else if max?\n          Math.min(this, max)\n        else\n          this\n\n>     #! example\n>     512.clamp(0, 255)\n\n---\n\nA mod method useful for array wrapping. The range of the function is\nconstrained to remain in bounds of array indices.\n\n      mod: (base) ->\n        result = this % base;\n\n        if result < 0 && base > 0\n          result += base\n\n        return result\n\n>     #! example\n>     (-1).mod(5)\n\n---\n\nGet the sign of this number as an integer (1, -1, or 0).\n\n      sign: ->\n        if this > 0\n          1\n        else if this < 0\n          -1\n        else\n          0\n\n>     #! example\n>     5.sign()\n\n---\n\nReturns true if this number is even (evenly divisible by 2).\n\n      even: ->\n        @mod(2) is 0\n\n>     #! example\n>     2.even()\n\n---\n\nReturns true if this number is odd (has remainder of 1 when divided by 2).\n\n      odd: ->\n        @mod(2) is 1\n\n>     #! example\n>     3.odd()\n\n---\n\nCalls iterator the specified number of times, passing in the number of the\ncurrent iteration as a parameter: 0 on first call, 1 on the second call, etc.\n\n      times: (iterator, context) ->\n        i = -1\n\n        while ++i < this\n          iterator.call context, i\n\n        return i\n\n>     #! example\n>     output = []\n>\n>     5.times (n) ->\n>       output.push(n)\n>\n>     output\n\n---\n\nReturns the the nearest grid resolution less than or equal to the number.\n\n      snap: (resolution) ->\n        (n / resolution).floor() * resolution\n\n>     #! example\n>     7.snap(8)\n\n---\n\n      truncate: ->\n        if this > 0\n          @floor()\n        else if this < 0\n          @ceil()\n        else\n          this\n\nConvert a number to an amount of rotations.\n\n    unless 5.rotations\n      Object.defineProperty Number::, 'rotations',\n        get: ->\n          this * Math.TAU\n\n    unless 1.rotation\n      Object.defineProperty Number::, 'rotation',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.rotations\n\n---\n\nConvert a number to an amount of rotations.\n\n    unless 5.turns\n      Object.defineProperty Number.prototype, 'turns',\n        get: ->\n          this * Math.TAU\n\n    unless 1.turn\n      Object.defineProperty Number.prototype, 'turn',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.turns\n\n---\n\nConvert a number to an amount of degrees.\n\n    unless 2.degrees\n      Object.defineProperty Number::, 'degrees',\n        get: ->\n          this * Math.TAU / 360\n\n    unless 1.degree\n      Object.defineProperty Number::, 'degree',\n        get: ->\n          this * Math.TAU / 360\n\n>     #! example\n>     180.degrees\n\n---\n\nExtra\n-----\n\nThe mathematical circle constant of 1 turn.\n\n    Math.TAU = 2 * Math.PI\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.2.0\"\nentryPoint: \"extensions\"\n",
              "type": "blob"
            },
            "string.coffee.md": {
              "path": "string.coffee.md",
              "mode": "100644",
              "content": "String\n======\n\nExtend strings with utility methods.\n\n    {extend} = require \"./util\"\n\n    extend String.prototype,\n\nReturns true if this string only contains whitespace characters.\n\n      blank: ->\n        /^\\s*$/.test(this)\n\n>     #! example\n>     \"   \".blank()\n\n---\n\nParse this string as though it is JSON and return the object it represents. If it\nis not valid JSON returns the string itself.\n\n      parse: () ->\n        try\n          JSON.parse(this.toString())\n        catch e\n          this.toString()\n\n>     #! example\n>     # this is valid json, so an object is returned\n>     '{\"a\": 3}'.parse()\n\n---\n\nReturns true if this string starts with the given string.\n\n      startsWith: (str) ->\n        @lastIndexOf(str, 0) is 0\n\nReturns true if this string ends with the given string.\n\n      endsWith: (str) ->\n        @indexOf(str, @length - str.length) != -1\n\nGet the file extension of a string.\n\n      extension: ->\n        if extension = this.match(/\\.([^\\.]*)$/, '')?.last()\n          extension\n        else\n          ''\n\n>     #! example\n>     \"README.md\".extension()\n\n---\n\nAssumes the string is something like a file name and returns the\ncontents of the string without the extension.\n\n      withoutExtension: ->\n        this.replace(/\\.[^\\.]*$/, '')\n\n      toInt: (base=10) ->\n        parseInt(this, base)\n\n>     #! example\n>     \"neat.png\".witouthExtension()\n\n---\n",
              "type": "blob"
            },
            "test/array.coffee": {
              "path": "test/array.coffee",
              "mode": "100644",
              "content": "require \"../array\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Array\", ->\n\n  test \"#average\", ->\n    equals [1, 3, 5, 7].average(), 4\n  \n  test \"#compact\", ->\n    a = [0, 1, undefined, 2, null, 3, '', 4]\n  \n    compacted = a.compact()\n  \n    equals(compacted[0], 0)\n    equals(compacted[1], 1)\n    equals(compacted[2], 2)\n    equals(compacted[3], 3)\n    equals(compacted[4], '')\n    equals(compacted[5], 4)\n  \n  test \"#copy\", ->\n    a = [1,2,3]\n    b = a.copy()\n  \n    ok a != b, \"Original array is not the same array as the copied one\"\n    ok a.length == b.length, \"Both arrays are the same size\"\n    ok a[0] == b[0] && a[1] == b[1] && a[2] == b[2], \"The elements of the two arrays are equal\"\n  \n  test \"#flatten\", ->\n    array = [[0,1], [2,3], [4,5]]\n  \n    flattenedArray = array.flatten()\n  \n    equals flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\"\n    equals flattenedArray.first(), 0, \"First element should be first element in first sub-array\"\n    equals flattenedArray.last(), 5, \"Last element should be last element in last sub-array\"\n  \n  test \"#rand\", ->\n    array = [1,2,3]\n  \n    ok array.indexOf(array.rand()) != -1, \"Array includes randomly selected element\"\n    ok [5].rand() == 5, \"[5].rand() === 5\"\n    ok [].rand() == undefined, \"[].rand() === undefined\"\n  \n  test \"#remove\", ->\n    equals [1,2,3].remove(2), 2, \"[1,2,3].remove(2) === 2\"\n    equals [1,3].remove(2), undefined, \"[1,3].remove(2) === undefined\"\n    equals [1,3].remove(3), 3, \"[1,3].remove(3) === 3\"\n  \n    array = [1,2,3]\n    array.remove(2)\n    ok array.length == 2, \"array = [1,2,3]; array.remove(2); array.length === 2\"\n    array.remove(3)\n    ok array.length == 1, \"array = [1,3]; array.remove(3); array.length === 1\"\n  \n  test \"#map\", ->\n    equals [1].map((x) -> return x + 1 )[0], 2\n  \n  test \"#invoke\", ->\n    results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n  \n    equals results[0], \"hel\"\n    equals results[1], \"wor\"\n    equals results[2], \"coo\"\n  \n  test \"#each\", ->\n    array = [1, 2, 3]\n    count = 0\n  \n    equals array, array.each -> count++\n    equals array.length, count\n  \n  test \"#eachPair\", ->\n    array = [1, 2, 3]\n    sum = 0\n  \n    array.eachPair (a, b) ->\n      sum += a + b\n  \n    equals(sum, 12)\n  \n  test \"#eachWithObject\", ->\n    array = [1, 2, 3]\n  \n    result = array.eachWithObject {}, (element, hash) ->\n      hash[element] = (element + 1).toString()\n  \n    equals result[1], \"2\"\n    equals result[2], \"3\"\n    equals result[3], \"4\"\n  \n  test \"#shuffle\", ->\n    array = [0, 1, 2, 3, 4, 5]\n  \n    shuffledArray = array.shuffle()\n  \n    shuffledArray.each (element) ->\n      ok array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\"\n  \n    array.each (element) ->\n      ok shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\"\n  \n  test \"#first\", ->\n    equals [2].first(), 2\n    equals [1, 2, 3].first(), 1\n    equals [].first(), undefined\n  \n  test \"#last\", ->\n    equals [2].last(), 2\n    equals [1, 2, 3].last(), 3\n    equals [].first(), undefined\n  \n  test \"#maxima\", ->\n    maxima = [-52, 0, 78].maxima()\n  \n    maxima.each (n) ->\n      equals n, 78\n  \n    maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima()\n  \n    equals 3, maxima.length\n  \n    maxima.each (n) ->\n      equals n, 1\n  \n  test \"#maximum\", ->\n    equals [-345, 38, 8347].maximum(), 8347\n  \n  test \"#maximum with function\", ->\n    equals [3, 4, 5].maximum((n) ->\n      n % 4\n    ), 3\n  \n  test \"#minima\", ->\n    minima = [-52, 0, 78].minima()\n  \n    minima.each (n) ->\n      equals n, -52\n  \n    minima = [0, 0, 1, 0, 1, 0, 1, 0].minima()\n  \n    equals 5, minima.length\n  \n    minima.each (n) ->\n      equals n, 0\n  \n  test \"#minimum\", ->\n    equals [-345, 38, 8347].minimum(), -345\n  \n  test \"#pipeline\", ->\n    pipe = [\n      (x) -> x * x\n      (x) -> x - 10\n    ]\n  \n    equals pipe.pipeline(5), 15\n  \n  test \"#extremes\", ->\n    array = [-7, 1, 11, 94]\n  \n    extremes = array.extremes()\n  \n    equals extremes.min, -7, \"Min is -7\"\n    equals extremes.max, 94, \"Max is 94\"\n  \n  test \"#extremes with fn\", ->\n    array = [1, 11, 94]\n\n    extremes = array.extremes (value) ->\n      value % 11\n\n    equals extremes.min, 11, extremes.min\n    equals extremes.max, 94, extremes.max\n\n  test \"#sum\", ->\n    equals [].sum(), 0, \"Empty array sums to zero\"\n    equals [2].sum(), 2, \"[2] sums to 2\"\n    equals [1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\"\n  \n  test \"#eachSlice\", ->\n    [1, 2, 3, 4, 5, 6].eachSlice 2, (array) ->\n      equals array[0] % 2, 1\n      equals array[1] % 2, 0\n  \n  test \"#without\", ->\n    array = [1, 2, 3, 4]\n  \n    excluded = array.without([2, 4])\n  \n    equals excluded[0], 1\n    equals excluded[1], 3\n  \n  test \"#clear\", ->\n    array = [1, 2, 3, 4]\n  \n    equals array.length, 4\n    equals array[0], 1\n  \n    array.clear()\n  \n    equals array.length, 0\n    equals array[0], undefined\n  \n  test \"#unique\", ->\n    array = [0, 0, 0, 1, 1, 1, 2, 3]\n  \n    equals array.unique().first(), 0\n    equals array.unique().last(), 3\n    equals array.unique().length, 4\n  \n  test \"#wrap\", ->\n    array = [0, 1, 2, 3, 4]\n  \n    equals array.wrap(0), 0\n    equals array.wrap(-1), 4\n    equals array.wrap(2), 2\n  \n  test \"#zip\", ->\n    a = [1, 2, 3]\n    b = [4, 5, 6]\n    c = [7, 8]\n  \n    output = a.zip(b, c)\n  \n    equals output[0][0], 1\n    equals output[0][1], 4\n    equals output[0][2], 7\n  \n    equals output[2][2], undefined\n",
              "type": "blob"
            },
            "test/function.coffee": {
              "path": "test/function.coffee",
              "mode": "100644",
              "content": "require \"../function\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Function\", ->\n\n  test \"#once\", ->\n    score = 0\n  \n    addScore = ->\n      score += 100\n  \n    onceScore = addScore.once()\n  \n    [0..9].map ->\n      onceScore()\n  \n    equals score, 100\n  \n  test \".identity\", ->\n    I = Function.identity\n  \n    [0, 1, true, false, null, undefined].each (x) ->\n      equals I(x), x\n  \n  test \"#debounce\", (done) ->\n    fn = (-> ok true; done()).debounce(1)\n  \n    # Though called multiple times the function is only triggered once\n    fn()\n    fn()\n    fn()\n  \n  test \"#delay\", (done) ->\n    fn = (x, y) ->\n      equals x, 3\n      equals y, \"testy\"\n      done()\n  \n    fn.delay 25, 3, \"testy\"\n  \n  test \"#defer\", (done) ->\n    fn = (x) ->\n      equals x, 3\n      done()\n  \n    fn.defer 3\n",
              "type": "blob"
            },
            "test/number.coffee": {
              "path": "test/number.coffee",
              "mode": "100644",
              "content": "require \"../number\"\n\nok = assert\nequals = assert.equal\ntest = it\n\nequalEnough = (expected, actual, tolerance, message) ->\n  message ||= \"#{expected} within #{tolerance} of #{actual}\"\n\n  ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n  \ndescribe \"Number\", ->\n  \n  test \"#abs\", ->\n    equals 5.abs(), 5, \"(5).abs() equals 5\"\n    equals 4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\"\n    equals (-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\"\n    equals 0.abs(), 0, \"(0).abs() equals 0\"\n  \n  test \"#ceil\", ->\n    equals 4.9.ceil(), 5, \"(4.9).floor() equals 5\"\n    equals 4.2.ceil(), 5, \"(4.2).ceil() equals 5\"\n    equals (-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\"\n    equals 3.ceil(), 3, \"(3).ceil() equals 3\"\n  \n  test \"#clamp\", ->\n    equals 5.clamp(0, 3), 3\n    equals 5.clamp(-1, 0), 0\n    equals (-5).clamp(0, 1), 0\n    equals 1.clamp(0, null), 1\n    equals (-1).clamp(0, null), 0\n    equals (-10).clamp(-5, 0), -5\n    equals (-10).clamp(null, 0), -10\n    equals 50.clamp(null, 10), 10\n  \n  test \"#floor\", ->\n    equals 4.9.floor(), 4, \"(4.9).floor() equals 4\"\n    equals 4.2.floor(), 4, \"(4.2).floor() equals 4\"\n    equals (-1.2).floor(), -2, \"(-1.2).floor() equals -2\"\n    equals 3.floor(), 3, \"(3).floor() equals 3\"\n  \n  test \"#round\", ->\n    equals 4.5.round(), 5, \"(4.5).round() equals 5\"\n    equals 4.4.round(), 4, \"(4.4).round() equals 4\"\n  \n  test \"#sign\", ->\n    equals 5.sign(), 1, \"Positive number's sign is 1\"\n    equals (-3).sign(), -1, \"Negative number's sign is -1\"\n    equals 0.sign(), 0, \"Zero's sign is 0\"\n  \n  test \"#even\", ->\n    [0, 2, -32].each (n) ->\n      ok n.even(), \"#{n} is even\"\n  \n    [1, -1, 2.2, -3.784].each (n) ->\n      equals n.even(), false, \"#{n} is not even\"\n  \n  test \"#odd\", ->\n    [1, 9, -37].each (n) ->\n      ok n.odd(), \"#{n} is odd\"\n  \n    [0, 32, 2.2, -1.1].each (n) ->\n      equals n.odd(), false, \"#{n} is not odd\"\n  \n  test \"#times\", ->\n    n = 5\n    equals n.times(->), n, \"returns n\"\n  \n  test \"#times called correct amount\", ->\n    n = 5\n    count = 0\n  \n    n.times -> count++\n  \n    equals n, count, \"returns n\"\n  \n  test \"#mod should have a positive result when used with a positive base and a negative number\", ->\n    n = -3\n  \n    equals n.mod(8), 5, \"Should 'wrap' and be positive.\"\n  \n  test \"#degrees\", ->\n    equals 180.degrees, Math.PI\n    equals 1.degree, Math.TAU / 360\n  \n  test \"#rotations\", ->\n    equals 1.rotation, Math.TAU\n    equals 0.5.rotations, Math.TAU / 2\n  \n  test \"#turns\", ->\n    equals 1.turn, Math.TAU\n    equals 0.5.turns, Math.TAU / 2\n",
              "type": "blob"
            },
            "test/string.coffee": {
              "path": "test/string.coffee",
              "mode": "100644",
              "content": "require \"../string\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"String\", ->\n  \n  test \"#blank\", ->\n    equals \"  \".blank(), true, \"A string containing only whitespace should be blank\"\n    equals \"a\".blank(), false, \"A string that contains a letter should not be blank\"\n    equals \"  a \".blank(), false\n    equals \"  \\n\\t \".blank(), true\n  \n  test \"#extension\", ->\n    equals \"README\".extension(), \"\"\n    equals \"README.md\".extension(), \"md\"\n    equals \"jquery.min.js\".extension(), \"js\"\n    equals \"src/bouse.js.coffee\".extension(), \"coffee\"\n  \n  test \"#parse\", ->\n    equals \"true\".parse(), true, \"parsing 'true' should equal boolean true\"\n    equals \"false\".parse(), false, \"parsing 'true' should equal boolean true\"\n    equals \"7.2\".parse(), 7.2, \"numbers should be cool too\"\n  \n    equals '{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\"\n  \n    ok ''.parse() == '', \"Empty string parses to exactly the empty string\"\n  \n  test \"#startsWith\", ->\n    ok \"cool\".startsWith(\"coo\")\n    equals \"cool\".startsWith(\"oo\"), false\n  \n  test \"#toInt\", ->\n    equals \"31.3\".toInt(), 31\n    equals \"31.\".toInt(), 31\n    equals \"-1.02\".toInt(), -1\n  \n    equals \"009\".toInt(), 9\n    equals \"0109\".toInt(), 109\n  \n    equals \"F\".toInt(16), 15\n  \n  test \"#withoutExtension\", ->\n    equals \"neat.png\".withoutExtension(), \"neat\"\n    equals \"not a file\".withoutExtension(), \"not a file\"\n",
              "type": "blob"
            },
            "util.coffee.md": {
              "path": "util.coffee.md",
              "mode": "100644",
              "content": "Util\n====\n\nUtility methods shared in our extensions.\n\n    module.exports =\n\nExtend an object with the properties of other objects.\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
              "type": "blob"
            }
          },
          "distribution": {
            "array": {
              "path": "array",
              "content": "(function() {\n  var extend, identity, mod, rand,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Array.prototype, {\n    average: function() {\n      return this.sum() / this.length;\n    },\n    compact: function() {\n      return this.select(function(element) {\n        return element != null;\n      });\n    },\n    copy: function() {\n      return this.concat();\n    },\n    clear: function() {\n      this.length = 0;\n      return this;\n    },\n    flatten: function() {\n      return this.inject([], function(a, b) {\n        return a.concat(b);\n      });\n    },\n    invoke: function() {\n      var args, method;\n      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      return this.map(function(element) {\n        return element[method].apply(element, args);\n      });\n    },\n    rand: function() {\n      return this[rand(this.length)];\n    },\n    remove: function(object) {\n      var index;\n      index = this.indexOf(object);\n      if (index >= 0) {\n        return this.splice(index, 1)[0];\n      } else {\n        return void 0;\n      }\n    },\n    include: function(element) {\n      return this.indexOf(element) !== -1;\n    },\n    each: function(iterator, context) {\n      var element, i, _i, _len;\n      if (this.forEach) {\n        this.forEach(iterator, context);\n      } else {\n        for (i = _i = 0, _len = this.length; _i < _len; i = ++_i) {\n          element = this[i];\n          iterator.call(context, element, i, this);\n        }\n      }\n      return this;\n    },\n    eachPair: function(iterator, context) {\n      var a, b, i, j, length, _results;\n      length = this.length;\n      i = 0;\n      _results = [];\n      while (i < length) {\n        a = this[i];\n        j = i + 1;\n        i += 1;\n        _results.push((function() {\n          var _results1;\n          _results1 = [];\n          while (j < length) {\n            b = this[j];\n            j += 1;\n            _results1.push(iterator.call(context, a, b));\n          }\n          return _results1;\n        }).call(this));\n      }\n      return _results;\n    },\n    eachWithObject: function(object, iterator, context) {\n      this.each(function(element, i, self) {\n        return iterator.call(context, element, object, i, self);\n      });\n      return object;\n    },\n    eachSlice: function(n, iterator, context) {\n      var i, len;\n      len = this.length / n;\n      i = -1;\n      while (++i < len) {\n        iterator.call(context, this.slice(i * n, (i + 1) * n), i * n, this);\n      }\n      return this;\n    },\n    pipeline: function(input) {\n      return this.inject(input, function(input, fn) {\n        return fn(input);\n      });\n    },\n    shuffle: function() {\n      var shuffledArray;\n      shuffledArray = [];\n      this.each(function(element) {\n        return shuffledArray.splice(rand(shuffledArray.length + 1), 0, element);\n      });\n      return shuffledArray;\n    },\n    first: function() {\n      return this[0];\n    },\n    last: function() {\n      return this[this.length - 1];\n    },\n    extremes: function(fn) {\n      var max, maxResult, min, minResult;\n      if (fn == null) {\n        fn = identity;\n      }\n      min = max = void 0;\n      minResult = maxResult = void 0;\n      this.each(function(object) {\n        var result;\n        result = fn(object);\n        if (min != null) {\n          if (result < minResult) {\n            min = object;\n            minResult = result;\n          }\n        } else {\n          min = object;\n          minResult = result;\n        }\n        if (max != null) {\n          if (result > maxResult) {\n            max = object;\n            return maxResult = result;\n          }\n        } else {\n          max = object;\n          return maxResult = result;\n        }\n      });\n      return {\n        min: min,\n        max: max\n      };\n    },\n    maxima: function(valueFunction) {\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      return this.inject([-Infinity, []], function(memo, item) {\n        var maxItems, maxValue, value;\n        value = valueFunction(item);\n        maxValue = memo[0], maxItems = memo[1];\n        if (value > maxValue) {\n          return [value, [item]];\n        } else if (value === maxValue) {\n          return [value, maxItems.concat(item)];\n        } else {\n          return memo;\n        }\n      }).last();\n    },\n    maximum: function(valueFunction) {\n      return this.maxima(valueFunction).first();\n    },\n    minima: function(valueFunction) {\n      var inverseFn;\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      inverseFn = function(x) {\n        return -valueFunction(x);\n      };\n      return this.maxima(inverseFn);\n    },\n    minimum: function(valueFunction) {\n      return this.minima(valueFunction).first();\n    },\n    wrap: function(start, length) {\n      var end, i, result;\n      if (length != null) {\n        end = start + length;\n        i = start;\n        result = [];\n        while (i < end) {\n          result.push(this[mod(i, this.length)]);\n          i += 1;\n        }\n        return result;\n      } else {\n        return this[mod(start, this.length)];\n      }\n    },\n    partition: function(iterator, context) {\n      var falseCollection, trueCollection;\n      trueCollection = [];\n      falseCollection = [];\n      this.each(function(element) {\n        if (iterator.call(context, element)) {\n          return trueCollection.push(element);\n        } else {\n          return falseCollection.push(element);\n        }\n      });\n      return [trueCollection, falseCollection];\n    },\n    select: function(iterator, context) {\n      return this.partition(iterator, context)[0];\n    },\n    without: function(values) {\n      return this.reject(function(element) {\n        return values.include(element);\n      });\n    },\n    reject: function(iterator, context) {\n      return this.partition(iterator, context)[1];\n    },\n    inject: function(initial, iterator) {\n      this.each(function(element) {\n        return initial = iterator(initial, element);\n      });\n      return initial;\n    },\n    sum: function() {\n      return this.inject(0, function(sum, n) {\n        return sum + n;\n      });\n    },\n    product: function() {\n      return this.inject(1, function(product, n) {\n        return product * n;\n      });\n    },\n    unique: function() {\n      return this.inject([], function(results, element) {\n        if (results.indexOf(element) === -1) {\n          results.push(element);\n        }\n        return results;\n      });\n    },\n    zip: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.map(function(element, index) {\n        var output;\n        output = args.map(function(arr) {\n          return arr[index];\n        });\n        output.unshift(element);\n        return output;\n      });\n    }\n  });\n\n  identity = function(x) {\n    return x;\n  };\n\n  rand = function(n) {\n    return Math.floor(n * Math.random());\n  };\n\n  mod = function(n, base) {\n    var result;\n    result = n % base;\n    if (result < 0 && base > 0) {\n      result += base;\n    }\n    return result;\n  };\n\n}).call(this);\n\n//# sourceURL=array.coffee",
              "type": "blob"
            },
            "extensions": {
              "path": "extensions",
              "content": "(function() {\n  require(\"./array\");\n\n  require(\"./function\");\n\n  require(\"./number\");\n\n  require(\"./string\");\n\n}).call(this);\n\n//# sourceURL=extensions.coffee",
              "type": "blob"
            },
            "function": {
              "path": "function",
              "content": "(function() {\n  var extend,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Function.prototype, {\n    once: function() {\n      var func, memo, ran;\n      func = this;\n      ran = false;\n      memo = void 0;\n      return function() {\n        if (ran) {\n          return memo;\n        }\n        ran = true;\n        return memo = func.apply(this, arguments);\n      };\n    },\n    debounce: function(wait) {\n      var func, timeout;\n      timeout = null;\n      func = this;\n      return function() {\n        var args, context, later;\n        context = this;\n        args = arguments;\n        later = function() {\n          timeout = null;\n          return func.apply(context, args);\n        };\n        clearTimeout(timeout);\n        return timeout = setTimeout(later, wait);\n      };\n    },\n    delay: function() {\n      var args, func, wait;\n      wait = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      func = this;\n      return setTimeout(function() {\n        return func.apply(null, args);\n      }, wait);\n    },\n    defer: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.delay.apply(this, [1].concat(args));\n    }\n  });\n\n  extend(Function, {\n    identity: function(x) {\n      return x;\n    },\n    noop: function() {}\n  });\n\n}).call(this);\n\n//# sourceURL=function.coffee",
              "type": "blob"
            },
            "number": {
              "path": "number",
              "content": "(function() {\n  var extend;\n\n  [\"abs\", \"ceil\", \"floor\", \"round\"].forEach(function(method) {\n    return Number.prototype[method] = function() {\n      return Math[method](this);\n    };\n  });\n\n  extend = require(\"./util\").extend;\n\n  extend(Number.prototype, {\n    circularPoints: function() {\n      var n, _i, _results;\n      n = this;\n      return (function() {\n        _results = [];\n        for (var _i = 0; 0 <= n ? _i <= n : _i >= n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(i) {\n        return Point.fromAngle((i / n).turns);\n      });\n    },\n    clamp: function(min, max) {\n      if ((min != null) && (max != null)) {\n        return Math.min(Math.max(this, min), max);\n      } else if (min != null) {\n        return Math.max(this, min);\n      } else if (max != null) {\n        return Math.min(this, max);\n      } else {\n        return this;\n      }\n    },\n    mod: function(base) {\n      var result;\n      result = this % base;\n      if (result < 0 && base > 0) {\n        result += base;\n      }\n      return result;\n    },\n    sign: function() {\n      if (this > 0) {\n        return 1;\n      } else if (this < 0) {\n        return -1;\n      } else {\n        return 0;\n      }\n    },\n    even: function() {\n      return this.mod(2) === 0;\n    },\n    odd: function() {\n      return this.mod(2) === 1;\n    },\n    times: function(iterator, context) {\n      var i;\n      i = -1;\n      while (++i < this) {\n        iterator.call(context, i);\n      }\n      return i;\n    },\n    snap: function(resolution) {\n      return (n / resolution).floor() * resolution;\n    },\n    truncate: function() {\n      if (this > 0) {\n        return this.floor();\n      } else if (this < 0) {\n        return this.ceil();\n      } else {\n        return this;\n      }\n    }\n  });\n\n  if (!5..rotations) {\n    Object.defineProperty(Number.prototype, 'rotations', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..rotation) {\n    Object.defineProperty(Number.prototype, 'rotation', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!5..turns) {\n    Object.defineProperty(Number.prototype, 'turns', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..turn) {\n    Object.defineProperty(Number.prototype, 'turn', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!2..degrees) {\n    Object.defineProperty(Number.prototype, 'degrees', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  if (!1..degree) {\n    Object.defineProperty(Number.prototype, 'degree', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  Math.TAU = 2 * Math.PI;\n\n}).call(this);\n\n//# sourceURL=number.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"extensions\"};",
              "type": "blob"
            },
            "string": {
              "path": "string",
              "content": "(function() {\n  var extend;\n\n  extend = require(\"./util\").extend;\n\n  extend(String.prototype, {\n    blank: function() {\n      return /^\\s*$/.test(this);\n    },\n    parse: function() {\n      var e;\n      try {\n        return JSON.parse(this.toString());\n      } catch (_error) {\n        e = _error;\n        return this.toString();\n      }\n    },\n    startsWith: function(str) {\n      return this.lastIndexOf(str, 0) === 0;\n    },\n    endsWith: function(str) {\n      return this.indexOf(str, this.length - str.length) !== -1;\n    },\n    extension: function() {\n      var extension, _ref;\n      if (extension = (_ref = this.match(/\\.([^\\.]*)$/, '')) != null ? _ref.last() : void 0) {\n        return extension;\n      } else {\n        return '';\n      }\n    },\n    withoutExtension: function() {\n      return this.replace(/\\.[^\\.]*$/, '');\n    },\n    toInt: function(base) {\n      if (base == null) {\n        base = 10;\n      }\n      return parseInt(this, base);\n    }\n  });\n\n}).call(this);\n\n//# sourceURL=string.coffee",
              "type": "blob"
            },
            "test/array": {
              "path": "test/array",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../array\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Array\", function() {\n    test(\"#average\", function() {\n      return equals([1, 3, 5, 7].average(), 4);\n    });\n    test(\"#compact\", function() {\n      var a, compacted;\n      a = [0, 1, void 0, 2, null, 3, '', 4];\n      compacted = a.compact();\n      equals(compacted[0], 0);\n      equals(compacted[1], 1);\n      equals(compacted[2], 2);\n      equals(compacted[3], 3);\n      equals(compacted[4], '');\n      return equals(compacted[5], 4);\n    });\n    test(\"#copy\", function() {\n      var a, b;\n      a = [1, 2, 3];\n      b = a.copy();\n      ok(a !== b, \"Original array is not the same array as the copied one\");\n      ok(a.length === b.length, \"Both arrays are the same size\");\n      return ok(a[0] === b[0] && a[1] === b[1] && a[2] === b[2], \"The elements of the two arrays are equal\");\n    });\n    test(\"#flatten\", function() {\n      var array, flattenedArray;\n      array = [[0, 1], [2, 3], [4, 5]];\n      flattenedArray = array.flatten();\n      equals(flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\");\n      equals(flattenedArray.first(), 0, \"First element should be first element in first sub-array\");\n      return equals(flattenedArray.last(), 5, \"Last element should be last element in last sub-array\");\n    });\n    test(\"#rand\", function() {\n      var array;\n      array = [1, 2, 3];\n      ok(array.indexOf(array.rand()) !== -1, \"Array includes randomly selected element\");\n      ok([5].rand() === 5, \"[5].rand() === 5\");\n      return ok([].rand() === void 0, \"[].rand() === undefined\");\n    });\n    test(\"#remove\", function() {\n      var array;\n      equals([1, 2, 3].remove(2), 2, \"[1,2,3].remove(2) === 2\");\n      equals([1, 3].remove(2), void 0, \"[1,3].remove(2) === undefined\");\n      equals([1, 3].remove(3), 3, \"[1,3].remove(3) === 3\");\n      array = [1, 2, 3];\n      array.remove(2);\n      ok(array.length === 2, \"array = [1,2,3]; array.remove(2); array.length === 2\");\n      array.remove(3);\n      return ok(array.length === 1, \"array = [1,3]; array.remove(3); array.length === 1\");\n    });\n    test(\"#map\", function() {\n      return equals([1].map(function(x) {\n        return x + 1;\n      })[0], 2);\n    });\n    test(\"#invoke\", function() {\n      var results;\n      results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3);\n      equals(results[0], \"hel\");\n      equals(results[1], \"wor\");\n      return equals(results[2], \"coo\");\n    });\n    test(\"#each\", function() {\n      var array, count;\n      array = [1, 2, 3];\n      count = 0;\n      equals(array, array.each(function() {\n        return count++;\n      }));\n      return equals(array.length, count);\n    });\n    test(\"#eachPair\", function() {\n      var array, sum;\n      array = [1, 2, 3];\n      sum = 0;\n      array.eachPair(function(a, b) {\n        return sum += a + b;\n      });\n      return equals(sum, 12);\n    });\n    test(\"#eachWithObject\", function() {\n      var array, result;\n      array = [1, 2, 3];\n      result = array.eachWithObject({}, function(element, hash) {\n        return hash[element] = (element + 1).toString();\n      });\n      equals(result[1], \"2\");\n      equals(result[2], \"3\");\n      return equals(result[3], \"4\");\n    });\n    test(\"#shuffle\", function() {\n      var array, shuffledArray;\n      array = [0, 1, 2, 3, 4, 5];\n      shuffledArray = array.shuffle();\n      shuffledArray.each(function(element) {\n        return ok(array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\");\n      });\n      return array.each(function(element) {\n        return ok(shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\");\n      });\n    });\n    test(\"#first\", function() {\n      equals([2].first(), 2);\n      equals([1, 2, 3].first(), 1);\n      return equals([].first(), void 0);\n    });\n    test(\"#last\", function() {\n      equals([2].last(), 2);\n      equals([1, 2, 3].last(), 3);\n      return equals([].first(), void 0);\n    });\n    test(\"#maxima\", function() {\n      var maxima;\n      maxima = [-52, 0, 78].maxima();\n      maxima.each(function(n) {\n        return equals(n, 78);\n      });\n      maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima();\n      equals(3, maxima.length);\n      return maxima.each(function(n) {\n        return equals(n, 1);\n      });\n    });\n    test(\"#maximum\", function() {\n      return equals([-345, 38, 8347].maximum(), 8347);\n    });\n    test(\"#maximum with function\", function() {\n      return equals([3, 4, 5].maximum(function(n) {\n        return n % 4;\n      }), 3);\n    });\n    test(\"#minima\", function() {\n      var minima;\n      minima = [-52, 0, 78].minima();\n      minima.each(function(n) {\n        return equals(n, -52);\n      });\n      minima = [0, 0, 1, 0, 1, 0, 1, 0].minima();\n      equals(5, minima.length);\n      return minima.each(function(n) {\n        return equals(n, 0);\n      });\n    });\n    test(\"#minimum\", function() {\n      return equals([-345, 38, 8347].minimum(), -345);\n    });\n    test(\"#pipeline\", function() {\n      var pipe;\n      pipe = [\n        function(x) {\n          return x * x;\n        }, function(x) {\n          return x - 10;\n        }\n      ];\n      return equals(pipe.pipeline(5), 15);\n    });\n    test(\"#extremes\", function() {\n      var array, extremes;\n      array = [-7, 1, 11, 94];\n      extremes = array.extremes();\n      equals(extremes.min, -7, \"Min is -7\");\n      return equals(extremes.max, 94, \"Max is 94\");\n    });\n    test(\"#extremes with fn\", function() {\n      var array, extremes;\n      array = [1, 11, 94];\n      extremes = array.extremes(function(value) {\n        return value % 11;\n      });\n      equals(extremes.min, 11, extremes.min);\n      return equals(extremes.max, 94, extremes.max);\n    });\n    test(\"#sum\", function() {\n      equals([].sum(), 0, \"Empty array sums to zero\");\n      equals([2].sum(), 2, \"[2] sums to 2\");\n      return equals([1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\");\n    });\n    test(\"#eachSlice\", function() {\n      return [1, 2, 3, 4, 5, 6].eachSlice(2, function(array) {\n        equals(array[0] % 2, 1);\n        return equals(array[1] % 2, 0);\n      });\n    });\n    test(\"#without\", function() {\n      var array, excluded;\n      array = [1, 2, 3, 4];\n      excluded = array.without([2, 4]);\n      equals(excluded[0], 1);\n      return equals(excluded[1], 3);\n    });\n    test(\"#clear\", function() {\n      var array;\n      array = [1, 2, 3, 4];\n      equals(array.length, 4);\n      equals(array[0], 1);\n      array.clear();\n      equals(array.length, 0);\n      return equals(array[0], void 0);\n    });\n    test(\"#unique\", function() {\n      var array;\n      array = [0, 0, 0, 1, 1, 1, 2, 3];\n      equals(array.unique().first(), 0);\n      equals(array.unique().last(), 3);\n      return equals(array.unique().length, 4);\n    });\n    test(\"#wrap\", function() {\n      var array;\n      array = [0, 1, 2, 3, 4];\n      equals(array.wrap(0), 0);\n      equals(array.wrap(-1), 4);\n      return equals(array.wrap(2), 2);\n    });\n    return test(\"#zip\", function() {\n      var a, b, c, output;\n      a = [1, 2, 3];\n      b = [4, 5, 6];\n      c = [7, 8];\n      output = a.zip(b, c);\n      equals(output[0][0], 1);\n      equals(output[0][1], 4);\n      equals(output[0][2], 7);\n      return equals(output[2][2], void 0);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/array.coffee",
              "type": "blob"
            },
            "test/function": {
              "path": "test/function",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../function\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Function\", function() {\n    test(\"#once\", function() {\n      var addScore, onceScore, score;\n      score = 0;\n      addScore = function() {\n        return score += 100;\n      };\n      onceScore = addScore.once();\n      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function() {\n        return onceScore();\n      });\n      return equals(score, 100);\n    });\n    test(\".identity\", function() {\n      var I;\n      I = Function.identity;\n      return [0, 1, true, false, null, void 0].each(function(x) {\n        return equals(I(x), x);\n      });\n    });\n    test(\"#debounce\", function(done) {\n      var fn;\n      fn = (function() {\n        ok(true);\n        return done();\n      }).debounce(1);\n      fn();\n      fn();\n      return fn();\n    });\n    test(\"#delay\", function(done) {\n      var fn;\n      fn = function(x, y) {\n        equals(x, 3);\n        equals(y, \"testy\");\n        return done();\n      };\n      return fn.delay(25, 3, \"testy\");\n    });\n    return test(\"#defer\", function(done) {\n      var fn;\n      fn = function(x) {\n        equals(x, 3);\n        return done();\n      };\n      return fn.defer(3);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/function.coffee",
              "type": "blob"
            },
            "test/number": {
              "path": "test/number",
              "content": "(function() {\n  var equalEnough, equals, ok, test;\n\n  require(\"../number\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  equalEnough = function(expected, actual, tolerance, message) {\n    message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n    return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n  };\n\n  describe(\"Number\", function() {\n    test(\"#abs\", function() {\n      equals(5..abs(), 5, \"(5).abs() equals 5\");\n      equals(4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\");\n      equals((-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\");\n      return equals(0..abs(), 0, \"(0).abs() equals 0\");\n    });\n    test(\"#ceil\", function() {\n      equals(4.9.ceil(), 5, \"(4.9).floor() equals 5\");\n      equals(4.2.ceil(), 5, \"(4.2).ceil() equals 5\");\n      equals((-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\");\n      return equals(3..ceil(), 3, \"(3).ceil() equals 3\");\n    });\n    test(\"#clamp\", function() {\n      equals(5..clamp(0, 3), 3);\n      equals(5..clamp(-1, 0), 0);\n      equals((-5).clamp(0, 1), 0);\n      equals(1..clamp(0, null), 1);\n      equals((-1).clamp(0, null), 0);\n      equals((-10).clamp(-5, 0), -5);\n      equals((-10).clamp(null, 0), -10);\n      return equals(50..clamp(null, 10), 10);\n    });\n    test(\"#floor\", function() {\n      equals(4.9.floor(), 4, \"(4.9).floor() equals 4\");\n      equals(4.2.floor(), 4, \"(4.2).floor() equals 4\");\n      equals((-1.2).floor(), -2, \"(-1.2).floor() equals -2\");\n      return equals(3..floor(), 3, \"(3).floor() equals 3\");\n    });\n    test(\"#round\", function() {\n      equals(4.5.round(), 5, \"(4.5).round() equals 5\");\n      return equals(4.4.round(), 4, \"(4.4).round() equals 4\");\n    });\n    test(\"#sign\", function() {\n      equals(5..sign(), 1, \"Positive number's sign is 1\");\n      equals((-3).sign(), -1, \"Negative number's sign is -1\");\n      return equals(0..sign(), 0, \"Zero's sign is 0\");\n    });\n    test(\"#even\", function() {\n      [0, 2, -32].each(function(n) {\n        return ok(n.even(), \"\" + n + \" is even\");\n      });\n      return [1, -1, 2.2, -3.784].each(function(n) {\n        return equals(n.even(), false, \"\" + n + \" is not even\");\n      });\n    });\n    test(\"#odd\", function() {\n      [1, 9, -37].each(function(n) {\n        return ok(n.odd(), \"\" + n + \" is odd\");\n      });\n      return [0, 32, 2.2, -1.1].each(function(n) {\n        return equals(n.odd(), false, \"\" + n + \" is not odd\");\n      });\n    });\n    test(\"#times\", function() {\n      var n;\n      n = 5;\n      return equals(n.times(function() {}), n, \"returns n\");\n    });\n    test(\"#times called correct amount\", function() {\n      var count, n;\n      n = 5;\n      count = 0;\n      n.times(function() {\n        return count++;\n      });\n      return equals(n, count, \"returns n\");\n    });\n    test(\"#mod should have a positive result when used with a positive base and a negative number\", function() {\n      var n;\n      n = -3;\n      return equals(n.mod(8), 5, \"Should 'wrap' and be positive.\");\n    });\n    test(\"#degrees\", function() {\n      equals(180..degrees, Math.PI);\n      return equals(1..degree, Math.TAU / 360);\n    });\n    test(\"#rotations\", function() {\n      equals(1..rotation, Math.TAU);\n      return equals(0.5.rotations, Math.TAU / 2);\n    });\n    return test(\"#turns\", function() {\n      equals(1..turn, Math.TAU);\n      return equals(0.5.turns, Math.TAU / 2);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/number.coffee",
              "type": "blob"
            },
            "test/string": {
              "path": "test/string",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../string\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"String\", function() {\n    test(\"#blank\", function() {\n      equals(\"  \".blank(), true, \"A string containing only whitespace should be blank\");\n      equals(\"a\".blank(), false, \"A string that contains a letter should not be blank\");\n      equals(\"  a \".blank(), false);\n      return equals(\"  \\n\\t \".blank(), true);\n    });\n    test(\"#extension\", function() {\n      equals(\"README\".extension(), \"\");\n      equals(\"README.md\".extension(), \"md\");\n      equals(\"jquery.min.js\".extension(), \"js\");\n      return equals(\"src/bouse.js.coffee\".extension(), \"coffee\");\n    });\n    test(\"#parse\", function() {\n      equals(\"true\".parse(), true, \"parsing 'true' should equal boolean true\");\n      equals(\"false\".parse(), false, \"parsing 'true' should equal boolean true\");\n      equals(\"7.2\".parse(), 7.2, \"numbers should be cool too\");\n      equals('{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\");\n      return ok(''.parse() === '', \"Empty string parses to exactly the empty string\");\n    });\n    test(\"#startsWith\", function() {\n      ok(\"cool\".startsWith(\"coo\"));\n      return equals(\"cool\".startsWith(\"oo\"), false);\n    });\n    test(\"#toInt\", function() {\n      equals(\"31.3\".toInt(), 31);\n      equals(\"31.\".toInt(), 31);\n      equals(\"-1.02\".toInt(), -1);\n      equals(\"009\".toInt(), 9);\n      equals(\"0109\".toInt(), 109);\n      return equals(\"F\".toInt(16), 15);\n    });\n    return test(\"#withoutExtension\", function() {\n      equals(\"neat.png\".withoutExtension(), \"neat\");\n      return equals(\"not a file\".withoutExtension(), \"not a file\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/string.coffee",
              "type": "blob"
            },
            "util": {
              "path": "util",
              "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=util.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "extensions",
          "repository": {
            "id": 13577503,
            "name": "extensions",
            "full_name": "distri/extensions",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/extensions",
            "description": "",
            "fork": false,
            "url": "https://api.github.com/repos/distri/extensions",
            "forks_url": "https://api.github.com/repos/distri/extensions/forks",
            "keys_url": "https://api.github.com/repos/distri/extensions/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/extensions/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/extensions/teams",
            "hooks_url": "https://api.github.com/repos/distri/extensions/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/extensions/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/extensions/events",
            "assignees_url": "https://api.github.com/repos/distri/extensions/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/extensions/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/extensions/tags",
            "blobs_url": "https://api.github.com/repos/distri/extensions/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/extensions/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/extensions/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/extensions/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/extensions/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/extensions/languages",
            "stargazers_url": "https://api.github.com/repos/distri/extensions/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/extensions/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/extensions/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/extensions/subscription",
            "commits_url": "https://api.github.com/repos/distri/extensions/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/extensions/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/extensions/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/extensions/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/extensions/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/extensions/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/extensions/merges",
            "archive_url": "https://api.github.com/repos/distri/extensions/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/extensions/downloads",
            "issues_url": "https://api.github.com/repos/distri/extensions/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/extensions/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/extensions/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/extensions/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/extensions/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/extensions/releases{/id}",
            "created_at": "2013-10-15T01:14:11Z",
            "updated_at": "2013-12-24T01:04:48Z",
            "pushed_at": "2013-12-24T01:04:20Z",
            "git_url": "git://github.com/distri/extensions.git",
            "ssh_url": "git@github.com:distri/extensions.git",
            "clone_url": "https://github.com/distri/extensions.git",
            "svn_url": "https://github.com/distri/extensions",
            "homepage": null,
            "size": 964,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "inflector": {
          "source": {
            ".gitignore": {
              "path": ".gitignore",
              "content": "dist/\ndocs/\nnode_modules/\n",
              "mode": "100644",
              "type": "blob"
            },
            ".travis.yml": {
              "path": ".travis.yml",
              "content": "language: node_js\nnode_js:\n  - \"0.11\"\n  - \"0.10\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "[![Build Status](https://travis-ci.org/STRd6/inflecta.png?branch=master)](https://travis-ci.org/STRd6/inflecta)\n\nInflecta\n========\n\nWhat? Another ActiveSupport::Inflector port? Yeah, sorry.\n\nThe primary difference between **inflecta** and other ports is that **inflecta** translates the Ruby idioms to JavaScript idioms. It goes all the way.\n\nThe most important method is `constantize` which is not even attempted in most ports. In fact, the only reason we really need to pluralize or singularize things is so that we can automatically determine the class to instantiate from the name of the data key. That is the whole point of `ActiveSupport::Inflector`, `humanize` is just a nice side effect.\n\nIn Ruby the scope resolution operator is `::`. JavaScript doesn't have any such thing, instead people generally namespace classes using a module pattern like `MyApp.Models.MyModel`. For that reason **inflecta** uses `.` rather than blindly copying the Ruby scope resolution operator.\n\nIn JavaScript variables and properties are usually named with camel case. In Ruby they are named with underscores. It generally doesn't make a big difference, but if we want to implement `humanize` then it better work with our default conventions.\n\nReal sorry about the name, but inflector was taken on npm.\n",
              "mode": "100644",
              "type": "blob"
            },
            "interactive_runtime.coffee.md": {
              "path": "interactive_runtime.coffee.md",
              "content": "Interactive Runtime\n-------------------\n\nRegister our interactive documentation runtime components.\n\n    inflector = require \"/source/inflector\"\n\n    Object.keys(inflector).forEach (method) ->\n      return if method is \"version\"\n      return if method is \"pollute\"\n\n      Interactive.register method, ({source, runtimeElement}) ->\n        outputElement = document.createElement \"pre\"\n        runtimeElement.empty().append outputElement\n\n        outputElement.textContent = source.split(\"\\n\").map (word) ->\n          result = inflector[method](word)\n        .join(\"\\n\")\n",
              "mode": "100644",
              "type": "blob"
            },
            "package.json": {
              "path": "package.json",
              "content": "{\n  \"name\": \"inflecta\",\n  \"version\": \"0.8.3\",\n  \"description\": \"A better port of ActiveSupport Inflector to JS.\",\n  \"main\": \"dist/inflector.js\",\n  \"scripts\": {\n    \"prepublish\": \"script/prepublish\",\n    \"test\": \"script/test\"\n  },\n  \"files\": [\n    \"dist\"\n  ],\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/STRd6/inflector\"\n  },\n  \"keywords\": [\n    \"inflector\"\n  ],\n  \"devDependencies\": {\n    \"should\": \"1.2.2\",\n    \"coffee-script\": \"~1.6.3\",\n    \"mocha\": \"~1.12.0\",\n    \"uglify-js\": \"~2.3.6\",\n    \"docco\": \"~0.6.2\",\n    \"browserify\": \"~2.26.0\"\n  },\n  \"author\": \"\",\n  \"license\": \"MIT\",\n  \"bugs\": {\n    \"url\": \"https://github.com/STRd6/inflector/issues\"\n  }\n}\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.2.1\"\nentryPoint: \"source/inflector\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "script/doc": {
              "path": "script/doc",
              "content": "#!/bin/bash\nset -e\n\nmkdir -p docs\nrm -rf docs/*\n\nnode_modules/.bin/docco -t resources/docco.jst source/*\nnode_modules/.bin/coffee -co docs/javascripts resources/interactive.litcoffee\nnode_modules/.bin/browserify -r ./dist/inflector.js > docs/javascripts/inflector.js\n\ncp -r resources/docco.css resources/public docs\ncp resources/*.js docs/javascripts\ncp docs/inflector.html docs/index.html\n",
              "mode": "100644",
              "type": "blob"
            },
            "script/gh-pages": {
              "path": "script/gh-pages",
              "content": "#!/bin/bash\n\nset -e\n\ncd docs\ngit add .\ngit ci -am \"gh-pages\"\ngit pull\ngit push\n",
              "mode": "100644",
              "type": "blob"
            },
            "script/prepublish": {
              "path": "script/prepublish",
              "content": "#!/bin/bash\n\n./node_modules/.bin/coffee -co dist/ source/\n\nfor file in dist/*.js\ndo\n  ./node_modules/.bin/uglifyjs $file > tmp.js\n  mv tmp.js $file\ndone\n",
              "mode": "100644",
              "type": "blob"
            },
            "script/test": {
              "path": "script/test",
              "content": "#!/bin/bash\n\nnode_modules/.bin/mocha \\\n  --compilers coffee:coffee-script \\\n  --reporter spec \\\n  --require test_helper.coffee.md\n",
              "mode": "100644",
              "type": "blob"
            },
            "source/inflector.coffee.md": {
              "path": "source/inflector.coffee.md",
              "content": "Inflecta\n========\n\nLoad our word lists and rules for inflecting from [rules](rules.html).\n\n    {\n      nonTitlecasedWords\n      pluralRules\n      singularRules\n      uncountableWords\n    } = require(\"./rules\")\n\nThese are regular expressions used for converting between String formats.\n\n    idSuffix = RegExp(\"(_ids|_id)$\", \"g\")\n    underbar = RegExp(\"_\", \"g\")\n    spaceOrUnderbar = RegExp(\"[ _]\", \"g\")\n    uppercase = RegExp(\"([A-Z])\", \"g\")\n    underbarPrefix = RegExp(\"^_\")\n    scopeResolution = \".\"\n    fileSeparator = \"/\"\n\nThe apply rules helper method applies a rules based replacement to a String.\n\n    applyRules = (string, rules) ->\n      return string if uncountableWords.indexOf(string.toLowerCase()) > -1\n\nReduce the list of rules to the first substitution that matches and apply it.\n\n      rules.reduce((result, [rule, replacer]) ->\n        result or\n          if string.match(rule)\n            string.replace(rule, replacer)\n\nReturn the string unmodified if no rule matches.\n\n      , null) or string\n\nAn object to hold all of our inflection methods.\n\n    inflector =\n\nConvert a string to a pluralized form by applying a list of rules. The rules contain regexes that match and replace portions of the string to transform it.\n\n>     #! pluralize\n>     address\n>     boss\n>     bus\n>     child\n>     man\n>     woman\n>     zombie\n>     octopus\n>     walrus\n>     person\n>     status\n\n      pluralize: (string) ->\n        applyRules string, pluralRules\n\nConversely we can also convert a string to a singular form by applying another list of rules.\n\n>     #! singularize\n>     addresses\n>     bosses\n>     buses\n>     children\n>     men\n>     women\n>     zombies\n>     octopi\n>     walruses\n>     people\n>     statuses\n\n      singularize: (string) ->\n        applyRules string, singularRules\n\nCamelize converts an underscore separated identifier into camel case. The optional parameter lowercaseFirstLetter can be passed in as `true` to prevent the default behavior of capitalizing it. File separators `/` are translated to the scope resolution operator `.`.\n\n>     #! camelize\n>     message_properties\n>     models/person\n\n      camelize: (string, lowercaseFirstLetter) ->\n        string.split(fileSeparator).map (pathItem) ->\n          pathItem.split(underbar).map (chunk, i) ->\n            if lowercaseFirstLetter and i is 0\n              chunk\n            else\n              chunk.charAt(0).toUpperCase() + chunk.substring(1)\n\n          .join(\"\")\n        .join scopeResolution\n\nConstantize looks up a class from within a namespace. For example `\"MyApp.Models.MyModel\".constantize()` will look up that constant in the global namespace. You can optionally pass the root namespace as an argument. `\"Models.MyModel\".constantize(MyApp)` will look up the constant in with the given namespace as a root.\n\n      constantize: (string, rootModule) ->\n        target = rootModule ? (global ? window)\n\n        target = target[item] for item in string.split scopeResolution\n\n        return target\n\nUnderscoring converts an identifier into lowercase separated by underscores. This is handy for file names or interfacing with services that prefer underscored names to camel cased.\n\nCamel cased words are returned as lower cased and underscored. Additionally the scope resolution symbol `.` is translated to file separator: '/'.\n\n>     #! underscore\n>     messageProperties\n>     Models.Person\n\n      underscore: (string) ->\n        string.split(scopeResolution).map (chunk) ->\n          chunk\n            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')\n            .replace(/([a-z\\d])([A-Z])/g, '$1_$2')\n            .replace(/-/g, '_')\n            .toLowerCase()\n        .join(fileSeparator).toLowerCase()\n\nHumanize takes words that computers like to read and converts them to a form that is easier for people. Lower case underscored words will be returned in humanized form, as will camel cased words.\n\nPassing true as the optional parameter will maintain the first letter as lowercase. The default is to capitalize the first letter if false or no optional parameter is passed.\n\n>     #! humanize\n>     message_property_id\n>     userPreferences\n\n      humanize: (string, lowFirstLetter) ->\n        string = inflector.underscore(string)\n          .toLowerCase()\n          .replace(idSuffix, \"\")\n          .replace(underbar, \" \")\n\n        unless lowFirstLetter\n          string = inflector.capitalize(string)\n\n        return string\n\nWhen capitalizing a string all characters will be lower case and the first will be upper.\n\n>     #! capitalize\n>     egg basket\n>     user preferences\n\n      capitalize: (string) ->\n        string = string.toLowerCase()\n        string.substring(0, 1).toUpperCase() + string.substring(1)\n\nTitleize capitalizes words as you would for a book title or page. Each principle word is capitalized.\n\n>     #! titleize\n>     a man for all seasons\n>     customer_support\n>     aboutUs\n\n      titleize: (string) ->\n        result = string\n          .toLowerCase()\n          .replace(underbar, \" \")\n          .split(\" \")\n          .map (chunk) ->\n            chunk.split(\"-\").map (piece) ->\n              if nonTitlecasedWords.indexOf(piece.toLowerCase()) < 0\n                inflector.capitalize(piece)\n              else\n                piece\n            .join(\"-\")\n\n          .join(\" \")\n\n        result.substring(0, 1).toUpperCase() + result.substring(1)\n\nTableize converts property names to something that would be used for a table name in SQL. It converts camel cased words into their underscored plural form.\n\n>     #! tableize\n>     sandwich\n>     userPreferences\n\n      tableize: (string) ->\n        inflector.pluralize(inflector.underscore(string))\n\nClassify converts a string into something that would be suitable for lookup via constantize. Underscored plural nouns become the camel cased singular form.\n\n>     #! classify\n>     sandwich\n>     user_preference\n>     app/models/person\n\n      classify: (str) ->\n        inflector.singularize(inflector.camelize(str))\n\nConvert a string with spaces and mixed case into all lower case with spaces replaced with dashes. This is the style that Github branch names are commonly in.\n\n      dasherize: (str) ->\n        str.trim()\n          .replace(/\\s+/g, \"-\")\n          .toLowerCase()\n\nAdds all of these sweet inflections to `String.prototype`. To each their own.\n\n`require('inflecta').pollute()` if you are so inclined.\n\n      pollute: ->\n        Object.keys(inflector).forEach (key) ->\n          return if key is \"version\"\n          return if key is \"pollute\"\n\n          String::[key] = (args...) ->\n            inflector[key](this, args...)\n\n        return inflector\n\nExport the inflector.\n\n    module.exports = inflector\n\nInteractive Docs\n----------------\n\nSet up interactive demos for docs.\n\n[Interactive Runtime](./interactive_runtime)\n\n>     #! setup\n>     require \"/interactive_runtime\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "source/rules.coffee.md": {
              "path": "source/rules.coffee.md",
              "content": "Rules\n=====\n\nThese rules are used by the [inflector](inflector.html).\n\nThis `matcher` helper will let us construct rules easier. The default `replacement` is the entire match unchanged.\n\n    matcher = (string, replacement=\"$&\") ->\n      [RegExp(string, \"gi\"), replacement]\n\nAnother little helper to convert blocks of rules text into arrays of matchers. Each line is passed to the matcher helper to create a matcher and replacement pair.\n\n    toArrays = (text) ->\n      text.split(\"\\n\").map (line) ->\n        matcher line.split(\" \").filter((piece) -> piece != \"\")...\n\nThese rules translate from the singular form of a noun to its plural form. The first section is plurals that should remain unchanged. The next section contains rules and replacements to transform words from plural to singular forms.\n\n    pluralRules = toArrays \"\"\"\n      (m)en$\n      (pe)ople$\n      (child)ren$\n      ([ti])a$\n      ((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$\n      (hive)s$\n      (tive)s$\n      (curve)s$\n      ([lr])ves$\n      ([^fo])ves$\n      ([^aeiouy]|qu)ies$\n      (s)eries$\n      (m)ovies$\n      (x|ch|ss|sh)es$\n      ([m|l])ice$\n      (bus)es$\n      (o)es$\n      (shoe)s$\n      (cris|ax|test)es$\n      (octop|vir)i$\n      (alias|status)es$\n      ^(ox)en$\n      (vert|ind)ices$\n      (matr)ices$\n      (quiz)zes$\n      (m)an$                 $1en\n      (pe)rson$              $1ople\n      (child)$               $1ren\n      ^(ox)$                 $1en\n      (ax|test)is$           $1es\n      (octop|vir)us$         $1i\n      (alias|status)$        $1es\n      (u)s$                  $1ses\n      (buffal|tomat|potat)o$ $1oes\n      ([ti])um$              $1a\n      sis$                   ses\n      (?:([^f])fe|([lr])f)$  $1$2ves\n      (hive)$                $1s\n      ([^aeiouy]|qu)y$       $1ies\n      (x|ch|ss|sh)$          $1es\n      (matr|vert|ind)ix|ex$  $1ices\n      ([m|l])ouse$           $1ice\n      (quiz)$                $1zes\n      s$                     s\n      $                      s\n    \"\"\"\n\nThese rules translate from the plural form of a noun to its singular form. Like the plulization rules above, the first section contains matches that are already singular and sholud not be transformed. The following section contains the matchers with the transformations to convert plurals to singular form.\n\n    singularRules = toArrays \"\"\"\n      (m)an$\n      (pe)rson$\n      (child)$\n      ^(ox)$\n      (ax|test)is$\n      (octop|vir)us$\n      (alias|status)$\n      (b)ie$\n      ([br]u)s$\n      (buffal|tomat|potat)o$\n      ([ti])um$\n      sis$\n      (?:([^f])fe|([lr])f)$\n      (hive)$\n      ([^aeiouy]|qu)y$\n      (x|ch|ss|sh)$\n      (matr|vert|ind)ix|ex$\n      ([m|l])ouse$\n      (quiz)$\n      (m)en$                  $1an\n      (pe)ople$               $1rson\n      (child)ren$             $1\n      ([ti])a$                $1um\n      ((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$ $1$2sis\n      (hive)s$                $1\n      (tive)s$                $1\n      (curve)s$               $1\n      ([lr])ves$              $1f\n      ([^fo])ves$             $1fe\n      (bie)s                  $1\n      ([^aeiouy]|qu)ies$      $1y\n      (s)eries$               $1eries\n      (m)ovies$               $1ovie\n      (x|ch|ss|sh)es$         $1\n      ([m|l])ice$             $1ouse\n      (us)es$                 $1\n      (o)es$                  $1\n      (shoe)s$                $1\n      (cris|ax|test)es$       $1is\n      (octop|vir)i$           $1us\n      (alias|status)es$       $1\n      ^(ox)en                 $1\n      (vert|ind)ices$         $1ex\n      (matr)ices$             $1ix\n      (quiz)zes$              $1\n      ss$                     ss\n    \"\"\"\n\nThe common case for replacing the last s with an empty string, added separately because the text block can't easily parse the empty string as a replacement.\n\n    singularRules.push matcher(\"s$\", \"\")\n\nWords that should not be capitalized for title case.\n\n    nonTitlecasedWords = \"\"\"\n      and\n      or\n      nor\n      a\n      an\n      the\n      so\n      but\n      to\n      of\n      at\n      by\n      from\n      into\n      on\n      onto\n      off\n      out\n      in\n      over\n      with\n      for\n    \"\"\".split(\"\\n\")\n\nNouns that use the same form for both singular and plural.\n\n    uncountableWords = \"\"\"\n      equipment\n      information\n      rice\n      money\n      species\n      series\n      fish\n      sheep\n      moose\n      deer\n      news\n    \"\"\".split(\"\\n\")\n\nExport our rules.\n\n    module.exports = {\n      nonTitlecasedWords\n      pluralRules\n      singularRules\n      uncountableWords\n    }\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/pollute.coffee": {
              "path": "test/pollute.coffee",
              "content": "require(\"../source/inflector\").pollute()\n\ndescribe \"Polluted String\", ->\n  it \"should have inflector methods\", ->\n    assert.equal \"String\".constantize(), String\n\n  it \"should not have version property\", ->\n    assert !\"\".version\n\n  it \"should not have pollute method\", ->\n    assert !\"\".pollute\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "content": "Inflector = require(\"../source/inflector\")\n\nsampleData = \"\"\"\n  address       addresses\n  boss          bosses\n  bus           buses\n  cat           cats\n  child         children\n  duder         duders\n  Hat           Hats\n  man           men\n  woman         women\n  zombie        zombies\n  octopus       octopi\n  walrus        walruses\n  guy           guys\n  person        people\n  status        statuses\n\"\"\".split(\"\\n\").map (line) ->\n  line.split(\" \").filter (piece) ->\n    piece != \"\"\n\ndescribe \"Inflector\", ->\n  describe \"pluralize\", ->\n    sampleData.forEach ([singular, plural]) ->\n      it \"#{singular} as #{plural}\", ->\n        assert.equal Inflector.pluralize(singular), plural\n\n      it \"#{plural} as #{plural}\", ->\n        assert.equal Inflector.pluralize(plural), plural\n\n  describe \"singularize\", ->\n    sampleData.forEach ([singular, plural]) ->\n      it \"#{plural} as #{singular}\", ->\n        assert.equal Inflector.singularize(plural), singular\n\n      it \"#{singular} as #{singular}\", ->\n        assert.equal Inflector.singularize(singular), singular\n\n  describe \"camelize\", ->\n    it \"message_properties as MessageProperties\", ->\n      assert.equal Inflector.camelize(\"message_properties\"), \"MessageProperties\"\n\n    it \"message_properties, true as messageProperties\", ->\n      assert.equal Inflector.camelize(\"message_properties\", true), \"messageProperties\"\n\n    it \"should replace / with scope resolution operator\", ->\n      assert.equal Inflector.camelize(\"models/person\"), \"Models.Person\"\n\n    it \"shouldn't overdo it\", ->\n      assert.equal Inflector.camelize(Inflector.camelize(\"anAlreadyCamelizedDude\")), \"AnAlreadyCamelizedDude\"\n\n  describe \"classify\", ->\n    it \"should convert a property name into a class name suitable for lookup\", ->\n      assert.equal Inflector.classify(\"message_bus_properties\"), \"MessageBusProperty\"\n\n    it \"should work for camel cased names too\", ->\n      assert.equal Inflector.classify(\"messageBusProperties\"), \"MessageBusProperty\"\n\n    it \"should convert directory separators to namespaces\", ->\n      assert.equal Inflector.classify(\"models/message_bus_properties\"), \"Models.MessageBusProperty\"\n\n  describe \"capitalize\", ->\n    it \"should work on underscored words\", ->\n      assert.equal Inflector.capitalize(\"message_properties\"), \"Message_properties\"\n\n    it \"should work on normal words\", ->\n      assert.equal Inflector.capitalize(\"message properties\"), \"Message properties\"\n\n  describe \"constantize\", ->\n    # Namespace for testing\n    Tempest =\n      Models:\n        Person: {}\n\n    it \"should look up global constants\", ->\n      assert.equal Inflector.constantize(\"String\"), String\n      assert.equal Inflector.constantize(\"Number\"), Number\n      assert.equal Inflector.constantize(\"Object\"), Object\n\n    it \"should traverse namespaces\", ->\n      assert.equal Inflector.constantize(\"Models.Person\", Tempest), Tempest.Models.Person\n\n    it \"should work with classify\", ->\n      assert.equal Inflector.constantize(Inflector.classify(\"models/person\"), Tempest), Tempest.Models.Person\n\n  describe \"humanize\", ->\n    it \"should replace underscores with spaces\", ->\n      assert.equal Inflector.humanize(\"message_properties\"), \"Message properties\"\n      assert.equal Inflector.humanize(\"message_properties\", true), \"message properties\"\n\n    it \"should remove id suffixes\", ->\n      assert.equal Inflector.humanize(\"message_id\"), \"Message\"\n      assert.equal Inflector.humanize(\"messageId\"), \"Message\"\n\n    it \"should also work for camelCased words\", ->\n      assert.equal Inflector.humanize(\"messageProperties\"), \"Message properties\"\n      assert.equal Inflector.humanize(\"messageProperties\", true), \"message properties\"\n\n  describe \"tableize\", ->\n    it \"should transform words for use in storage solutions\", ->\n      assert.equal Inflector.tableize(\"people\"), \"people\"\n      assert.equal Inflector.tableize(\"MessageBusProperty\"), \"message_bus_properties\"\n\n  describe \"titleize\", ->\n    it \"should transform words to title case\", ->\n      assert.equal Inflector.titleize(\"message_properties\"), \"Message Properties\"\n      assert.equal Inflector.titleize(\"message properties to keep\"), \"Message Properties to Keep\"\n\n  describe \"underscore\", ->\n    it \"should convert camelCased words to underscored words\", ->\n      assert.equal Inflector.underscore(\"MessageProperties\"), \"message_properties\"\n      assert.equal Inflector.underscore(\"messageProperties\"), \"message_properties\"\n\n    it \"should deal with acronyms\", ->\n      assert.equal Inflector.underscore(\"MP\"), \"mp\"\n      assert.equal Inflector.underscore(\"HTTPConnection\"), \"http_connection\"\n\n  describe \"dasherize\", ->\n    it \"should convert words with spaces into words with dashes\", ->\n      assert.equal Inflector.dasherize(\"A really cool Feature\"), \"a-really-cool-feature\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test_helper.coffee.md": {
              "path": "test_helper.coffee.md",
              "content": "Test Helper\n===========\n\n    global.assert = require \"assert\"\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "interactive_runtime": {
              "path": "interactive_runtime",
              "content": "(function() {\n  var inflector;\n\n  inflector = require(\"/source/inflector\");\n\n  Object.keys(inflector).forEach(function(method) {\n    if (method === \"version\") {\n      return;\n    }\n    if (method === \"pollute\") {\n      return;\n    }\n    return Interactive.register(method, function(_arg) {\n      var outputElement, runtimeElement, source;\n      source = _arg.source, runtimeElement = _arg.runtimeElement;\n      outputElement = document.createElement(\"pre\");\n      runtimeElement.empty().append(outputElement);\n      return outputElement.textContent = source.split(\"\\n\").map(function(word) {\n        var result;\n        return result = inflector[method](word);\n      }).join(\"\\n\");\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            },
            "package": {
              "path": "package",
              "content": "module.exports = {\"name\":\"inflecta\",\"version\":\"0.8.3\",\"description\":\"A better port of ActiveSupport Inflector to JS.\",\"main\":\"dist/inflector.js\",\"scripts\":{\"prepublish\":\"script/prepublish\",\"test\":\"script/test\"},\"files\":[\"dist\"],\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/STRd6/inflector\"},\"keywords\":[\"inflector\"],\"devDependencies\":{\"should\":\"1.2.2\",\"coffee-script\":\"~1.6.3\",\"mocha\":\"~1.12.0\",\"uglify-js\":\"~2.3.6\",\"docco\":\"~0.6.2\",\"browserify\":\"~2.26.0\"},\"author\":\"\",\"license\":\"MIT\",\"bugs\":{\"url\":\"https://github.com/STRd6/inflector/issues\"}};",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.1\",\"entryPoint\":\"source/inflector\"};",
              "type": "blob"
            },
            "source/inflector": {
              "path": "source/inflector",
              "content": "(function() {\n  var applyRules, fileSeparator, idSuffix, inflector, nonTitlecasedWords, pluralRules, scopeResolution, singularRules, spaceOrUnderbar, uncountableWords, underbar, underbarPrefix, uppercase, _ref,\n    __slice = [].slice;\n\n  _ref = require(\"./rules\"), nonTitlecasedWords = _ref.nonTitlecasedWords, pluralRules = _ref.pluralRules, singularRules = _ref.singularRules, uncountableWords = _ref.uncountableWords;\n\n  idSuffix = RegExp(\"(_ids|_id)$\", \"g\");\n\n  underbar = RegExp(\"_\", \"g\");\n\n  spaceOrUnderbar = RegExp(\"[ _]\", \"g\");\n\n  uppercase = RegExp(\"([A-Z])\", \"g\");\n\n  underbarPrefix = RegExp(\"^_\");\n\n  scopeResolution = \".\";\n\n  fileSeparator = \"/\";\n\n  applyRules = function(string, rules) {\n    if (uncountableWords.indexOf(string.toLowerCase()) > -1) {\n      return string;\n    }\n    return rules.reduce(function(result, _arg) {\n      var replacer, rule;\n      rule = _arg[0], replacer = _arg[1];\n      return result || (string.match(rule) ? string.replace(rule, replacer) : void 0);\n    }, null) || string;\n  };\n\n  inflector = {\n    pluralize: function(string) {\n      return applyRules(string, pluralRules);\n    },\n    singularize: function(string) {\n      return applyRules(string, singularRules);\n    },\n    camelize: function(string, lowercaseFirstLetter) {\n      return string.split(fileSeparator).map(function(pathItem) {\n        return pathItem.split(underbar).map(function(chunk, i) {\n          if (lowercaseFirstLetter && i === 0) {\n            return chunk;\n          } else {\n            return chunk.charAt(0).toUpperCase() + chunk.substring(1);\n          }\n        }).join(\"\");\n      }).join(scopeResolution);\n    },\n    constantize: function(string, rootModule) {\n      var item, target, _i, _len, _ref1;\n      target = rootModule != null ? rootModule : typeof global !== \"undefined\" && global !== null ? global : window;\n      _ref1 = string.split(scopeResolution);\n      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {\n        item = _ref1[_i];\n        target = target[item];\n      }\n      return target;\n    },\n    underscore: function(string) {\n      return string.split(scopeResolution).map(function(chunk) {\n        return chunk.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();\n      }).join(fileSeparator).toLowerCase();\n    },\n    humanize: function(string, lowFirstLetter) {\n      string = inflector.underscore(string).toLowerCase().replace(idSuffix, \"\").replace(underbar, \" \");\n      if (!lowFirstLetter) {\n        string = inflector.capitalize(string);\n      }\n      return string;\n    },\n    capitalize: function(string) {\n      string = string.toLowerCase();\n      return string.substring(0, 1).toUpperCase() + string.substring(1);\n    },\n    titleize: function(string) {\n      var result;\n      result = string.toLowerCase().replace(underbar, \" \").split(\" \").map(function(chunk) {\n        return chunk.split(\"-\").map(function(piece) {\n          if (nonTitlecasedWords.indexOf(piece.toLowerCase()) < 0) {\n            return inflector.capitalize(piece);\n          } else {\n            return piece;\n          }\n        }).join(\"-\");\n      }).join(\" \");\n      return result.substring(0, 1).toUpperCase() + result.substring(1);\n    },\n    tableize: function(string) {\n      return inflector.pluralize(inflector.underscore(string));\n    },\n    classify: function(str) {\n      return inflector.singularize(inflector.camelize(str));\n    },\n    dasherize: function(str) {\n      return str.trim().replace(/\\s+/g, \"-\").toLowerCase();\n    },\n    pollute: function() {\n      Object.keys(inflector).forEach(function(key) {\n        if (key === \"version\") {\n          return;\n        }\n        if (key === \"pollute\") {\n          return;\n        }\n        return String.prototype[key] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return inflector[key].apply(inflector, [this].concat(__slice.call(args)));\n        };\n      });\n      return inflector;\n    }\n  };\n\n  module.exports = inflector;\n\n}).call(this);\n",
              "type": "blob"
            },
            "source/rules": {
              "path": "source/rules",
              "content": "(function() {\n  var matcher, nonTitlecasedWords, pluralRules, singularRules, toArrays, uncountableWords;\n\n  matcher = function(string, replacement) {\n    if (replacement == null) {\n      replacement = \"$&\";\n    }\n    return [RegExp(string, \"gi\"), replacement];\n  };\n\n  toArrays = function(text) {\n    return text.split(\"\\n\").map(function(line) {\n      return matcher.apply(null, line.split(\" \").filter(function(piece) {\n        return piece !== \"\";\n      }));\n    });\n  };\n\n  pluralRules = toArrays(\"(m)en$\\n(pe)ople$\\n(child)ren$\\n([ti])a$\\n((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$\\n(hive)s$\\n(tive)s$\\n(curve)s$\\n([lr])ves$\\n([^fo])ves$\\n([^aeiouy]|qu)ies$\\n(s)eries$\\n(m)ovies$\\n(x|ch|ss|sh)es$\\n([m|l])ice$\\n(bus)es$\\n(o)es$\\n(shoe)s$\\n(cris|ax|test)es$\\n(octop|vir)i$\\n(alias|status)es$\\n^(ox)en$\\n(vert|ind)ices$\\n(matr)ices$\\n(quiz)zes$\\n(m)an$                 $1en\\n(pe)rson$              $1ople\\n(child)$               $1ren\\n^(ox)$                 $1en\\n(ax|test)is$           $1es\\n(octop|vir)us$         $1i\\n(alias|status)$        $1es\\n(u)s$                  $1ses\\n(buffal|tomat|potat)o$ $1oes\\n([ti])um$              $1a\\nsis$                   ses\\n(?:([^f])fe|([lr])f)$  $1$2ves\\n(hive)$                $1s\\n([^aeiouy]|qu)y$       $1ies\\n(x|ch|ss|sh)$          $1es\\n(matr|vert|ind)ix|ex$  $1ices\\n([m|l])ouse$           $1ice\\n(quiz)$                $1zes\\ns$                     s\\n$                      s\");\n\n  singularRules = toArrays(\"(m)an$\\n(pe)rson$\\n(child)$\\n^(ox)$\\n(ax|test)is$\\n(octop|vir)us$\\n(alias|status)$\\n(b)ie$\\n([br]u)s$\\n(buffal|tomat|potat)o$\\n([ti])um$\\nsis$\\n(?:([^f])fe|([lr])f)$\\n(hive)$\\n([^aeiouy]|qu)y$\\n(x|ch|ss|sh)$\\n(matr|vert|ind)ix|ex$\\n([m|l])ouse$\\n(quiz)$\\n(m)en$                  $1an\\n(pe)ople$               $1rson\\n(child)ren$             $1\\n([ti])a$                $1um\\n((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$ $1$2sis\\n(hive)s$                $1\\n(tive)s$                $1\\n(curve)s$               $1\\n([lr])ves$              $1f\\n([^fo])ves$             $1fe\\n(bie)s                  $1\\n([^aeiouy]|qu)ies$      $1y\\n(s)eries$               $1eries\\n(m)ovies$               $1ovie\\n(x|ch|ss|sh)es$         $1\\n([m|l])ice$             $1ouse\\n(us)es$                 $1\\n(o)es$                  $1\\n(shoe)s$                $1\\n(cris|ax|test)es$       $1is\\n(octop|vir)i$           $1us\\n(alias|status)es$       $1\\n^(ox)en                 $1\\n(vert|ind)ices$         $1ex\\n(matr)ices$             $1ix\\n(quiz)zes$              $1\\nss$                     ss\");\n\n  singularRules.push(matcher(\"s$\", \"\"));\n\n  nonTitlecasedWords = \"and\\nor\\nnor\\na\\nan\\nthe\\nso\\nbut\\nto\\nof\\nat\\nby\\nfrom\\ninto\\non\\nonto\\noff\\nout\\nin\\nover\\nwith\\nfor\".split(\"\\n\");\n\n  uncountableWords = \"equipment\\ninformation\\nrice\\nmoney\\nspecies\\nseries\\nfish\\nsheep\\nmoose\\ndeer\\nnews\".split(\"\\n\");\n\n  module.exports = {\n    nonTitlecasedWords: nonTitlecasedWords,\n    pluralRules: pluralRules,\n    singularRules: singularRules,\n    uncountableWords: uncountableWords\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/pollute": {
              "path": "test/pollute",
              "content": "(function() {\n  require(\"../source/inflector\").pollute();\n\n  describe(\"Polluted String\", function() {\n    it(\"should have inflector methods\", function() {\n      return assert.equal(\"String\".constantize(), String);\n    });\n    it(\"should not have version property\", function() {\n      return assert(!\"\".version);\n    });\n    return it(\"should not have pollute method\", function() {\n      return assert(!\"\".pollute);\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/test": {
              "path": "test/test",
              "content": "(function() {\n  var Inflector, sampleData;\n\n  Inflector = require(\"../source/inflector\");\n\n  sampleData = \"address       addresses\\nboss          bosses\\nbus           buses\\ncat           cats\\nchild         children\\nduder         duders\\nHat           Hats\\nman           men\\nwoman         women\\nzombie        zombies\\noctopus       octopi\\nwalrus        walruses\\nguy           guys\\nperson        people\\nstatus        statuses\".split(\"\\n\").map(function(line) {\n    return line.split(\" \").filter(function(piece) {\n      return piece !== \"\";\n    });\n  });\n\n  describe(\"Inflector\", function() {\n    describe(\"pluralize\", function() {\n      return sampleData.forEach(function(_arg) {\n        var plural, singular;\n        singular = _arg[0], plural = _arg[1];\n        it(\"\" + singular + \" as \" + plural, function() {\n          return assert.equal(Inflector.pluralize(singular), plural);\n        });\n        return it(\"\" + plural + \" as \" + plural, function() {\n          return assert.equal(Inflector.pluralize(plural), plural);\n        });\n      });\n    });\n    describe(\"singularize\", function() {\n      return sampleData.forEach(function(_arg) {\n        var plural, singular;\n        singular = _arg[0], plural = _arg[1];\n        it(\"\" + plural + \" as \" + singular, function() {\n          return assert.equal(Inflector.singularize(plural), singular);\n        });\n        return it(\"\" + singular + \" as \" + singular, function() {\n          return assert.equal(Inflector.singularize(singular), singular);\n        });\n      });\n    });\n    describe(\"camelize\", function() {\n      it(\"message_properties as MessageProperties\", function() {\n        return assert.equal(Inflector.camelize(\"message_properties\"), \"MessageProperties\");\n      });\n      it(\"message_properties, true as messageProperties\", function() {\n        return assert.equal(Inflector.camelize(\"message_properties\", true), \"messageProperties\");\n      });\n      it(\"should replace / with scope resolution operator\", function() {\n        return assert.equal(Inflector.camelize(\"models/person\"), \"Models.Person\");\n      });\n      return it(\"shouldn't overdo it\", function() {\n        return assert.equal(Inflector.camelize(Inflector.camelize(\"anAlreadyCamelizedDude\")), \"AnAlreadyCamelizedDude\");\n      });\n    });\n    describe(\"classify\", function() {\n      it(\"should convert a property name into a class name suitable for lookup\", function() {\n        return assert.equal(Inflector.classify(\"message_bus_properties\"), \"MessageBusProperty\");\n      });\n      it(\"should work for camel cased names too\", function() {\n        return assert.equal(Inflector.classify(\"messageBusProperties\"), \"MessageBusProperty\");\n      });\n      return it(\"should convert directory separators to namespaces\", function() {\n        return assert.equal(Inflector.classify(\"models/message_bus_properties\"), \"Models.MessageBusProperty\");\n      });\n    });\n    describe(\"capitalize\", function() {\n      it(\"should work on underscored words\", function() {\n        return assert.equal(Inflector.capitalize(\"message_properties\"), \"Message_properties\");\n      });\n      return it(\"should work on normal words\", function() {\n        return assert.equal(Inflector.capitalize(\"message properties\"), \"Message properties\");\n      });\n    });\n    describe(\"constantize\", function() {\n      var Tempest;\n      Tempest = {\n        Models: {\n          Person: {}\n        }\n      };\n      it(\"should look up global constants\", function() {\n        assert.equal(Inflector.constantize(\"String\"), String);\n        assert.equal(Inflector.constantize(\"Number\"), Number);\n        return assert.equal(Inflector.constantize(\"Object\"), Object);\n      });\n      it(\"should traverse namespaces\", function() {\n        return assert.equal(Inflector.constantize(\"Models.Person\", Tempest), Tempest.Models.Person);\n      });\n      return it(\"should work with classify\", function() {\n        return assert.equal(Inflector.constantize(Inflector.classify(\"models/person\"), Tempest), Tempest.Models.Person);\n      });\n    });\n    describe(\"humanize\", function() {\n      it(\"should replace underscores with spaces\", function() {\n        assert.equal(Inflector.humanize(\"message_properties\"), \"Message properties\");\n        return assert.equal(Inflector.humanize(\"message_properties\", true), \"message properties\");\n      });\n      it(\"should remove id suffixes\", function() {\n        assert.equal(Inflector.humanize(\"message_id\"), \"Message\");\n        return assert.equal(Inflector.humanize(\"messageId\"), \"Message\");\n      });\n      return it(\"should also work for camelCased words\", function() {\n        assert.equal(Inflector.humanize(\"messageProperties\"), \"Message properties\");\n        return assert.equal(Inflector.humanize(\"messageProperties\", true), \"message properties\");\n      });\n    });\n    describe(\"tableize\", function() {\n      return it(\"should transform words for use in storage solutions\", function() {\n        assert.equal(Inflector.tableize(\"people\"), \"people\");\n        return assert.equal(Inflector.tableize(\"MessageBusProperty\"), \"message_bus_properties\");\n      });\n    });\n    describe(\"titleize\", function() {\n      return it(\"should transform words to title case\", function() {\n        assert.equal(Inflector.titleize(\"message_properties\"), \"Message Properties\");\n        return assert.equal(Inflector.titleize(\"message properties to keep\"), \"Message Properties to Keep\");\n      });\n    });\n    describe(\"underscore\", function() {\n      it(\"should convert camelCased words to underscored words\", function() {\n        assert.equal(Inflector.underscore(\"MessageProperties\"), \"message_properties\");\n        return assert.equal(Inflector.underscore(\"messageProperties\"), \"message_properties\");\n      });\n      return it(\"should deal with acronyms\", function() {\n        assert.equal(Inflector.underscore(\"MP\"), \"mp\");\n        return assert.equal(Inflector.underscore(\"HTTPConnection\"), \"http_connection\");\n      });\n    });\n    return describe(\"dasherize\", function() {\n      return it(\"should convert words with spaces into words with dashes\", function() {\n        return assert.equal(Inflector.dasherize(\"A really cool Feature\"), \"a-really-cool-feature\");\n      });\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            },
            "test_helper": {
              "path": "test_helper",
              "content": "(function() {\n  global.assert = require(\"assert\");\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://www.danielx.net/editor/"
          },
          "version": "0.2.1",
          "entryPoint": "source/inflector",
          "repository": {
            "branch": "v0.2.1",
            "default_branch": "master",
            "full_name": "distri/inflector",
            "homepage": null,
            "description": " A better port of ActiveSupport Inflector to JS",
            "html_url": "https://github.com/distri/inflector",
            "url": "https://api.github.com/repos/distri/inflector",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "math": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "math\n====\n\nMath is for cool guys.\n",
              "mode": "100644",
              "type": "blob"
            },
            "math.coffee.md": {
              "path": "math.coffee.md",
              "content": "Math\n====\n\nRequire and export many math libraries.\n\n    Point = require \"point\"\n    Size = require \"size\"\n\n    Matrix = require \"matrix\"\n    Matrix.Point = Point\n\n    Random = require \"random\"\n\n    module.exports = self =\n      Point: Point\n      Matrix: Matrix\n      Random: Random\n      Rectangle: require \"./rectangle\"\n      rand: Random.rand\n      Size: Size\n      version: require(\"./pixie\").version\n\nPollute all libraries to the global namespace.\n\n      pollute: ->\n        Object.keys(self).forEach (key) ->\n          return if key is \"version\"\n          return if key is \"pollute\"\n\n          global[key] = self[key]\n\n        return self\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "entryPoint: \"math\"\nversion: \"0.2.6-pre.0\"\ndependencies:\n  point: \"distri/point:v0.2.0\"\n  matrix: \"distri/matrix:v0.3.1\"\n  random: \"distri/random:v0.2.2\"\n  size: \"distri/size:v0.1.4\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "rectangle.coffee.md": {
              "path": "rectangle.coffee.md",
              "content": "Rectangle\n=========\n\nA rectangle is a size at a given position.\n\n    {abs, min} = Math\n\n    Size = require \"size\"\n\n    module.exports = Rectangle = (position, size) ->\n      if position?.size?\n        {position, size} = position\n\n      position: Point(position)\n      size: Size(size)\n      __proto__: Rectangle.prototype\n\n    Rectangle.prototype =\n      each: (iterator) ->\n        p = @position\n\n        @size.each (x, y) ->\n          iterator(p.x + x, p.y + y)\n\n    Rectangle.fromPoints = (start, end) ->\n      Rectangle Point(min(start.x, end.x), min(start.y, end.y)), Size(abs(end.x - start.x), abs(end.y - start.y))\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/math.coffee": {
              "path": "test/math.coffee",
              "content": "require(\"../math\").pollute()\n\ndescribe \"Point\", ->\n  it \"should exist\", ->\n    assert Point\n\n  it \"should construct points\", ->\n    assert Point()\n\ndescribe \"Matrix\", ->\n  it \"should exist and return matrices when invoked\", ->\n    assert Matrix\n\n    assert Matrix()\n\n  it \"should use the same `Point` class\", ->\n    assert Matrix.Point is Point\n\n    assert Matrix().transformPoint(Point()) instanceof Point\n\ndescribe \"Random\", ->\n  it \"should exist\", ->\n    assert Random\n\ndescribe \"rand\", ->\n  it \"should exist\", ->\n    assert rand\n\n    assert rand()?\n\ndescribe \"Size\", ->\n  it \"should exist\", ->\n    assert Size\n\ndescribe \"Math\", ->\n  it \"should have a version\", ->\n    assert require(\"../math\").version\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/rectangle.coffee": {
              "path": "test/rectangle.coffee",
              "content": "{Point, Size, Rectangle} = require \"../math\"\n\ndescribe \"rectangle\", ->\n  it \"should iterate\", ->\n    rectangle = Rectangle\n      position: Point(2, 2)\n      size: Size(2, 2)\n\n    total = 0\n    rectangle.each (x, y) ->\n      total += 1\n\n    assert.equal total, 4\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "math": {
              "path": "math",
              "content": "(function() {\n  var Matrix, Point, Random, Size, self;\n\n  Point = require(\"point\");\n\n  Size = require(\"size\");\n\n  Matrix = require(\"matrix\");\n\n  Matrix.Point = Point;\n\n  Random = require(\"random\");\n\n  module.exports = self = {\n    Point: Point,\n    Matrix: Matrix,\n    Random: Random,\n    Rectangle: require(\"./rectangle\"),\n    rand: Random.rand,\n    Size: Size,\n    version: require(\"./pixie\").version,\n    pollute: function() {\n      Object.keys(self).forEach(function(key) {\n        if (key === \"version\") {\n          return;\n        }\n        if (key === \"pollute\") {\n          return;\n        }\n        return global[key] = self[key];\n      });\n      return self;\n    }\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"math\",\"version\":\"0.2.6-pre.0\",\"dependencies\":{\"point\":\"distri/point:v0.2.0\",\"matrix\":\"distri/matrix:v0.3.1\",\"random\":\"distri/random:v0.2.2\",\"size\":\"distri/size:v0.1.4\"}};",
              "type": "blob"
            },
            "rectangle": {
              "path": "rectangle",
              "content": "(function() {\n  var Rectangle, Size, abs, min;\n\n  abs = Math.abs, min = Math.min;\n\n  Size = require(\"size\");\n\n  module.exports = Rectangle = function(position, size) {\n    var _ref;\n    if ((position != null ? position.size : void 0) != null) {\n      _ref = position, position = _ref.position, size = _ref.size;\n    }\n    return {\n      position: Point(position),\n      size: Size(size),\n      __proto__: Rectangle.prototype\n    };\n  };\n\n  Rectangle.prototype = {\n    each: function(iterator) {\n      var p;\n      p = this.position;\n      return this.size.each(function(x, y) {\n        return iterator(p.x + x, p.y + y);\n      });\n    }\n  };\n\n  Rectangle.fromPoints = function(start, end) {\n    return Rectangle(Point(min(start.x, end.x), min(start.y, end.y)), Size(abs(end.x - start.x), abs(end.y - start.y)));\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/math": {
              "path": "test/math",
              "content": "(function() {\n  require(\"../math\").pollute();\n\n  describe(\"Point\", function() {\n    it(\"should exist\", function() {\n      return assert(Point);\n    });\n    return it(\"should construct points\", function() {\n      return assert(Point());\n    });\n  });\n\n  describe(\"Matrix\", function() {\n    it(\"should exist and return matrices when invoked\", function() {\n      assert(Matrix);\n      return assert(Matrix());\n    });\n    return it(\"should use the same `Point` class\", function() {\n      assert(Matrix.Point === Point);\n      return assert(Matrix().transformPoint(Point()) instanceof Point);\n    });\n  });\n\n  describe(\"Random\", function() {\n    return it(\"should exist\", function() {\n      return assert(Random);\n    });\n  });\n\n  describe(\"rand\", function() {\n    return it(\"should exist\", function() {\n      assert(rand);\n      return assert(rand() != null);\n    });\n  });\n\n  describe(\"Size\", function() {\n    return it(\"should exist\", function() {\n      return assert(Size);\n    });\n  });\n\n  describe(\"Math\", function() {\n    return it(\"should have a version\", function() {\n      return assert(require(\"../math\").version);\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/rectangle": {
              "path": "test/rectangle",
              "content": "(function() {\n  var Point, Rectangle, Size, _ref;\n\n  _ref = require(\"../math\"), Point = _ref.Point, Size = _ref.Size, Rectangle = _ref.Rectangle;\n\n  describe(\"rectangle\", function() {\n    return it(\"should iterate\", function() {\n      var rectangle, total;\n      rectangle = Rectangle({\n        position: Point(2, 2),\n        size: Size(2, 2)\n      });\n      total = 0;\n      rectangle.each(function(x, y) {\n        return total += 1;\n      });\n      return assert.equal(total, 4);\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "https://danielx.net/editor/"
          },
          "version": "0.2.6-pre.0",
          "entryPoint": "math",
          "repository": {
            "branch": "v0.2.6-pre.0",
            "default_branch": "master",
            "full_name": "distri/math",
            "homepage": null,
            "description": "Math is for cool guys.",
            "html_url": "https://github.com/distri/math",
            "url": "https://api.github.com/repos/distri/math",
            "publishBranch": "gh-pages"
          },
          "dependencies": {
            "point": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "point\n=====\n\nJavaScript Point implementation\n",
                  "type": "blob"
                },
                "interactive_runtime.coffee.md": {
                  "path": "interactive_runtime.coffee.md",
                  "mode": "100644",
                  "content": "Interactive Runtime\n-------------------\n\n    window.Point = require(\"./point\")\n\nRegister our example runner.\n\n    Interactive.register \"example\", ({source, runtimeElement}) ->\n      program = CoffeeScript.compile(source, bare: true)\n\n      outputElement = document.createElement \"pre\"\n      runtimeElement.empty().append outputElement\n\n      result = eval(program)\n\n      if typeof result is \"number\"\n        if result != (0 | result)\n          result = result.toFixed(4)\n    \n\n      outputElement.textContent = result\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "version: \"0.2.0\"\nentryPoint: \"point\"\n",
                  "type": "blob"
                },
                "point.coffee.md": {
                  "path": "point.coffee.md",
                  "mode": "100644",
                  "content": "\nCreate a new point with given x and y coordinates. If no arguments are given\ndefaults to (0, 0).\n\n>     #! example\n>     Point()\n\n----\n\n>     #! example\n>     Point(-2, 5)\n\n----\n\n    Point = (x, y) ->\n      if isObject(x)\n        {x, y} = x\n\n      __proto__: Point.prototype\n      x: x ? 0\n      y: y ? 0\n\nPoint protoype methods.\n\n    Point:: =\n\nConstrain the magnitude of a vector.\n\n      clamp: (n) ->\n        if @magnitude() > n\n          @norm(n)\n        else\n          @copy()\n\nCreates a copy of this point.\n\n      copy: ->\n        Point(@x, @y)\n\n>     #! example\n>     Point(1, 1).copy()\n\n----\n\nAdds a point to this one and returns the new point. You may\nalso use a two argument call like `point.add(x, y)`\nto add x and y values without a second point object.\n\n      add: (first, second) ->\n        if second?\n          Point(\n            @x + first\n            @y + second\n          )\n        else\n          Point(\n            @x + first.x,\n            @y + first.y\n          )\n\n>     #! example\n>     Point(2, 3).add(Point(3, 4))\n\n----\n\nSubtracts a point to this one and returns the new point.\n\n      subtract: (first, second) ->\n        if second?\n          Point(\n            @x - first,\n            @y - second\n          )\n        else\n          @add(first.scale(-1))\n\n>     #! example\n>     Point(1, 2).subtract(Point(2, 0))\n\n----\n\nScale this Point (Vector) by a constant amount.\n\n      scale: (scalar) ->\n        Point(\n          @x * scalar,\n          @y * scalar\n        )\n\n>     #! example\n>     point = Point(5, 6).scale(2)\n\n----\n\nThe `norm` of a vector is the unit vector pointing in the same direction. This method\ntreats the point as though it is a vector from the origin to (x, y).\n\n      norm: (length=1.0) ->\n        if m = @length()\n          @scale(length/m)\n        else\n          @copy()\n\n>     #! example\n>     point = Point(2, 3).norm()\n\n----\n\nDetermine whether this `Point` is equal to another `Point`. Returns `true` if\nthey are equal and `false` otherwise.\n\n      equal: (other) ->\n        @x == other.x && @y == other.y\n\n>     #! example\n>     point = Point(2, 3)\n>\n>     point.equal(Point(2, 3))\n\n----\n\nComputed the length of this point as though it were a vector from (0,0) to (x,y).\n\n      length: ->\n        Math.sqrt(@dot(this))\n\n>     #! example\n>     Point(5, 7).length()\n\n----\n\nCalculate the magnitude of this Point (Vector).\n\n      magnitude: ->\n        @length()\n\n>     #! example\n>     Point(5, 7).magnitude()\n\n----\n\nReturns the direction in radians of this point from the origin.\n\n      direction: ->\n        Math.atan2(@y, @x)\n\n>     #! example\n>     point = Point(0, 1)\n>\n>     point.direction()\n\n----\n\nCalculate the dot product of this point and another point (Vector).\n\n      dot: (other) ->\n        @x * other.x + @y * other.y\n\n\n`cross` calculates the cross product of this point and another point (Vector).\nUsually cross products are thought of as only applying to three dimensional vectors,\nbut z can be treated as zero. The result of this method is interpreted as the magnitude\nof the vector result of the cross product between [x1, y1, 0] x [x2, y2, 0]\nperpendicular to the xy plane.\n\n      cross: (other) ->\n        @x * other.y - other.x * @y\n\n\n`distance` computes the Euclidean distance between this point and another point.\n\n      distance: (other) ->\n        Point.distance(this, other)\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     pointA.distance(pointB)\n\n----\n\n`toFixed` returns a string representation of this point with fixed decimal places.\n\n      toFixed: (n) ->\n        \"Point(#{@x.toFixed(n)}, #{@y.toFixed(n)})\"\n\n`toString` returns a string representation of this point. The representation is\nsuch that if `eval`d it will return a `Point`\n\n      toString: ->\n        \"Point(#{@x}, #{@y})\"\n\n`distance` Compute the Euclidean distance between two points.\n\n    Point.distance = (p1, p2) ->\n      Math.sqrt(Point.distanceSquared(p1, p2))\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     Point.distance(pointA, pointB)\n\n----\n\n`distanceSquared` The square of the Euclidean distance between two points.\n\n    Point.distanceSquared = (p1, p2) ->\n      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     Point.distanceSquared(pointA, pointB)\n\n----\n\n`interpolate` returns a point along the path from p1 to p2\n\n    Point.interpolate = (p1, p2, t) ->\n      p2.subtract(p1).scale(t).add(p1)\n\nConstruct a point on the unit circle for the given angle.\n\n    Point.fromAngle = (angle) ->\n      Point(Math.cos(angle), Math.sin(angle))\n\n>     #! example\n>     Point.fromAngle(Math.PI / 2)\n\n----\n\nIf you have two dudes, one standing at point p1, and the other\nstanding at point p2, then this method will return the direction\nthat the dude standing at p1 will need to face to look at p2.\n\n>     #! example\n>     p1 = Point(0, 0)\n>     p2 = Point(7, 3)\n>\n>     Point.direction(p1, p2)\n\n    Point.direction = (p1, p2) ->\n      Math.atan2(\n        p2.y - p1.y,\n        p2.x - p1.x\n      )\n\nThe centroid of a set of points is their arithmetic mean.\n\n    Point.centroid = (points...) ->\n      points.reduce((sumPoint, point) ->\n        sumPoint.add(point)\n      , Point(0, 0))\n      .scale(1/points.length)\n\nGenerate a random point on the unit circle.\n\n    Point.random = ->\n      Point.fromAngle(Math.random() * 2 * Math.PI)\n\nExport\n\n    module.exports = Point\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object.prototype.toString.call(object) is \"[object Object]\"\n\nLive Examples\n-------------\n\n>     #! setup\n>     require(\"/interactive_runtime\")\n",
                  "type": "blob"
                },
                "test/test.coffee": {
                  "path": "test/test.coffee",
                  "mode": "100644",
                  "content": "Point = require \"../point\"\n\nok = assert\nequals = assert.equal\n\nTAU = 2 * Math.PI\n\ndescribe \"Point\", ->\n\n  TOLERANCE = 0.00001\n\n  equalEnough = (expected, actual, tolerance, message) ->\n    message ||= \"\" + expected + \" within \" + tolerance + \" of \" + actual\n    ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n\n  it \"copy constructor\", ->\n    p = Point(3, 7)\n\n    p2 = Point(p)\n\n    equals p2.x, p.x\n    equals p2.y, p.y\n\n  it \"#add\", ->\n    p1 = Point(5, 6)\n    p2 = Point(7, 5)\n\n    result = p1.add(p2)\n\n    equals result.x, p1.x + p2.x\n    equals result.y, p1.y + p2.y\n\n    equals p1.x, 5\n    equals p1.y, 6\n    equals p2.x, 7\n    equals p2.y, 5\n\n  it \"#add with two arguments\", ->\n    point = Point(3, 7)\n    x = 2\n    y = 1\n\n    result = point.add(x, y)\n\n    equals result.x, point.x + x\n    equals result.y, point.y + y\n\n    x = 2\n    y = 0\n\n    result = point.add(x, y)\n\n    equals result.x, point.x + x\n    equals result.y, point.y + y\n\n  it \"#add existing\", ->\n    p = Point(0, 0)\n\n    p.add(Point(3, 5))\n\n    equals p.x, 0\n    equals p.y, 0\n\n  it \"#subtract\", ->\n    p1 = Point(5, 6)\n    p2 = Point(7, 5)\n\n    result = p1.subtract(p2)\n\n    equals result.x, p1.x - p2.x\n    equals result.y, p1.y - p2.y\n\n  it \"#subtract existing\", ->\n    p = Point(8, 6)\n\n    p.subtract(3, 4)\n\n    equals p.x, 8\n    equals p.y, 6\n\n  it \"#norm\", ->\n    p = Point(2, 0)\n\n    normal = p.norm()\n    equals normal.x, 1\n\n    normal = p.norm(5)\n    equals normal.x, 5\n\n    p = Point(0, 0)\n\n    normal = p.norm()\n    equals normal.x, 0, \"x value of norm of point(0,0) is 0\"\n    equals normal.y, 0, \"y value of norm of point(0,0) is 0\"\n\n  it \"#norm existing\", ->\n    p = Point(6, 8)\n\n    p.norm(5)\n\n    equals p.x, 6\n    equals p.y, 8\n\n  it \"#scale\", ->\n    p = Point(5, 6)\n    scalar = 2\n\n    result = p.scale(scalar)\n\n    equals result.x, p.x * scalar\n    equals result.y, p.y * scalar\n\n    equals p.x, 5\n    equals p.y, 6\n\n  it \"#scale existing\", ->\n    p = Point(0, 1)\n    scalar = 3\n\n    p.scale(scalar)\n\n    equals p.x, 0\n    equals p.y, 1\n\n  it \"#equal\", ->\n    ok Point(7, 8).equal(Point(7, 8))\n\n  it \"#magnitude\", ->\n    equals Point(3, 4).magnitude(), 5\n\n  it \"#length\", ->\n    equals Point(0, 0).length(), 0\n    equals Point(-1, 0).length(), 1\n\n  it \"#toString\", ->\n    p = Point(7, 5)\n    ok eval(p.toString()).equal(p)\n\n  it \"#clamp\", ->\n    p = Point(10, 10)\n    p2 = p.clamp(5)\n\n    equals p2.length(), 5\n\n  it \".centroid\", ->\n    centroid = Point.centroid(\n      Point(0, 0),\n      Point(10, 10),\n      Point(10, 0),\n      Point(0, 10)\n    )\n\n    equals centroid.x, 5\n    equals centroid.y, 5\n\n  it \".fromAngle\", ->\n    p = Point.fromAngle(TAU / 4)\n\n    equalEnough p.x, 0, TOLERANCE\n    equals p.y, 1\n\n  it \".random\", ->\n    p = Point.random()\n\n    ok p\n\n  it \".interpolate\", ->\n    p1 = Point(10, 7)\n    p2 = Point(-6, 29)\n\n    ok p1.equal(Point.interpolate(p1, p2, 0))\n    ok p2.equal(Point.interpolate(p1, p2, 1))\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "interactive_runtime": {
                  "path": "interactive_runtime",
                  "content": "(function() {\n  window.Point = require(\"./point\");\n\n  Interactive.register(\"example\", function(_arg) {\n    var outputElement, program, result, runtimeElement, source;\n    source = _arg.source, runtimeElement = _arg.runtimeElement;\n    program = CoffeeScript.compile(source, {\n      bare: true\n    });\n    outputElement = document.createElement(\"pre\");\n    runtimeElement.empty().append(outputElement);\n    result = eval(program);\n    if (typeof result === \"number\") {\n      if (result !== (0 | result)) {\n        result = result.toFixed(4);\n      }\n    }\n    return outputElement.textContent = result;\n  });\n\n}).call(this);\n\n//# sourceURL=interactive_runtime.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"point\"};",
                  "type": "blob"
                },
                "point": {
                  "path": "point",
                  "content": "(function() {\n  var Point, isObject,\n    __slice = [].slice;\n\n  Point = function(x, y) {\n    var _ref;\n    if (isObject(x)) {\n      _ref = x, x = _ref.x, y = _ref.y;\n    }\n    return {\n      __proto__: Point.prototype,\n      x: x != null ? x : 0,\n      y: y != null ? y : 0\n    };\n  };\n\n  Point.prototype = {\n    clamp: function(n) {\n      if (this.magnitude() > n) {\n        return this.norm(n);\n      } else {\n        return this.copy();\n      }\n    },\n    copy: function() {\n      return Point(this.x, this.y);\n    },\n    add: function(first, second) {\n      if (second != null) {\n        return Point(this.x + first, this.y + second);\n      } else {\n        return Point(this.x + first.x, this.y + first.y);\n      }\n    },\n    subtract: function(first, second) {\n      if (second != null) {\n        return Point(this.x - first, this.y - second);\n      } else {\n        return this.add(first.scale(-1));\n      }\n    },\n    scale: function(scalar) {\n      return Point(this.x * scalar, this.y * scalar);\n    },\n    norm: function(length) {\n      var m;\n      if (length == null) {\n        length = 1.0;\n      }\n      if (m = this.length()) {\n        return this.scale(length / m);\n      } else {\n        return this.copy();\n      }\n    },\n    equal: function(other) {\n      return this.x === other.x && this.y === other.y;\n    },\n    length: function() {\n      return Math.sqrt(this.dot(this));\n    },\n    magnitude: function() {\n      return this.length();\n    },\n    direction: function() {\n      return Math.atan2(this.y, this.x);\n    },\n    dot: function(other) {\n      return this.x * other.x + this.y * other.y;\n    },\n    cross: function(other) {\n      return this.x * other.y - other.x * this.y;\n    },\n    distance: function(other) {\n      return Point.distance(this, other);\n    },\n    toFixed: function(n) {\n      return \"Point(\" + (this.x.toFixed(n)) + \", \" + (this.y.toFixed(n)) + \")\";\n    },\n    toString: function() {\n      return \"Point(\" + this.x + \", \" + this.y + \")\";\n    }\n  };\n\n  Point.distance = function(p1, p2) {\n    return Math.sqrt(Point.distanceSquared(p1, p2));\n  };\n\n  Point.distanceSquared = function(p1, p2) {\n    return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);\n  };\n\n  Point.interpolate = function(p1, p2, t) {\n    return p2.subtract(p1).scale(t).add(p1);\n  };\n\n  Point.fromAngle = function(angle) {\n    return Point(Math.cos(angle), Math.sin(angle));\n  };\n\n  Point.direction = function(p1, p2) {\n    return Math.atan2(p2.y - p1.y, p2.x - p1.x);\n  };\n\n  Point.centroid = function() {\n    var points;\n    points = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    return points.reduce(function(sumPoint, point) {\n      return sumPoint.add(point);\n    }, Point(0, 0)).scale(1 / points.length);\n  };\n\n  Point.random = function() {\n    return Point.fromAngle(Math.random() * 2 * Math.PI);\n  };\n\n  module.exports = Point;\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n}).call(this);\n\n//# sourceURL=point.coffee",
                  "type": "blob"
                },
                "test/test": {
                  "path": "test/test",
                  "content": "(function() {\n  var Point, TAU, equals, ok;\n\n  Point = require(\"../point\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  TAU = 2 * Math.PI;\n\n  describe(\"Point\", function() {\n    var TOLERANCE, equalEnough;\n    TOLERANCE = 0.00001;\n    equalEnough = function(expected, actual, tolerance, message) {\n      message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n      return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n    };\n    it(\"copy constructor\", function() {\n      var p, p2;\n      p = Point(3, 7);\n      p2 = Point(p);\n      equals(p2.x, p.x);\n      return equals(p2.y, p.y);\n    });\n    it(\"#add\", function() {\n      var p1, p2, result;\n      p1 = Point(5, 6);\n      p2 = Point(7, 5);\n      result = p1.add(p2);\n      equals(result.x, p1.x + p2.x);\n      equals(result.y, p1.y + p2.y);\n      equals(p1.x, 5);\n      equals(p1.y, 6);\n      equals(p2.x, 7);\n      return equals(p2.y, 5);\n    });\n    it(\"#add with two arguments\", function() {\n      var point, result, x, y;\n      point = Point(3, 7);\n      x = 2;\n      y = 1;\n      result = point.add(x, y);\n      equals(result.x, point.x + x);\n      equals(result.y, point.y + y);\n      x = 2;\n      y = 0;\n      result = point.add(x, y);\n      equals(result.x, point.x + x);\n      return equals(result.y, point.y + y);\n    });\n    it(\"#add existing\", function() {\n      var p;\n      p = Point(0, 0);\n      p.add(Point(3, 5));\n      equals(p.x, 0);\n      return equals(p.y, 0);\n    });\n    it(\"#subtract\", function() {\n      var p1, p2, result;\n      p1 = Point(5, 6);\n      p2 = Point(7, 5);\n      result = p1.subtract(p2);\n      equals(result.x, p1.x - p2.x);\n      return equals(result.y, p1.y - p2.y);\n    });\n    it(\"#subtract existing\", function() {\n      var p;\n      p = Point(8, 6);\n      p.subtract(3, 4);\n      equals(p.x, 8);\n      return equals(p.y, 6);\n    });\n    it(\"#norm\", function() {\n      var normal, p;\n      p = Point(2, 0);\n      normal = p.norm();\n      equals(normal.x, 1);\n      normal = p.norm(5);\n      equals(normal.x, 5);\n      p = Point(0, 0);\n      normal = p.norm();\n      equals(normal.x, 0, \"x value of norm of point(0,0) is 0\");\n      return equals(normal.y, 0, \"y value of norm of point(0,0) is 0\");\n    });\n    it(\"#norm existing\", function() {\n      var p;\n      p = Point(6, 8);\n      p.norm(5);\n      equals(p.x, 6);\n      return equals(p.y, 8);\n    });\n    it(\"#scale\", function() {\n      var p, result, scalar;\n      p = Point(5, 6);\n      scalar = 2;\n      result = p.scale(scalar);\n      equals(result.x, p.x * scalar);\n      equals(result.y, p.y * scalar);\n      equals(p.x, 5);\n      return equals(p.y, 6);\n    });\n    it(\"#scale existing\", function() {\n      var p, scalar;\n      p = Point(0, 1);\n      scalar = 3;\n      p.scale(scalar);\n      equals(p.x, 0);\n      return equals(p.y, 1);\n    });\n    it(\"#equal\", function() {\n      return ok(Point(7, 8).equal(Point(7, 8)));\n    });\n    it(\"#magnitude\", function() {\n      return equals(Point(3, 4).magnitude(), 5);\n    });\n    it(\"#length\", function() {\n      equals(Point(0, 0).length(), 0);\n      return equals(Point(-1, 0).length(), 1);\n    });\n    it(\"#toString\", function() {\n      var p;\n      p = Point(7, 5);\n      return ok(eval(p.toString()).equal(p));\n    });\n    it(\"#clamp\", function() {\n      var p, p2;\n      p = Point(10, 10);\n      p2 = p.clamp(5);\n      return equals(p2.length(), 5);\n    });\n    it(\".centroid\", function() {\n      var centroid;\n      centroid = Point.centroid(Point(0, 0), Point(10, 10), Point(10, 0), Point(0, 10));\n      equals(centroid.x, 5);\n      return equals(centroid.y, 5);\n    });\n    it(\".fromAngle\", function() {\n      var p;\n      p = Point.fromAngle(TAU / 4);\n      equalEnough(p.x, 0, TOLERANCE);\n      return equals(p.y, 1);\n    });\n    it(\".random\", function() {\n      var p;\n      p = Point.random();\n      return ok(p);\n    });\n    return it(\".interpolate\", function() {\n      var p1, p2;\n      p1 = Point(10, 7);\n      p2 = Point(-6, 29);\n      ok(p1.equal(Point.interpolate(p1, p2, 0)));\n      return ok(p2.equal(Point.interpolate(p1, p2, 1)));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.2.0",
              "entryPoint": "point",
              "repository": {
                "id": 13484982,
                "name": "point",
                "full_name": "distri/point",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/point",
                "description": "JavaScript Point implementation",
                "fork": false,
                "url": "https://api.github.com/repos/distri/point",
                "forks_url": "https://api.github.com/repos/distri/point/forks",
                "keys_url": "https://api.github.com/repos/distri/point/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/point/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/point/teams",
                "hooks_url": "https://api.github.com/repos/distri/point/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/point/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/point/events",
                "assignees_url": "https://api.github.com/repos/distri/point/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/point/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/point/tags",
                "blobs_url": "https://api.github.com/repos/distri/point/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/point/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/point/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/point/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/point/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/point/languages",
                "stargazers_url": "https://api.github.com/repos/distri/point/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/point/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/point/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/point/subscription",
                "commits_url": "https://api.github.com/repos/distri/point/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/point/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/point/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/point/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/point/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/point/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/point/merges",
                "archive_url": "https://api.github.com/repos/distri/point/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/point/downloads",
                "issues_url": "https://api.github.com/repos/distri/point/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/point/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/point/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/point/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/point/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/point/releases{/id}",
                "created_at": "2013-10-10T22:59:27Z",
                "updated_at": "2013-12-23T23:33:20Z",
                "pushed_at": "2013-10-15T00:22:04Z",
                "git_url": "git://github.com/distri/point.git",
                "ssh_url": "git@github.com:distri/point.git",
                "clone_url": "https://github.com/distri/point.git",
                "svn_url": "https://github.com/distri/point",
                "homepage": null,
                "size": 836,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.2.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            },
            "matrix": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "matrix\n======\n\nWhere matrices become heroes, together.\n",
                  "type": "blob"
                },
                "matrix.coffee.md": {
                  "path": "matrix.coffee.md",
                  "mode": "100644",
                  "content": "Matrix\n======\n\n```\n   _        _\n  | a  c tx  |\n  | b  d ty  |\n  |_0  0  1 _|\n```\n\nCreates a matrix for 2d affine transformations.\n\n`concat`, `inverse`, `rotate`, `scale` and `translate` return new matrices with\nthe transformations applied. The matrix is not modified in place.\n\nReturns the identity matrix when called with no arguments.\n\n    Matrix = (a, b, c, d, tx, ty) ->\n      if isObject(a)\n        {a, b, c, d, tx, ty} = a\n\n      __proto__: Matrix.prototype\n      a: a ? 1\n      b: b ? 0\n      c: c ? 0\n      d: d ? 1\n      tx: tx ? 0\n      ty: ty ? 0\n\nA `Point` constructor for the methods that return points. This can be overridden\nwith a compatible constructor if you want fancier points.\n\n    Matrix.Point = require \"./point\"\n\n    Matrix.prototype =\n\n`concat` returns the result of this matrix multiplied by another matrix\ncombining the geometric effects of the two. In mathematical terms,\nconcatenating two matrixes is the same as combining them using matrix multiplication.\nIf this matrix is A and the matrix passed in is B, the resulting matrix is A x B\nhttp://mathworld.wolfram.com/MatrixMultiplication.html\n\n      concat: (matrix) ->\n        Matrix(\n          @a * matrix.a + @c * matrix.b,\n          @b * matrix.a + @d * matrix.b,\n          @a * matrix.c + @c * matrix.d,\n          @b * matrix.c + @d * matrix.d,\n          @a * matrix.tx + @c * matrix.ty + @tx,\n          @b * matrix.tx + @d * matrix.ty + @ty\n        )\n\n\nReturn a new matrix that is a `copy` of this matrix.\n\n      copy: ->\n        Matrix(@a, @b, @c, @d, @tx, @ty)\n\nGiven a point in the pretransform coordinate space, returns the coordinates of\nthat point after the transformation occurs. Unlike the standard transformation\napplied using the transformPoint() method, the deltaTransformPoint() method\ndoes not consider the translation parameters tx and ty.\n\nReturns a new `Point` transformed by this matrix ignoring tx and ty.\n\n      deltaTransformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y,\n          @b * point.x + @d * point.y\n        )\n\nReturns a new matrix that is the inverse of this matrix.\nhttp://mathworld.wolfram.com/MatrixInverse.html\n\n      inverse: ->\n        determinant = @a * @d - @b * @c\n\n        Matrix(\n          @d / determinant,\n          -@b / determinant,\n          -@c / determinant,\n          @a / determinant,\n          (@c * @ty - @d * @tx) / determinant,\n          (@b * @tx - @a * @ty) / determinant\n        )\n\nReturns a new matrix that corresponds this matrix multiplied by a\na rotation matrix.\n\nThe first parameter `theta` is the amount to rotate in radians.\n\nThe second optional parameter, `aboutPoint` is the point about which the\nrotation occurs. Defaults to (0,0).\n\n      rotate: (theta, aboutPoint) ->\n        @concat(Matrix.rotation(theta, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na scaling matrix.\n\n      scale: (sx, sy, aboutPoint) ->\n        @concat(Matrix.scale(sx, sy, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na skewing matrix.\n\n      skew: (skewX, skewY) ->\n        @concat(Matrix.skew(skewX, skewY))\n\nReturns a string representation of this matrix.\n\n      toString: ->\n        \"Matrix(#{@a}, #{@b}, #{@c}, #{@d}, #{@tx}, #{@ty})\"\n\nReturns the result of applying the geometric transformation represented by the\nMatrix object to the specified point.\n\n      transformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y + @tx,\n          @b * point.x + @d * point.y + @ty\n        )\n\nTranslates the matrix along the x and y axes, as specified by the tx and ty parameters.\n\n      translate: (tx, ty) ->\n        @concat(Matrix.translation(tx, ty))\n\nCreates a matrix transformation that corresponds to the given rotation,\naround (0,0) or the specified point.\n\n    Matrix.rotate = Matrix.rotation = (theta, aboutPoint) ->\n      rotationMatrix = Matrix(\n        Math.cos(theta),\n        Math.sin(theta),\n        -Math.sin(theta),\n        Math.cos(theta)\n      )\n\n      if aboutPoint?\n        rotationMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            rotationMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return rotationMatrix\n\nReturns a matrix that corresponds to scaling by factors of sx, sy along\nthe x and y axis respectively.\n\nIf only one parameter is given the matrix is scaled uniformly along both axis.\n\nIf the optional aboutPoint parameter is given the scaling takes place\nabout the given point.\n\n    Matrix.scale = (sx, sy, aboutPoint) ->\n      sy = sy || sx\n\n      scaleMatrix = Matrix(sx, 0, 0, sy)\n\n      if aboutPoint\n        scaleMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            scaleMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return scaleMatrix\n\n\nReturns a matrix that corresponds to a skew of skewX, skewY.\n\n    Matrix.skew = (skewX, skewY) ->\n      Matrix(0, Math.tan(skewY), Math.tan(skewX), 0)\n\nReturns a matrix that corresponds to a translation of tx, ty.\n\n    Matrix.translate = Matrix.translation = (tx, ty) ->\n      Matrix(1, 0, 0, 1, tx, ty)\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object.prototype.toString.call(object) is \"[object Object]\"\n\n    frozen = (object) ->\n      Object.freeze?(object)\n\n      return object\n\nConstants\n---------\n\nA constant representing the identity matrix.\n\n    Matrix.IDENTITY = frozen Matrix()\n\nA constant representing the horizontal flip transformation matrix.\n\n    Matrix.HORIZONTAL_FLIP = frozen Matrix(-1, 0, 0, 1)\n\nA constant representing the vertical flip transformation matrix.\n\n    Matrix.VERTICAL_FLIP = frozen Matrix(1, 0, 0, -1)\n\nExports\n-------\n\n    module.exports = Matrix\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "version: \"0.3.1\"\nentryPoint: \"matrix\"\n",
                  "type": "blob"
                },
                "test/matrix.coffee": {
                  "path": "test/matrix.coffee",
                  "mode": "100644",
                  "content": "Matrix = require \"../matrix\"\nPoint = require \"../point\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Matrix\", ->\n\n  TOLERANCE = 0.00001\n  \n  equalEnough = (expected, actual, tolerance, message) ->\n    message ||= \"\" + expected + \" within \" + tolerance + \" of \" + actual\n    ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n  \n  matrixEqual = (m1, m2) ->\n    equalEnough(m1.a, m2.a, TOLERANCE)\n    equalEnough(m1.b, m2.b, TOLERANCE)\n    equalEnough(m1.c, m2.c, TOLERANCE)\n    equalEnough(m1.d, m2.d, TOLERANCE)\n    equalEnough(m1.tx, m2.tx, TOLERANCE)\n    equalEnough(m1.ty, m2.ty, TOLERANCE)\n  \n  test \"copy constructor\", ->\n   matrix = Matrix(1, 0, 0, 1, 10, 12)\n  \n   matrix2 = Matrix(matrix)\n  \n   ok matrix != matrix2\n   matrixEqual(matrix2, matrix)\n  \n  test \"Matrix() (Identity)\", ->\n    matrix = Matrix()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"Empty\", ->\n    matrix = Matrix(0, 0, 0, 0, 0, 0)\n  \n    equals(matrix.a, 0, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 0, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#copy\", ->\n    matrix = Matrix(2, 0, 0, 2)\n  \n    copyMatrix = matrix.copy()\n  \n    matrixEqual copyMatrix, matrix\n  \n    copyMatrix.a = 4\n  \n    equals copyMatrix.a, 4\n    equals matrix.a, 2, \"Old 'a' value is unchanged\"\n  \n  test \".scale\", ->\n    matrix = Matrix.scale(2, 2)\n  \n    equals(matrix.a, 2, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 2, \"d\")\n  \n    matrix = Matrix.scale(3)\n  \n    equals(matrix.a, 3, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 3, \"d\")\n  \n  test \".scale (about a point)\", ->\n    p = Point(5, 17)\n  \n    transformedPoint = Matrix.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#scale (about a point)\", ->\n    p = Point(3, 11)\n  \n    transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#skew\", ->\n    matrix = Matrix()\n\n    angle = 0.25 * Math.PI\n  \n    matrix = matrix.skew(angle, 0)\n  \n    equals matrix.c, Math.tan(angle)\n  \n  test \".rotation\", ->\n    matrix = Matrix.rotation(Math.PI / 2)\n  \n    equalEnough(matrix.a, 0, TOLERANCE)\n    equalEnough(matrix.b, 1, TOLERANCE)\n    equalEnough(matrix.c,-1, TOLERANCE)\n    equalEnough(matrix.d, 0, TOLERANCE)\n  \n  test \".rotation (about a point)\", ->\n    p = Point(11, 7)\n  \n    transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#rotate (about a point)\", ->\n    p = Point(8, 5);\n  \n    transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#inverse (Identity)\", ->\n    matrix = Matrix().inverse()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#concat\", ->\n    matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2))\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"#toString\", ->\n    matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5)\n    matrixEqual eval(matrix.toString()), matrix\n  \n  test \"Maths\", ->\n    a = Matrix(12, 3, 3, 1, 7, 9)\n    b = Matrix(3, 8, 3, 2, 1, 5)\n  \n    c = a.concat(b)\n  \n    equals(c.a, 60)\n    equals(c.b, 17)\n    equals(c.c, 42)\n    equals(c.d, 11)\n    equals(c.tx, 34)\n    equals(c.ty, 17)\n  \n  test \"Order of transformations should match manual concat\", ->\n    tx = 10\n    ty = 5\n    theta = Math.PI/3\n    s = 2\n  \n    m1 = Matrix().translate(tx, ty).scale(s).rotate(theta)\n    m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta))\n  \n    matrixEqual(m1, m2)\n  \n  test \"IDENTITY is immutable\", ->\n    identity = Matrix.IDENTITY\n  \n    identity.a = 5\n  \n    equals identity.a, 1\n",
                  "type": "blob"
                },
                "point.coffee.md": {
                  "path": "point.coffee.md",
                  "mode": "100644",
                  "content": "Point\n=====\n\nA very simple Point object constructor.\n\n    module.exports = (x, y) ->\n      x: x\n      y: y\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "matrix": {
                  "path": "matrix",
                  "content": "(function() {\n  var Matrix, frozen, isObject;\n\n  Matrix = function(a, b, c, d, tx, ty) {\n    var _ref;\n    if (isObject(a)) {\n      _ref = a, a = _ref.a, b = _ref.b, c = _ref.c, d = _ref.d, tx = _ref.tx, ty = _ref.ty;\n    }\n    return {\n      __proto__: Matrix.prototype,\n      a: a != null ? a : 1,\n      b: b != null ? b : 0,\n      c: c != null ? c : 0,\n      d: d != null ? d : 1,\n      tx: tx != null ? tx : 0,\n      ty: ty != null ? ty : 0\n    };\n  };\n\n  Matrix.Point = require(\"./point\");\n\n  Matrix.prototype = {\n    concat: function(matrix) {\n      return Matrix(this.a * matrix.a + this.c * matrix.b, this.b * matrix.a + this.d * matrix.b, this.a * matrix.c + this.c * matrix.d, this.b * matrix.c + this.d * matrix.d, this.a * matrix.tx + this.c * matrix.ty + this.tx, this.b * matrix.tx + this.d * matrix.ty + this.ty);\n    },\n    copy: function() {\n      return Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);\n    },\n    deltaTransformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);\n    },\n    inverse: function() {\n      var determinant;\n      determinant = this.a * this.d - this.b * this.c;\n      return Matrix(this.d / determinant, -this.b / determinant, -this.c / determinant, this.a / determinant, (this.c * this.ty - this.d * this.tx) / determinant, (this.b * this.tx - this.a * this.ty) / determinant);\n    },\n    rotate: function(theta, aboutPoint) {\n      return this.concat(Matrix.rotation(theta, aboutPoint));\n    },\n    scale: function(sx, sy, aboutPoint) {\n      return this.concat(Matrix.scale(sx, sy, aboutPoint));\n    },\n    skew: function(skewX, skewY) {\n      return this.concat(Matrix.skew(skewX, skewY));\n    },\n    toString: function() {\n      return \"Matrix(\" + this.a + \", \" + this.b + \", \" + this.c + \", \" + this.d + \", \" + this.tx + \", \" + this.ty + \")\";\n    },\n    transformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);\n    },\n    translate: function(tx, ty) {\n      return this.concat(Matrix.translation(tx, ty));\n    }\n  };\n\n  Matrix.rotate = Matrix.rotation = function(theta, aboutPoint) {\n    var rotationMatrix;\n    rotationMatrix = Matrix(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta));\n    if (aboutPoint != null) {\n      rotationMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(rotationMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return rotationMatrix;\n  };\n\n  Matrix.scale = function(sx, sy, aboutPoint) {\n    var scaleMatrix;\n    sy = sy || sx;\n    scaleMatrix = Matrix(sx, 0, 0, sy);\n    if (aboutPoint) {\n      scaleMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(scaleMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return scaleMatrix;\n  };\n\n  Matrix.skew = function(skewX, skewY) {\n    return Matrix(0, Math.tan(skewY), Math.tan(skewX), 0);\n  };\n\n  Matrix.translate = Matrix.translation = function(tx, ty) {\n    return Matrix(1, 0, 0, 1, tx, ty);\n  };\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n  frozen = function(object) {\n    if (typeof Object.freeze === \"function\") {\n      Object.freeze(object);\n    }\n    return object;\n  };\n\n  Matrix.IDENTITY = frozen(Matrix());\n\n  Matrix.HORIZONTAL_FLIP = frozen(Matrix(-1, 0, 0, 1));\n\n  Matrix.VERTICAL_FLIP = frozen(Matrix(1, 0, 0, -1));\n\n  module.exports = Matrix;\n\n}).call(this);\n\n//# sourceURL=matrix.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.3.1\",\"entryPoint\":\"matrix\"};",
                  "type": "blob"
                },
                "test/matrix": {
                  "path": "test/matrix",
                  "content": "(function() {\n  var Matrix, Point, equals, ok, test;\n\n  Matrix = require(\"../matrix\");\n\n  Point = require(\"../point\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Matrix\", function() {\n    var TOLERANCE, equalEnough, matrixEqual;\n    TOLERANCE = 0.00001;\n    equalEnough = function(expected, actual, tolerance, message) {\n      message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n      return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n    };\n    matrixEqual = function(m1, m2) {\n      equalEnough(m1.a, m2.a, TOLERANCE);\n      equalEnough(m1.b, m2.b, TOLERANCE);\n      equalEnough(m1.c, m2.c, TOLERANCE);\n      equalEnough(m1.d, m2.d, TOLERANCE);\n      equalEnough(m1.tx, m2.tx, TOLERANCE);\n      return equalEnough(m1.ty, m2.ty, TOLERANCE);\n    };\n    test(\"copy constructor\", function() {\n      var matrix, matrix2;\n      matrix = Matrix(1, 0, 0, 1, 10, 12);\n      matrix2 = Matrix(matrix);\n      ok(matrix !== matrix2);\n      return matrixEqual(matrix2, matrix);\n    });\n    test(\"Matrix() (Identity)\", function() {\n      var matrix;\n      matrix = Matrix();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      equals(matrix.ty, 0, \"ty\");\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"Empty\", function() {\n      var matrix;\n      matrix = Matrix(0, 0, 0, 0, 0, 0);\n      equals(matrix.a, 0, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 0, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#copy\", function() {\n      var copyMatrix, matrix;\n      matrix = Matrix(2, 0, 0, 2);\n      copyMatrix = matrix.copy();\n      matrixEqual(copyMatrix, matrix);\n      copyMatrix.a = 4;\n      equals(copyMatrix.a, 4);\n      return equals(matrix.a, 2, \"Old 'a' value is unchanged\");\n    });\n    test(\".scale\", function() {\n      var matrix;\n      matrix = Matrix.scale(2, 2);\n      equals(matrix.a, 2, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 2, \"d\");\n      matrix = Matrix.scale(3);\n      equals(matrix.a, 3, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      return equals(matrix.d, 3, \"d\");\n    });\n    test(\".scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(5, 17);\n      transformedPoint = Matrix.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(3, 11);\n      transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#skew\", function() {\n      var angle, matrix;\n      matrix = Matrix();\n      angle = 0.25 * Math.PI;\n      matrix = matrix.skew(angle, 0);\n      return equals(matrix.c, Math.tan(angle));\n    });\n    test(\".rotation\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2);\n      equalEnough(matrix.a, 0, TOLERANCE);\n      equalEnough(matrix.b, 1, TOLERANCE);\n      equalEnough(matrix.c, -1, TOLERANCE);\n      return equalEnough(matrix.d, 0, TOLERANCE);\n    });\n    test(\".rotation (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(11, 7);\n      transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#rotate (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(8, 5);\n      transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#inverse (Identity)\", function() {\n      var matrix;\n      matrix = Matrix().inverse();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#concat\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2));\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"#toString\", function() {\n      var matrix;\n      matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5);\n      return matrixEqual(eval(matrix.toString()), matrix);\n    });\n    test(\"Maths\", function() {\n      var a, b, c;\n      a = Matrix(12, 3, 3, 1, 7, 9);\n      b = Matrix(3, 8, 3, 2, 1, 5);\n      c = a.concat(b);\n      equals(c.a, 60);\n      equals(c.b, 17);\n      equals(c.c, 42);\n      equals(c.d, 11);\n      equals(c.tx, 34);\n      return equals(c.ty, 17);\n    });\n    test(\"Order of transformations should match manual concat\", function() {\n      var m1, m2, s, theta, tx, ty;\n      tx = 10;\n      ty = 5;\n      theta = Math.PI / 3;\n      s = 2;\n      m1 = Matrix().translate(tx, ty).scale(s).rotate(theta);\n      m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta));\n      return matrixEqual(m1, m2);\n    });\n    return test(\"IDENTITY is immutable\", function() {\n      var identity;\n      identity = Matrix.IDENTITY;\n      identity.a = 5;\n      return equals(identity.a, 1);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/matrix.coffee",
                  "type": "blob"
                },
                "point": {
                  "path": "point",
                  "content": "(function() {\n  module.exports = function(x, y) {\n    return {\n      x: x,\n      y: y\n    };\n  };\n\n}).call(this);\n\n//# sourceURL=point.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.3.1",
              "entryPoint": "matrix",
              "repository": {
                "id": 13551996,
                "name": "matrix",
                "full_name": "distri/matrix",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/matrix",
                "description": "Where matrices become heroes, together.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/matrix",
                "forks_url": "https://api.github.com/repos/distri/matrix/forks",
                "keys_url": "https://api.github.com/repos/distri/matrix/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/matrix/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/matrix/teams",
                "hooks_url": "https://api.github.com/repos/distri/matrix/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/matrix/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/matrix/events",
                "assignees_url": "https://api.github.com/repos/distri/matrix/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/matrix/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/matrix/tags",
                "blobs_url": "https://api.github.com/repos/distri/matrix/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/matrix/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/matrix/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/matrix/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/matrix/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/matrix/languages",
                "stargazers_url": "https://api.github.com/repos/distri/matrix/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/matrix/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/matrix/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/matrix/subscription",
                "commits_url": "https://api.github.com/repos/distri/matrix/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/matrix/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/matrix/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/matrix/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/matrix/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/matrix/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/matrix/merges",
                "archive_url": "https://api.github.com/repos/distri/matrix/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/matrix/downloads",
                "issues_url": "https://api.github.com/repos/distri/matrix/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/matrix/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/matrix/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/matrix/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/matrix/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/matrix/releases{/id}",
                "created_at": "2013-10-14T03:46:16Z",
                "updated_at": "2013-12-23T23:45:28Z",
                "pushed_at": "2013-10-15T00:22:51Z",
                "git_url": "git://github.com/distri/matrix.git",
                "ssh_url": "git@github.com:distri/matrix.git",
                "clone_url": "https://github.com/distri/matrix.git",
                "svn_url": "https://github.com/distri/matrix",
                "homepage": null,
                "size": 580,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.3.1",
                "defaultBranch": "master"
              },
              "dependencies": {}
            },
            "random": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "content": "random\n======\n\nRandom generation.\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "content": "version: \"0.2.2\"\nentryPoint: \"random\"\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "random.coffee.md": {
                  "path": "random.coffee.md",
                  "content": "Random\n======\n\nSome useful methods for generating random things.\n\nHelpers\n-------\n\n`τ` is the circle constant.\n\n    τ = 2 * Math.PI\n\n`U` returns a continuous uniform distribution between `min` and `max`.\n\n    U = (min, max) ->\n      ->\n        Math.random() * (max - min) + min\n\n`standardUniformDistribution` is the uniform distribution between [0, 1]\n\n    standardUniformDistribution = U(0, 1)\n\n`rand` is a helpful shortcut for generating random numbers from a standard\nuniform distribution or from a discreet set of integers.\n\n    rand = (n) ->\n      if n\n        Math.floor(n * standardUniformDistribution())\n      else\n        standardUniformDistribution()\n\nMethods\n-------\n\n    module.exports = Random =\n\nReturns a random angle, uniformly distributed, between 0 and τ.\n\n      angle: ->\n        rand() * τ\n\nA binomial distribution.\n\n      binomial: (n=1, p=0.5) ->\n        [0...n].map ->\n          if rand() < p\n            1\n          else\n            0\n        .reduce (a, b) ->\n          a + b\n        , 0\n\nReturns a random float between two numbers.\n\n      between: (min, max) ->\n        rand() * (max - min) + min\n\nReturns random integers from [0, n) if n is given.\nOtherwise returns random float between 0 and 1.\n\n      rand: rand\n\nReturns random float from [-n / 2, n / 2] if n is given.\nOtherwise returns random float between -0.5 and 0.5.\n\n      signed: (n=1) ->\n        (n * rand()) - (n / 2)\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "test/random.coffee": {
                  "path": "test/random.coffee",
                  "content": "Random = require \"../random\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Random\", ->\n\n  test \"methods\", ->\n    [\n      \"angle\"\n      \"binomial\"\n      \"between\"\n      \"rand\"\n      \"signed\"\n    ].forEach (name) ->\n      ok(Random[name], name)\n\n  it \"should have binomial\", ->\n    result = Random.binomial()\n\n    assert result is 1 or result is 0\n",
                  "mode": "100644",
                  "type": "blob"
                }
              },
              "distribution": {
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.2.2\",\"entryPoint\":\"random\"};",
                  "type": "blob"
                },
                "random": {
                  "path": "random",
                  "content": "(function() {\n  var Random, U, rand, standardUniformDistribution, τ;\n\n  τ = 2 * Math.PI;\n\n  U = function(min, max) {\n    return function() {\n      return Math.random() * (max - min) + min;\n    };\n  };\n\n  standardUniformDistribution = U(0, 1);\n\n  rand = function(n) {\n    if (n) {\n      return Math.floor(n * standardUniformDistribution());\n    } else {\n      return standardUniformDistribution();\n    }\n  };\n\n  module.exports = Random = {\n    angle: function() {\n      return rand() * τ;\n    },\n    binomial: function(n, p) {\n      var _i, _results;\n      if (n == null) {\n        n = 1;\n      }\n      if (p == null) {\n        p = 0.5;\n      }\n      return (function() {\n        _results = [];\n        for (var _i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function() {\n        if (rand() < p) {\n          return 1;\n        } else {\n          return 0;\n        }\n      }).reduce(function(a, b) {\n        return a + b;\n      }, 0);\n    },\n    between: function(min, max) {\n      return rand() * (max - min) + min;\n    },\n    rand: rand,\n    signed: function(n) {\n      if (n == null) {\n        n = 1;\n      }\n      return (n * rand()) - (n / 2);\n    }\n  };\n\n}).call(this);\n",
                  "type": "blob"
                },
                "test/random": {
                  "path": "test/random",
                  "content": "(function() {\n  var Random, equals, ok, test;\n\n  Random = require(\"../random\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Random\", function() {\n    test(\"methods\", function() {\n      return [\"angle\", \"binomial\", \"between\", \"rand\", \"signed\"].forEach(function(name) {\n        return ok(Random[name], name);\n      });\n    });\n    return it(\"should have binomial\", function() {\n      var result;\n      result = Random.binomial();\n      return assert(result === 1 || result === 0);\n    });\n  });\n\n}).call(this);\n",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "https://danielx.net/editor/"
              },
              "version": "0.2.2",
              "entryPoint": "random",
              "repository": {
                "branch": "v0.2.2",
                "default_branch": "master",
                "full_name": "distri/random",
                "homepage": null,
                "description": "Random generation.",
                "html_url": "https://github.com/distri/random",
                "url": "https://api.github.com/repos/distri/random",
                "publishBranch": "gh-pages"
              },
              "dependencies": {}
            },
            "size": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
                  "mode": "100644",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "content": "size\n====\n\n2d extent\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "main.coffee.md": {
                  "path": "main.coffee.md",
                  "content": "Size\n====\n\nA simple 2d extent.\n\n    Size = (width, height) ->\n      if Array.isArray(width)\n        [width, height] = width\n      else if typeof width is \"object\"\n        {width, height} = width\n\n      width: width\n      height: height\n      __proto__: Size.prototype\n\n    Size.prototype =\n      copy: ->\n        Size(this)\n\n      scale: (scalar) ->\n        Size(@width * scalar, @height * scalar)\n\n      toString: ->\n        \"Size(#{@width}, #{@height})\"\n\n      max: (otherSize) ->\n        Size(\n          Math.max(@width, otherSize.width)\n          Math.max(@height, otherSize.height)\n        )\n\n      each: (iterator) ->\n        [0...@height].forEach (y) =>\n          [0...@width].forEach (x) ->\n            iterator(x, y)\n\n      inverse: ->\n        Size(1/@width, 1/@height)\n\n    module.exports = Size\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "content": "version: \"0.1.4\"\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "test/test.coffee": {
                  "path": "test/test.coffee",
                  "content": "Size = require \"../main\"\n\ndescribe \"Size\", ->\n  it \"should have a width and height\", ->\n    size = Size(10, 10)\n\n    assert.equal size.width, 10\n    assert.equal size.height, 10\n\n  it \"should be createable from an array\", ->\n    size = Size [5, 4]\n\n    assert.equal size.width, 5\n    assert.equal size.height, 4\n\n  it \"should be createable from an object\", ->\n    size = Size\n      width: 6\n      height: 7\n\n    assert.equal size.width, 6\n    assert.equal size.height, 7\n\n  it \"should iterate\", ->\n    size = Size(4, 5)\n    total = 0\n\n    size.each (x, y) ->\n      total += 1\n\n    assert.equal total, 20\n\n  it \"should have no iterations when empty\", ->\n    size = Size(0, 0)\n    total = 0\n\n    size.each (x, y) ->\n      total += 1\n\n    assert.equal total, 0\n",
                  "mode": "100644",
                  "type": "blob"
                }
              },
              "distribution": {
                "main": {
                  "path": "main",
                  "content": "(function() {\n  var Size;\n\n  Size = function(width, height) {\n    var _ref, _ref1;\n    if (Array.isArray(width)) {\n      _ref = width, width = _ref[0], height = _ref[1];\n    } else if (typeof width === \"object\") {\n      _ref1 = width, width = _ref1.width, height = _ref1.height;\n    }\n    return {\n      width: width,\n      height: height,\n      __proto__: Size.prototype\n    };\n  };\n\n  Size.prototype = {\n    copy: function() {\n      return Size(this);\n    },\n    scale: function(scalar) {\n      return Size(this.width * scalar, this.height * scalar);\n    },\n    toString: function() {\n      return \"Size(\" + this.width + \", \" + this.height + \")\";\n    },\n    max: function(otherSize) {\n      return Size(Math.max(this.width, otherSize.width), Math.max(this.height, otherSize.height));\n    },\n    each: function(iterator) {\n      var _i, _ref, _results;\n      return (function() {\n        _results = [];\n        for (var _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach((function(_this) {\n        return function(y) {\n          var _i, _ref, _results;\n          return (function() {\n            _results = [];\n            for (var _i = 0, _ref = _this.width; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).forEach(function(x) {\n            return iterator(x, y);\n          });\n        };\n      })(this));\n    },\n    inverse: function() {\n      return Size(1 / this.width, 1 / this.height);\n    }\n  };\n\n  module.exports = Size;\n\n}).call(this);\n",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.1.4\"};",
                  "type": "blob"
                },
                "test/test": {
                  "path": "test/test",
                  "content": "(function() {\n  var Size;\n\n  Size = require(\"../main\");\n\n  describe(\"Size\", function() {\n    it(\"should have a width and height\", function() {\n      var size;\n      size = Size(10, 10);\n      assert.equal(size.width, 10);\n      return assert.equal(size.height, 10);\n    });\n    it(\"should be createable from an array\", function() {\n      var size;\n      size = Size([5, 4]);\n      assert.equal(size.width, 5);\n      return assert.equal(size.height, 4);\n    });\n    it(\"should be createable from an object\", function() {\n      var size;\n      size = Size({\n        width: 6,\n        height: 7\n      });\n      assert.equal(size.width, 6);\n      return assert.equal(size.height, 7);\n    });\n    it(\"should iterate\", function() {\n      var size, total;\n      size = Size(4, 5);\n      total = 0;\n      size.each(function(x, y) {\n        return total += 1;\n      });\n      return assert.equal(total, 20);\n    });\n    return it(\"should have no iterations when empty\", function() {\n      var size, total;\n      size = Size(0, 0);\n      total = 0;\n      size.each(function(x, y) {\n        return total += 1;\n      });\n      return assert.equal(total, 0);\n    });\n  });\n\n}).call(this);\n",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://www.danielx.net/editor/"
              },
              "version": "0.1.4",
              "entryPoint": "main",
              "repository": {
                "branch": "v0.1.4",
                "default_branch": "master",
                "full_name": "distri/size",
                "homepage": null,
                "description": "2d extent",
                "html_url": "https://github.com/distri/size",
                "url": "https://api.github.com/repos/distri/size",
                "publishBranch": "gh-pages"
              },
              "dependencies": {}
            }
          }
        },
        "model": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "Model\n=====\n\nThe `Model` module provides helper methods to compose nested data models.\n\nModels uses [Observable](/observable/docs) to keep the internal data in sync.\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "content": "Model\n=====\n\nThe `Model` module provides helper methods to compose nested data models.\n\nModels uses [Observable](/observable/docs) to keep the internal data in sync.\n\n    Core = require \"./core\"\n    Observable = global.Observable ? require \"observable\"\n\n    module.exports = Model = (I={}, self=Core(I)) ->\n\n      self.extend\n\nObserve any number of attributes as simple observables. For each attribute name passed in we expose a public getter/setter method and listen to changes when the value is set.\n\n        attrObservable: (names...) ->\n          names.forEach (name) ->\n            self[name] = Observable(I[name])\n\n            self[name].observe (newValue) ->\n              I[name] = newValue\n\n          return self\n\nObserve an attribute as a model. Treats the attribute given as an Observable\nmodel instance exposting a getter/setter method of the same name. The Model\nconstructor must be passed in explicitly.\n\n        attrModel: (name, Model) ->\n          model = Model(I[name])\n\n          self[name] = Observable(model)\n\n          self[name].observe (newValue) ->\n            I[name] = newValue.I\n\n          return self\n\nObserve an attribute as a list of sub-models. This is the same as `attrModel`\nexcept the attribute is expected to be an array of models rather than a single one.\n\n        attrModels: (name, Model) ->\n          models = (I[name] or []).map (x) ->\n            Model(x)\n\n          self[name] = Observable(models)\n\n          self[name].observe (newValue) ->\n            I[name] = newValue.map (instance) ->\n              instance.I\n\n          return self\n\nThe JSON representation is kept up to date via the observable properites and resides in `I`.\n\n        toJSON: ->\n          I\n\nReturn our public object.\n\n      return self\n\n    Model.Core = Core\n    Model.Observable = Observable\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.2.0-pre.2\"\ndependencies:\n  observable: \"distri/observable:v0.3.7\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/model.coffee": {
              "path": "test/model.coffee",
              "content": "Model = require \"../main\"\n\ndescribe 'Model', ->\n  # Association Testing model\n  Person = (I) ->\n    person = Model(I)\n\n    person.attrAccessor(\n      'firstName'\n      'lastName'\n      'suffix'\n    )\n\n    person.fullName = ->\n      \"#{@firstName()} #{@lastName()} #{@suffix()}\"\n\n    return person\n\n  describe \"#attrObservable\", ->\n    it 'should allow for observing of attributes', ->\n      model = Model\n        name: \"Duder\"\n\n      model.attrObservable \"name\"\n\n      model.name(\"Dudeman\")\n\n      assert.equal model.name(), \"Dudeman\"\n\n    it 'should bind properties to observable attributes', ->\n      model = Model\n        name: \"Duder\"\n\n      model.attrObservable \"name\"\n\n      model.name(\"Dudeman\")\n\n      assert.equal model.name(), \"Dudeman\"\n      assert.equal model.name(), model.I.name\n\n  describe \"#attrModel\", ->\n    it \"should be a model instance\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      assert.equal model.person().fullName(), \"Duder Mannington Jr.\"\n\n    it \"should allow setting the associated model\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      otherPerson = Person\n        firstName: \"Mr.\"\n        lastName: \"Man\"\n\n      model.person(otherPerson)\n\n      assert.equal model.person().firstName(), \"Mr.\"\n\n    it \"shouldn't update the instance properties after it's been replaced\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      duder = model.person()\n\n      otherPerson = Person\n        firstName: \"Mr.\"\n        lastName: \"Man\"\n\n      model.person(otherPerson)\n\n      duder.firstName(\"Joe\")\n\n      assert.equal duder.I.firstName, \"Joe\"\n      assert.equal model.I.person.firstName, \"Mr.\"\n\n  describe \"#attrModels\", ->\n    it \"should have an array of model instances\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      assert.equal model.people()[0].fullName(), \"Duder Mannington Jr.\"\n\n    it \"should track pushes\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      model.people.push Person\n        firstName: \"JoJo\"\n        lastName: \"Loco\"\n\n      assert.equal model.people().length, 3\n      assert.equal model.I.people.length, 3\n\n    it \"should track pops\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      model.people.pop()\n\n      assert.equal model.people().length, 1\n      assert.equal model.I.people.length, 1\n\n  describe \"#toJSON\", ->\n    it \"should return an object appropriate for JSON serialization\", ->\n      model = Model\n        test: true\n\n      assert model.toJSON().test\n\n  describe \"#observeAll\", ->\n    it \"should observe all attributes of a simple model\"\n    ->  # TODO\n      model = Model\n        test: true\n        yolo: \"4life\"\n\n      model.observeAll()\n\n      assert model.test()\n      assert.equal model.yolo(), \"4life\"\n\n    it \"should camel case underscored names\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "mode": "100644"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "mode": "100644"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var Core, Model, Observable, _ref,\n    __slice = [].slice;\n\n  Core = require(\"./core\");\n\n  Observable = (_ref = global.Observable) != null ? _ref : require(\"observable\");\n\n  module.exports = Model = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      attrObservable: function() {\n        var names;\n        names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        names.forEach(function(name) {\n          self[name] = Observable(I[name]);\n          return self[name].observe(function(newValue) {\n            return I[name] = newValue;\n          });\n        });\n        return self;\n      },\n      attrModel: function(name, Model) {\n        var model;\n        model = Model(I[name]);\n        self[name] = Observable(model);\n        self[name].observe(function(newValue) {\n          return I[name] = newValue.I;\n        });\n        return self;\n      },\n      attrModels: function(name, Model) {\n        var models;\n        models = (I[name] || []).map(function(x) {\n          return Model(x);\n        });\n        self[name] = Observable(models);\n        self[name].observe(function(newValue) {\n          return I[name] = newValue.map(function(instance) {\n            return instance.I;\n          });\n        });\n        return self;\n      },\n      toJSON: function() {\n        return I;\n      }\n    });\n    return self;\n  };\n\n  Model.Core = Core;\n\n  Model.Observable = Observable;\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0-pre.2\",\"dependencies\":{\"observable\":\"distri/observable:v0.3.7\"}};",
              "type": "blob"
            },
            "test/model": {
              "path": "test/model",
              "content": "(function() {\n  var Model;\n\n  Model = require(\"../main\");\n\n  describe('Model', function() {\n    var Person;\n    Person = function(I) {\n      var person;\n      person = Model(I);\n      person.attrAccessor('firstName', 'lastName', 'suffix');\n      person.fullName = function() {\n        return \"\" + (this.firstName()) + \" \" + (this.lastName()) + \" \" + (this.suffix());\n      };\n      return person;\n    };\n    describe(\"#attrObservable\", function() {\n      it('should allow for observing of attributes', function() {\n        var model;\n        model = Model({\n          name: \"Duder\"\n        });\n        model.attrObservable(\"name\");\n        model.name(\"Dudeman\");\n        return assert.equal(model.name(), \"Dudeman\");\n      });\n      return it('should bind properties to observable attributes', function() {\n        var model;\n        model = Model({\n          name: \"Duder\"\n        });\n        model.attrObservable(\"name\");\n        model.name(\"Dudeman\");\n        assert.equal(model.name(), \"Dudeman\");\n        return assert.equal(model.name(), model.I.name);\n      });\n    });\n    describe(\"#attrModel\", function() {\n      it(\"should be a model instance\", function() {\n        var model;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        return assert.equal(model.person().fullName(), \"Duder Mannington Jr.\");\n      });\n      it(\"should allow setting the associated model\", function() {\n        var model, otherPerson;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        otherPerson = Person({\n          firstName: \"Mr.\",\n          lastName: \"Man\"\n        });\n        model.person(otherPerson);\n        return assert.equal(model.person().firstName(), \"Mr.\");\n      });\n      return it(\"shouldn't update the instance properties after it's been replaced\", function() {\n        var duder, model, otherPerson;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        duder = model.person();\n        otherPerson = Person({\n          firstName: \"Mr.\",\n          lastName: \"Man\"\n        });\n        model.person(otherPerson);\n        duder.firstName(\"Joe\");\n        assert.equal(duder.I.firstName, \"Joe\");\n        return assert.equal(model.I.person.firstName, \"Mr.\");\n      });\n    });\n    describe(\"#attrModels\", function() {\n      it(\"should have an array of model instances\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        return assert.equal(model.people()[0].fullName(), \"Duder Mannington Jr.\");\n      });\n      it(\"should track pushes\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        model.people.push(Person({\n          firstName: \"JoJo\",\n          lastName: \"Loco\"\n        }));\n        assert.equal(model.people().length, 3);\n        return assert.equal(model.I.people.length, 3);\n      });\n      return it(\"should track pops\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        model.people.pop();\n        assert.equal(model.people().length, 1);\n        return assert.equal(model.I.people.length, 1);\n      });\n    });\n    describe(\"#toJSON\", function() {\n      return it(\"should return an object appropriate for JSON serialization\", function() {\n        var model;\n        model = Model({\n          test: true\n        });\n        return assert(model.toJSON().test);\n      });\n    });\n    return describe(\"#observeAll\", function() {\n      it(\"should observe all attributes of a simple model\");\n      (function() {\n        var model;\n        model = Model({\n          test: true,\n          yolo: \"4life\"\n        });\n        model.observeAll();\n        assert(model.test());\n        return assert.equal(model.yolo(), \"4life\");\n      });\n      return it(\"should camel case underscored names\");\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            },
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "https://danielx.net/editor/"
          },
          "version": "0.2.0-pre.2",
          "entryPoint": "main",
          "repository": {
            "branch": "v0.2.0-pre.2",
            "default_branch": "master",
            "full_name": "distri/model",
            "homepage": null,
            "description": "",
            "html_url": "https://github.com/distri/model",
            "url": "https://api.github.com/repos/distri/model",
            "publishBranch": "gh-pages"
          },
          "dependencies": {
            "observable": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "content": "[![Build Status](https://travis-ci.org/distri/observable.svg?branch=npm)](https://travis-ci.org/distri/observable)\n\nObservable\n==========\n\nInstallation\n------------\n\nNode\n\n    npm install o_0\n\nUsage\n-----\n\n    Observable = require \"o_0\"\n\nGet notified when the value changes.\n\n    observable = Observable 5\n\n    observable() # 5\n\n    observable.observe (newValue) ->\n      console.log newValue\n\n    observable 10 # logs 10 to console\n\nArrays\n------\n\nProxy array methods.\n\n    observable = Observable [1, 2, 3]\n\n    observable.forEach (value) ->\n      # 1, 2, 3\n\nFunctions\n---------\n\nAutomagically compute dependencies for observable functions.\n\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n    lastName \"Bro\"\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "main.coffee.md": {
                  "path": "main.coffee.md",
                  "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    Observable = (value, context) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        copy(listeners).forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n\nOur return function is a function that holds only a cached value which is updated\nwhen it's dependencies change.\n\nThe `magicDependency` call is so other functions can depend on this computed function the\nsame way we depend on other types of observables.\n\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        changed = ->\n          value = computeDependencies(self, fn, changed, context)\n          notify(value)\n\n        changed()\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (callback) ->\n        magicDependency(self)\n\n        if value?\n          [value].forEach (item) ->\n            callback.call(item, item)\n\n        return self\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            magicDependency(self)\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        try # Provide length on a best effort basis because older browsers choke\n          Object.defineProperty self, 'length',\n            get: ->\n              magicDependency(self)\n              value.length\n            set: (length) ->\n              value.length = length\n              notifyReturning(value.length)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (callback) ->\n            self.forEach (item, index) ->\n              callback.call(item, item, index, self)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            magicDependency(self)\n            value[index]\n\n          first: ->\n            magicDependency(self)\n            value[0]\n\n          last: ->\n            magicDependency(self)\n            value[value.length-1]\n\n          size: ->\n            magicDependency(self)\n            value.length\n\n      extend self,\n        listeners: listeners\n\n        observe: (listener) ->\n          listeners.push listener\n\n        stopObserving: (fn) ->\n          remove listeners, fn\n\n        toggle: ->\n          self !value\n\n        increment: (n) ->\n          self value + n\n\n        decrement: (n) ->\n          self value - n\n\n        toString: ->\n          \"Observable(#{value})\"\n\n      return self\n\n    Observable.concat = (args...) ->\n      args = Observable(args)\n\n      o = Observable ->\n        flatten args.map(splat)\n\n      o.push = args.push\n\n      return o\n\nExport `Observable`\n\n    module.exports = Observable\n\nAppendix\n--------\n\nThe extend method adds one objects properties to another.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = []\n\n    magicDependency = (self) ->\n      observerSet = last(global.OBSERVABLE_ROOT_HACK)\n      if observerSet\n        observerSet.add self\n\nAutomagically compute dependencies.\n\n    computeDependencies = (self, fn, update, context) ->\n      deps = new Set\n\n      global.OBSERVABLE_ROOT_HACK.push(deps)\n\n      try\n        value = fn.call(context)\n      finally\n        global.OBSERVABLE_ROOT_HACK.pop()\n\n      self._deps?.forEach (observable) ->\n        observable.stopObserving update\n\n      self._deps = deps\n\n      deps.forEach (observable) ->\n        observable.observe update\n\n      return value\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n\n    copy = (array) ->\n      array.concat([])\n\n    get = (arg) ->\n      if typeof arg is \"function\"\n        arg()\n      else\n        arg\n\n    splat = (item) ->\n      results = []\n\n      return results unless item?\n\n      if typeof item.forEach is \"function\"\n        item.forEach (i) ->\n          results.push i\n      else\n        result = get item\n\n        results.push result if result?\n\n      results\n\n    last = (array) ->\n      array[array.length - 1]\n\n    flatten = (array) ->\n      array.reduce (a, b) ->\n        a.concat(b)\n      , []\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "content": "version: \"0.3.7\"\n",
                  "mode": "100644",
                  "type": "blob"
                },
                "test/observable.coffee": {
                  "path": "test/observable.coffee",
                  "content": "global.Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it \"should not fire when setting to the same value\", ->\n    o = Observable 5\n\n    o.observe ->\n      assert false\n\n    o(5)\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n    it \"should have the correct `this` scope for items\", (done) ->\n      o = Observable 5\n\n      o.each ->\n        assert.equal this, 5\n        done()\n\n    it \"should have the correct `this` scope for items in observable arrays\", ->\n      scopes = []\n\n      o = Observable [\"I'm\", \"an\", \"array\"]\n\n      o.each ->\n        scopes.push this\n\n      assert.equal scopes[0], \"I'm\"\n      assert.equal scopes[1], \"an\"\n      assert.equal scopes[2], \"array\"\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\n  it \"should increment\", ->\n    observable = Observable 1\n\n    observable.increment(5)\n\n    assert.equal observable(), 6\n\n  it \"should decremnet\", ->\n    observable = Observable 1\n\n    observable.decrement 5\n\n    assert.equal observable(), -4\n\n  it \"should toggle\", ->\n    observable = Observable false\n\n    observable.toggle()\n    assert.equal observable(), true\n\n    observable.toggle()\n    assert.equal observable(), false\n\n  it \"should trigger when toggling\", (done) ->\n    observable = Observable true\n    observable.observe (v) ->\n      assert.equal v, false\n      done()\n\n    observable.toggle()\n\n  it \"should have a nice toString\", ->\n    observable = Observable 5\n\n    assert.equal observable.toString(), \"Observable(5)\"\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  it \"#remove non-existent element\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.remove(0), undefined\n\n  it \"should proxy the length property\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.length, 3\n\n    called = false\n    o.observe (value) ->\n      assert.equal value[0], 1\n      assert.equal value[1], undefined\n      called = true\n\n    o.length = 1\n    assert.equal o.length, 1\n    assert.equal called, true\n\n  it \"should auto detect conditionals of length as a dependency\", ->\n    observableArray = Observable [1, 2, 3]\n\n    o = Observable ->\n      if observableArray.length > 5\n        true\n      else\n        false\n\n    assert.equal o(), false\n\n    called = 0\n    o.observe ->\n      called += 1\n\n    observableArray.push 4, 5, 6\n\n    assert.equal called, 1\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should compute array#get as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.get(0)\n\n    assert.equal observableFn(), 0\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#first as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.first() + 1\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 6\n\n  it \"should compute array#last as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.last()\n\n    assert.equal observableFn(), 2\n\n    observableArray.pop()\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#size as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.size() * 2\n\n    assert.equal observableFn(), 6\n\n    observableArray.pop()\n    assert.equal observableFn(), 4\n    observableArray.shift()\n    assert.equal observableFn(), 2\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should work with dynamic dependencies\", ->\n    observableArray = Observable []\n\n    dynamicObservable = Observable ->\n      observableArray.filter (item) ->\n        item.age() > 3\n\n    assert.equal dynamicObservable().length, 0\n\n    observableArray.push\n      age: Observable 1\n\n    observableArray()[0].age 5\n    assert.equal dynamicObservable().length, 1\n\n  it \"should work with context\", ->\n    model =\n      a: Observable \"Hello\"\n      b: Observable \"there\"\n\n    model.c = Observable ->\n      \"#{@a()} #{@b()}\"\n    , model\n\n    assert.equal model.c(), \"Hello there\"\n\n    model.b \"world\"\n\n    assert.equal model.c(), \"Hello world\"\n\n  it \"should be ok even if the function throws an exception\", ->\n    assert.throws ->\n      t = Observable ->\n        throw \"wat\"\n\n    # TODO: Should be able to find a test case that is affected by this rather that\n    # checking it directly\n    assert.equal global.OBSERVABLE_ROOT_HACK.length, 0\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each()\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n\n  it \"should work with multiple dependencies\", ->\n    letter = Observable \"A\"\n    checked = ->\n      l = letter()\n      @name().indexOf(l) is 0\n\n    first = {name: Observable(\"Andrew\")}\n    first.checked = Observable checked, first\n\n    second = {name: Observable(\"Benjamin\")}\n    second.checked = Observable checked, second\n\n    assert.equal first.checked(), true\n    assert.equal second.checked(), false\n\n    assert.equal letter.listeners.length, 2\n\n    letter \"B\"\n\n    assert.equal first.checked(), false\n    assert.equal second.checked(), true\n\n  it \"shouldn't double count dependencies\", ->\n    dep = Observable \"yo\"\n\n    o = Observable ->\n      dep()\n      dep()\n      dep()\n\n    count = 0\n    o.observe ->\n      count += 1\n\n    dep('heyy')\n\n    assert.equal count, 1\n\n  it \"should work with nested observable construction\", ->\n    gen = Observable ->\n      Observable \"Duder\"\n\n    o = gen()\n\n    assert.equal o(), \"Duder\"\n\n    o(\"wat\")\n\n    assert.equal o(), \"wat\"\n\n  describe \"Scoping\", ->\n    it \"should be scoped to optional context\", (done) ->\n      model =\n        firstName: Observable \"Duder\"\n        lastName: Observable \"Man\"\n\n      model.name = Observable ->\n        \"#{@firstName()} #{@lastName()}\"\n      , model\n\n      model.name.observe (newValue) ->\n        assert.equal newValue, \"Duder Bro\"\n\n        done()\n\n      model.lastName \"Bro\"\n\n  describe \"concat\", ->\n    it \"should work with a single observable\", ->\n      observable = Observable \"something\"\n      observableArray = Observable.concat observable\n      assert.equal observableArray.last(), \"something\"\n\n      observable \"something else\"\n      assert.equal observableArray.last(), \"something else\"\n\n    it \"should work with an undefined observable\", ->\n      observable = Observable undefined\n      observableArray = Observable.concat observable\n      assert.equal observableArray.size(), 0\n\n      observable \"defined\"\n      assert.equal observableArray.size(), 1\n\n    it \"should work with undefined\", ->\n      observableArray = Observable.concat undefined\n      assert.equal observableArray.size(), 0\n\n    it \"should work with []\", ->\n      observableArray = Observable.concat []\n      assert.equal observableArray.size(), 0\n\n    it \"should return an observable array that changes based on changes in inputs\", ->\n      numbers = Observable [1, 2, 3]\n      letters = Observable [\"a\", \"b\", \"c\"]\n      item = Observable({})\n      nullable = Observable null\n\n      observableArray = Observable.concat numbers, \"literal\", letters, item, nullable\n\n      assert.equal observableArray().length, 3 + 1 + 3 + 1\n\n      assert.equal observableArray()[0], 1\n      assert.equal observableArray()[3], \"literal\"\n      assert.equal observableArray()[4], \"a\"\n      assert.equal observableArray()[7], item()\n\n      numbers.push 4\n\n      assert.equal observableArray().length, 9\n\n      nullable \"cool\"\n\n      assert.equal observableArray().length, 10\n\n    it \"should work with observable functions that return arrays\", ->\n      item = Observable(\"wat\")\n\n      computedArray = Observable ->\n        [item()]\n\n      observableArray = Observable.concat computedArray, computedArray\n\n      assert.equal observableArray().length, 2\n\n      assert.equal observableArray()[1], \"wat\"\n\n      item \"yolo\"\n\n      assert.equal observableArray()[1], \"yolo\"\n\n    it \"should have a push method\", ->\n      observableArray = Observable.concat()\n\n      observable = Observable \"hey\"\n\n      observableArray.push observable\n\n      assert.equal observableArray()[0], \"hey\"\n\n      observable \"wat\"\n\n      assert.equal observableArray()[0], \"wat\"\n\n      observableArray.push \"cool\"\n      observableArray.push \"radical\"\n\n      assert.equal observableArray().length, 3\n\n    it \"should be observable\", (done) ->\n      observableArray = Observable.concat()\n\n      observableArray.observe (items) ->\n        assert.equal items.length, 3\n        done()\n\n      observableArray.push [\"A\", \"B\", \"C\"]\n\n    it \"should have an each method\", ->\n      observableArray = Observable.concat([\"A\", \"B\", \"C\"])\n\n      n = 0\n      observableArray.each () ->\n        n += 1\n\n      assert.equal n, 3\n\n  describe \"nesting dependencies\", ->\n    it \"should update the correct observable\", ->\n      a = Observable \"a\"\n      b = Observable \"b\"\n\n      results = Observable ->\n        r = Observable.concat()\n\n        r.push a\n        r.push b\n\n        r\n\n      # TODO: Should this just be\n      #     results.first()\n      assert.equal results().first(), \"a\"\n\n      a(\"newA\")\n\n      assert.equal results().first(), \"newA\"\n",
                  "mode": "100644",
                  "type": "blob"
                }
              },
              "distribution": {
                "main": {
                  "path": "main",
                  "content": "(function() {\n  var Observable, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat,\n    __slice = [].slice;\n\n  Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      changed();\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function(callback) {\n      magicDependency(self);\n      if (value != null) {\n        [value].forEach(function(item) {\n          return callback.call(item, item);\n        });\n      }\n      return self;\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      try {\n        Object.defineProperty(self, 'length', {\n          get: function() {\n            magicDependency(self);\n            return value.length;\n          },\n          set: function(length) {\n            value.length = length;\n            return notifyReturning(value.length);\n          }\n        });\n      } catch (_error) {}\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function(callback) {\n          self.forEach(function(item, index) {\n            return callback.call(item, item, index, self);\n          });\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          magicDependency(self);\n          return value[index];\n        },\n        first: function() {\n          magicDependency(self);\n          return value[0];\n        },\n        last: function() {\n          magicDependency(self);\n          return value[value.length - 1];\n        },\n        size: function() {\n          magicDependency(self);\n          return value.length;\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var args, o;\n    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    args = Observable(args);\n    o = Observable(function() {\n      return flatten(args.map(splat));\n    });\n    o.push = args.push;\n    return o;\n  };\n\n  module.exports = Observable;\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  magicDependency = function(self) {\n    var observerSet;\n    observerSet = last(global.OBSERVABLE_ROOT_HACK);\n    if (observerSet) {\n      return observerSet.add(self);\n    }\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    var deps, value, _ref;\n    deps = new Set;\n    global.OBSERVABLE_ROOT_HACK.push(deps);\n    try {\n      value = fn.call(context);\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n    if ((_ref = self._deps) != null) {\n      _ref.forEach(function(observable) {\n        return observable.stopObserving(update);\n      });\n    }\n    self._deps = deps;\n    deps.forEach(function(observable) {\n      return observable.observe(update);\n    });\n    return value;\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (item == null) {\n      return results;\n    }\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.3.7\"};",
                  "type": "blob"
                },
                "test/observable": {
                  "path": "test/observable",
                  "content": "(function() {\n  global.Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it(\"should not fire when setting to the same value\", function() {\n      var o;\n      o = Observable(5);\n      o.observe(function() {\n        return assert(false);\n      });\n      return o(5);\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n      it(\"should have the correct `this` scope for items\", function(done) {\n        var o;\n        o = Observable(5);\n        return o.each(function() {\n          assert.equal(this, 5);\n          return done();\n        });\n      });\n      return it(\"should have the correct `this` scope for items in observable arrays\", function() {\n        var o, scopes;\n        scopes = [];\n        o = Observable([\"I'm\", \"an\", \"array\"]);\n        o.each(function() {\n          return scopes.push(this);\n        });\n        assert.equal(scopes[0], \"I'm\");\n        assert.equal(scopes[1], \"an\");\n        return assert.equal(scopes[2], \"array\");\n      });\n    });\n    it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n    it(\"should increment\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.increment(5);\n      return assert.equal(observable(), 6);\n    });\n    it(\"should decremnet\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.decrement(5);\n      return assert.equal(observable(), -4);\n    });\n    it(\"should toggle\", function() {\n      var observable;\n      observable = Observable(false);\n      observable.toggle();\n      assert.equal(observable(), true);\n      observable.toggle();\n      return assert.equal(observable(), false);\n    });\n    it(\"should trigger when toggling\", function(done) {\n      var observable;\n      observable = Observable(true);\n      observable.observe(function(v) {\n        assert.equal(v, false);\n        return done();\n      });\n      return observable.toggle();\n    });\n    return it(\"should have a nice toString\", function() {\n      var observable;\n      observable = Observable(5);\n      return assert.equal(observable.toString(), \"Observable(5)\");\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    it(\"#remove non-existent element\", function() {\n      var o;\n      o = Observable([1, 2, 3]);\n      return assert.equal(o.remove(0), void 0);\n    });\n    it(\"should proxy the length property\", function() {\n      var called, o;\n      o = Observable([1, 2, 3]);\n      assert.equal(o.length, 3);\n      called = false;\n      o.observe(function(value) {\n        assert.equal(value[0], 1);\n        assert.equal(value[1], void 0);\n        return called = true;\n      });\n      o.length = 1;\n      assert.equal(o.length, 1);\n      return assert.equal(called, true);\n    });\n    return it(\"should auto detect conditionals of length as a dependency\", function() {\n      var called, o, observableArray;\n      observableArray = Observable([1, 2, 3]);\n      o = Observable(function() {\n        if (observableArray.length > 5) {\n          return true;\n        } else {\n          return false;\n        }\n      });\n      assert.equal(o(), false);\n      called = 0;\n      o.observe(function() {\n        return called += 1;\n      });\n      observableArray.push(4, 5, 6);\n      return assert.equal(called, 1);\n    });\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should compute array#get as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.get(0);\n      });\n      assert.equal(observableFn(), 0);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#first as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.first() + 1;\n      });\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 6);\n    });\n    it(\"should compute array#last as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.last();\n      });\n      assert.equal(observableFn(), 2);\n      observableArray.pop();\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#size as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.size() * 2;\n      });\n      assert.equal(observableFn(), 6);\n      observableArray.pop();\n      assert.equal(observableFn(), 4);\n      observableArray.shift();\n      return assert.equal(observableFn(), 2);\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should work with dynamic dependencies\", function() {\n      var dynamicObservable, observableArray;\n      observableArray = Observable([]);\n      dynamicObservable = Observable(function() {\n        return observableArray.filter(function(item) {\n          return item.age() > 3;\n        });\n      });\n      assert.equal(dynamicObservable().length, 0);\n      observableArray.push({\n        age: Observable(1)\n      });\n      observableArray()[0].age(5);\n      return assert.equal(dynamicObservable().length, 1);\n    });\n    it(\"should work with context\", function() {\n      var model;\n      model = {\n        a: Observable(\"Hello\"),\n        b: Observable(\"there\")\n      };\n      model.c = Observable(function() {\n        return \"\" + (this.a()) + \" \" + (this.b());\n      }, model);\n      assert.equal(model.c(), \"Hello there\");\n      model.b(\"world\");\n      return assert.equal(model.c(), \"Hello world\");\n    });\n    it(\"should be ok even if the function throws an exception\", function() {\n      assert.throws(function() {\n        var t;\n        return t = Observable(function() {\n          throw \"wat\";\n        });\n      });\n      return assert.equal(global.OBSERVABLE_ROOT_HACK.length, 0);\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each());\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n    it(\"should work with multiple dependencies\", function() {\n      var checked, first, letter, second;\n      letter = Observable(\"A\");\n      checked = function() {\n        var l;\n        l = letter();\n        return this.name().indexOf(l) === 0;\n      };\n      first = {\n        name: Observable(\"Andrew\")\n      };\n      first.checked = Observable(checked, first);\n      second = {\n        name: Observable(\"Benjamin\")\n      };\n      second.checked = Observable(checked, second);\n      assert.equal(first.checked(), true);\n      assert.equal(second.checked(), false);\n      assert.equal(letter.listeners.length, 2);\n      letter(\"B\");\n      assert.equal(first.checked(), false);\n      return assert.equal(second.checked(), true);\n    });\n    it(\"shouldn't double count dependencies\", function() {\n      var count, dep, o;\n      dep = Observable(\"yo\");\n      o = Observable(function() {\n        dep();\n        dep();\n        return dep();\n      });\n      count = 0;\n      o.observe(function() {\n        return count += 1;\n      });\n      dep('heyy');\n      return assert.equal(count, 1);\n    });\n    it(\"should work with nested observable construction\", function() {\n      var gen, o;\n      gen = Observable(function() {\n        return Observable(\"Duder\");\n      });\n      o = gen();\n      assert.equal(o(), \"Duder\");\n      o(\"wat\");\n      return assert.equal(o(), \"wat\");\n    });\n    describe(\"Scoping\", function() {\n      return it(\"should be scoped to optional context\", function(done) {\n        var model;\n        model = {\n          firstName: Observable(\"Duder\"),\n          lastName: Observable(\"Man\")\n        };\n        model.name = Observable(function() {\n          return \"\" + (this.firstName()) + \" \" + (this.lastName());\n        }, model);\n        model.name.observe(function(newValue) {\n          assert.equal(newValue, \"Duder Bro\");\n          return done();\n        });\n        return model.lastName(\"Bro\");\n      });\n    });\n    describe(\"concat\", function() {\n      it(\"should work with a single observable\", function() {\n        var observable, observableArray;\n        observable = Observable(\"something\");\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.last(), \"something\");\n        observable(\"something else\");\n        return assert.equal(observableArray.last(), \"something else\");\n      });\n      it(\"should work with an undefined observable\", function() {\n        var observable, observableArray;\n        observable = Observable(void 0);\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.size(), 0);\n        observable(\"defined\");\n        return assert.equal(observableArray.size(), 1);\n      });\n      it(\"should work with undefined\", function() {\n        var observableArray;\n        observableArray = Observable.concat(void 0);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should work with []\", function() {\n        var observableArray;\n        observableArray = Observable.concat([]);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should return an observable array that changes based on changes in inputs\", function() {\n        var item, letters, nullable, numbers, observableArray;\n        numbers = Observable([1, 2, 3]);\n        letters = Observable([\"a\", \"b\", \"c\"]);\n        item = Observable({});\n        nullable = Observable(null);\n        observableArray = Observable.concat(numbers, \"literal\", letters, item, nullable);\n        assert.equal(observableArray().length, 3 + 1 + 3 + 1);\n        assert.equal(observableArray()[0], 1);\n        assert.equal(observableArray()[3], \"literal\");\n        assert.equal(observableArray()[4], \"a\");\n        assert.equal(observableArray()[7], item());\n        numbers.push(4);\n        assert.equal(observableArray().length, 9);\n        nullable(\"cool\");\n        return assert.equal(observableArray().length, 10);\n      });\n      it(\"should work with observable functions that return arrays\", function() {\n        var computedArray, item, observableArray;\n        item = Observable(\"wat\");\n        computedArray = Observable(function() {\n          return [item()];\n        });\n        observableArray = Observable.concat(computedArray, computedArray);\n        assert.equal(observableArray().length, 2);\n        assert.equal(observableArray()[1], \"wat\");\n        item(\"yolo\");\n        return assert.equal(observableArray()[1], \"yolo\");\n      });\n      it(\"should have a push method\", function() {\n        var observable, observableArray;\n        observableArray = Observable.concat();\n        observable = Observable(\"hey\");\n        observableArray.push(observable);\n        assert.equal(observableArray()[0], \"hey\");\n        observable(\"wat\");\n        assert.equal(observableArray()[0], \"wat\");\n        observableArray.push(\"cool\");\n        observableArray.push(\"radical\");\n        return assert.equal(observableArray().length, 3);\n      });\n      it(\"should be observable\", function(done) {\n        var observableArray;\n        observableArray = Observable.concat();\n        observableArray.observe(function(items) {\n          assert.equal(items.length, 3);\n          return done();\n        });\n        return observableArray.push([\"A\", \"B\", \"C\"]);\n      });\n      return it(\"should have an each method\", function() {\n        var n, observableArray;\n        observableArray = Observable.concat([\"A\", \"B\", \"C\"]);\n        n = 0;\n        observableArray.each(function() {\n          return n += 1;\n        });\n        return assert.equal(n, 3);\n      });\n    });\n    return describe(\"nesting dependencies\", function() {\n      return it(\"should update the correct observable\", function() {\n        var a, b, results;\n        a = Observable(\"a\");\n        b = Observable(\"b\");\n        results = Observable(function() {\n          var r;\n          r = Observable.concat();\n          r.push(a);\n          r.push(b);\n          return r;\n        });\n        assert.equal(results().first(), \"a\");\n        a(\"newA\");\n        return assert.equal(results().first(), \"newA\");\n      });\n    });\n  });\n\n}).call(this);\n",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "https://danielx.net/editor/"
              },
              "version": "0.3.7",
              "entryPoint": "main",
              "repository": {
                "branch": "v0.3.7",
                "default_branch": "master",
                "full_name": "distri/observable",
                "homepage": "http://observable.us",
                "description": "",
                "html_url": "https://github.com/distri/observable",
                "url": "https://api.github.com/repos/distri/observable",
                "publishBranch": "gh-pages"
              },
              "dependencies": {}
            }
          }
        },
        "q": {
          "source": {
            "README.md": {
              "path": "README.md",
              "content": "q\n=\n\nPackaging q for distri\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.js": {
              "path": "main.js",
              "content": "/*!\n *\n * Copyright 2009-2012 Kris Kowal under the terms of the MIT\n * license found at http://github.com/kriskowal/q/raw/master/LICENSE\n *\n * With parts by Tyler Close\n * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found\n * at http://www.opensource.org/licenses/mit-license.html\n * Forked at ref_send.js version: 2009-05-11\n *\n * With parts by Mark Miller\n * Copyright (C) 2011 Google Inc.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n(function(a){if(typeof bootstrap===\"function\"){bootstrap(\"promise\",a)}else{if(typeof exports===\"object\"){module.exports=a()}else{if(typeof define===\"function\"&&define.amd){define(a)}else{if(typeof ses!==\"undefined\"){if(!ses.ok()){return}else{ses.makeQ=a}}else{Q=a()}}}}})(function(){var E=false;try{throw new Error()}catch(ah){E=!!ah.stack}var u=W();var j;var ad=function(){};var ai=(function(){var ap={task:void 0,next:null};var ao=ap;var ar=false;var al=void 0;var an=false;function e(){while(ap.next){ap=ap.next;var at=ap.task;ap.task=void 0;var au=ap.domain;if(au){ap.domain=void 0;au.enter()}try{at()}catch(av){if(an){if(au){au.exit()}setTimeout(e,0);if(au){au.enter()}throw av}else{setTimeout(function(){throw av},0)}}if(au){au.exit()}}ar=false}ai=function(at){ao=ao.next={task:at,domain:an&&process.domain,next:null};if(!ar){ar=true;al()}};if(typeof process!==\"undefined\"&&process.nextTick){an=true;al=function(){process.nextTick(e)}}else{if(typeof setImmediate===\"function\"){if(typeof window!==\"undefined\"){al=setImmediate.bind(window,e)}else{al=function(){setImmediate(e)}}}else{if(typeof MessageChannel!==\"undefined\"){var aq=new MessageChannel();aq.port1.onmessage=function(){al=am;aq.port1.onmessage=e;e()};var am=function(){aq.port2.postMessage(0)};al=function(){setTimeout(e,0);am()}}else{al=function(){setTimeout(e,0)}}}}return ai})();var a=Function.call;function p(e){return function(){return a.apply(e,arguments)}}var ab=p(Array.prototype.slice);var c=p(Array.prototype.reduce||function(an,am){var e=0,al=this.length;if(arguments.length===1){do{if(e in this){am=this[e++];break}if(++e>=al){throw new TypeError()}}while(1)}for(;e<al;e++){if(e in this){am=an(am,this[e],e)}}return am});var R=p(Array.prototype.indexOf||function(al){for(var e=0;e<this.length;e++){if(this[e]===al){return e}}return -1});var b=p(Array.prototype.map||function(an,al){var e=this;var am=[];c(e,function(aq,ap,ao){am.push(an.call(al,ap,ao,e))},void 0);return am});var H=Object.create||function(al){function e(){}e.prototype=al;return new e()};var A=p(Object.prototype.hasOwnProperty);var G=Object.keys||function(e){var am=[];for(var al in e){if(A(e,al)){am.push(al)}}return am};var ak=p(Object.prototype.toString);function V(e){return e===Object(e)}function w(e){return(ak(e)===\"[object StopIteration]\"||e instanceof I)}var I;if(typeof ReturnValue!==\"undefined\"){I=ReturnValue}else{I=function(e){this.value=e}}var Y=\"From previous event:\";function m(e,ao){if(E&&ao.stack&&typeof e===\"object\"&&e!==null&&e.stack&&e.stack.indexOf(Y)===-1){var am=[];for(var an=ao;!!an;an=an.source){if(an.stack){am.unshift(an.stack)}}am.unshift(e.stack);var al=am.join(\"\\n\"+Y+\"\\n\");e.stack=K(al)}}function K(an){var al=an.split(\"\\n\");var ao=[];for(var am=0;am<al.length;++am){var e=al[am];if(!g(e)&&!Z(e)&&e){ao.push(e)}}return ao.join(\"\\n\")}function Z(e){return e.indexOf(\"(module.js:\")!==-1||e.indexOf(\"(node.js:\")!==-1}function af(e){var an=/at .+ \\((.+):(\\d+):(?:\\d+)\\)$/.exec(e);if(an){return[an[1],Number(an[2])]}var am=/at ([^ ]+):(\\d+):(?:\\d+)$/.exec(e);if(am){return[am[1],Number(am[2])]}var al=/.*@(.+):(\\d+)$/.exec(e);if(al){return[al[1],Number(al[2])]}}function g(al){var am=af(al);if(!am){return false}var an=am[0];var e=am[1];return an===j&&e>=u&&e<=s}function W(){if(!E){return}try{throw new Error()}catch(ao){var al=ao.stack.split(\"\\n\");var am=al[0].indexOf(\"@\")>0?al[1]:al[2];var an=af(am);if(!an){return}j=an[0];return an[1]}}function C(am,e,al){return function(){if(typeof console!==\"undefined\"&&typeof console.warn===\"function\"){console.warn(e+\" is deprecated, use \"+al+\" instead.\",new Error(\"\").stack)}return am.apply(am,arguments)}}function l(e){if(y(e)){return e}if(M(e)){return L(e)}else{return z(e)}}l.resolve=l;l.nextTick=ai;l.longStackSupport=false;l.defer=h;function h(){var an=[],ap=[],ao;var al=H(h.prototype);var ar=H(N.prototype);ar.promiseDispatch=function(au,av,at){var e=ab(arguments);if(an){an.push(e);if(av===\"when\"&&at[1]){ap.push(at[1])}}else{ai(function(){ao.promiseDispatch.apply(ao,e)})}};ar.valueOf=function(){if(an){return ar}var e=J(ao);if(y(e)){ao=e}return e};ar.inspect=function(){if(!ao){return{state:\"pending\"}}return ao.inspect()};if(l.longStackSupport&&E){try{throw new Error()}catch(aq){ar.stack=aq.stack.substring(aq.stack.indexOf(\"\\n\")+1)}}function am(e){ao=e;ar.source=e;c(an,function(au,at){ai(function(){e.promiseDispatch.apply(e,at)})},void 0);an=void 0;ap=void 0}al.promise=ar;al.resolve=function(e){if(ao){return}am(l(e))};al.fulfill=function(e){if(ao){return}am(z(e))};al.reject=function(e){if(ao){return}am(D(e))};al.notify=function(e){if(ao){return}c(ap,function(au,at){ai(function(){at(e)})},void 0)};return al}h.prototype.makeNodeResolver=function(){var e=this;return function(al,am){if(al){e.reject(al)}else{if(arguments.length>2){e.resolve(ab(arguments,1))}else{e.resolve(am)}}}};l.Promise=T;l.promise=T;function T(am){if(typeof am!==\"function\"){throw new TypeError(\"resolver must be a function.\")}var e=h();try{am(e.resolve,e.reject,e.notify)}catch(al){e.reject(al)}return e.promise}T.race=n;T.all=x;T.reject=D;T.resolve=l;l.passByCopy=function(e){return e};N.prototype.passByCopy=function(){return this};l.join=function(e,al){return l(e).join(al)};N.prototype.join=function(e){return l([this,e]).spread(function(al,am){if(al===am){return al}else{throw new Error(\"Can't join: not the same: \"+al+\" \"+am)}})};l.race=n;function n(e){return T(function(ao,an){for(var am=0,al=e.length;am<al;am++){l(e[am]).then(ao,an)}})}N.prototype.race=function(){return this.then(l.race)};l.makePromise=N;function N(al,ao,an){if(ao===void 0){ao=function(ap){return D(new Error(\"Promise does not support operation: \"+ap))}}if(an===void 0){an=function(){return{state:\"unknown\"}}}var am=H(N.prototype);am.promiseDispatch=function(at,au,aq){var ap;try{if(al[au]){ap=al[au].apply(am,aq)}else{ap=ao.call(am,au,aq)}}catch(ar){ap=D(ar)}if(at){at(ap)}};am.inspect=an;if(an){var e=an();if(e.state===\"rejected\"){am.exception=e.reason}am.valueOf=function(){var ap=an();if(ap.state===\"pending\"||ap.state===\"rejected\"){return am}return ap.value}}return am}N.prototype.toString=function(){return\"[object Promise]\"};N.prototype.then=function(ao,ap,al){var aq=this;var ar=h();var am=false;function an(av){try{return typeof ao===\"function\"?ao(av):av}catch(au){return D(au)}}function at(au){if(typeof ap===\"function\"){m(au,aq);try{return ap(au)}catch(av){return D(av)}}return D(au)}function e(au){return typeof al===\"function\"?al(au):au}ai(function(){aq.promiseDispatch(function(au){if(am){return}am=true;ar.resolve(an(au))},\"when\",[function(au){if(am){return}am=true;ar.resolve(at(au))}])});aq.promiseDispatch(void 0,\"when\",[void 0,function(au){var aw;var ax=false;try{aw=e(au)}catch(av){ax=true;if(l.onerror){l.onerror(av)}else{throw av}}if(!ax){ar.notify(aw)}}]);return ar.promise};l.when=O;function O(am,e,al,an){return l(am).then(e,al,an)}N.prototype.thenResolve=function(e){return this.then(function(){return e})};l.thenResolve=function(al,e){return l(al).thenResolve(e)};N.prototype.thenReject=function(e){return this.then(function(){throw e})};l.thenReject=function(al,e){return l(al).thenReject(e)};l.nearer=J;function J(al){if(y(al)){var e=al.inspect();if(e.state===\"fulfilled\"){return e.value}}return al}l.isPromise=y;function y(e){return V(e)&&typeof e.promiseDispatch===\"function\"&&typeof e.inspect===\"function\"}l.isPromiseAlike=M;function M(e){return V(e)&&typeof e.then===\"function\"}l.isPending=ac;function ac(e){return y(e)&&e.inspect().state===\"pending\"}N.prototype.isPending=function(){return this.inspect().state===\"pending\"};l.isFulfilled=P;function P(e){return !y(e)||e.inspect().state===\"fulfilled\"}N.prototype.isFulfilled=function(){return this.inspect().state===\"fulfilled\"};l.isRejected=U;function U(e){return y(e)&&e.inspect().state===\"rejected\"}N.prototype.isRejected=function(){return this.inspect().state===\"rejected\"};var aa=[];var aj=[];var o=true;function ag(){aa.length=0;aj.length=0;if(!o){o=true}}function B(al,e){if(!o){return}aj.push(al);if(e&&typeof e.stack!==\"undefined\"){aa.push(e.stack)}else{aa.push(\"(no stack) \"+e)}}function k(al){if(!o){return}var e=R(aj,al);if(e!==-1){aj.splice(e,1);aa.splice(e,1)}}l.resetUnhandledRejections=ag;l.getUnhandledReasons=function(){return aa.slice()};l.stopUnhandledRejectionTracking=function(){ag();o=false};ag();l.reject=D;function D(al){var e=N({when:function(ao){if(ao){k(this)}return ao?ao(al):this}},function an(){return this},function am(){return{state:\"rejected\",reason:al}});B(e,al);return e}l.fulfill=z;function z(e){return N({when:function(){return e},get:function(am){return e[am]},set:function(am,an){e[am]=an},\"delete\":function(am){delete e[am]},post:function(an,am){if(an===null||an===void 0){return e.apply(void 0,am)}else{return e[an].apply(e,am)}},apply:function(an,am){return e.apply(an,am)},keys:function(){return G(e)}},void 0,function al(){return{state:\"fulfilled\",value:e}})}function L(al){var e=h();ai(function(){try{al.then(e.resolve,e.reject,e.notify)}catch(am){e.reject(am)}});return e.promise}l.master=v;function v(e){return N({isDef:function(){}},function al(an,am){return X(e,an,am)},function(){return l(e).inspect()})}l.spread=f;function f(am,e,al){return l(am).spread(e,al)}N.prototype.spread=function(e,al){return this.all().then(function(am){return e.apply(void 0,am)},al)};l.async=S;function S(e){return function(){function am(at,aq){var ap;if(typeof StopIteration===\"undefined\"){try{ap=an[at](aq)}catch(ar){return D(ar)}if(ap.done){return ap.value}else{return O(ap.value,ao,al)}}else{try{ap=an[at](aq)}catch(ar){if(w(ar)){return ar.value}else{return D(ar)}}return O(ap,ao,al)}}var an=e.apply(this,arguments);var ao=am.bind(am,\"next\");var al=am.bind(am,\"throw\");return ao()}}l.spawn=r;function r(e){l.done(l.async(e)())}l[\"return\"]=i;function i(e){throw new I(e)}l.promised=q;function q(e){return function(){return f([this,x(arguments)],function(al,am){return e.apply(al,am)})}}l.dispatch=X;function X(al,am,e){return l(al).dispatch(am,e)}N.prototype.dispatch=function(an,am){var al=this;var e=h();ai(function(){al.promiseDispatch(e.resolve,an,am)});return e.promise};l.get=function(e,al){return l(e).dispatch(\"get\",[al])};N.prototype.get=function(e){return this.dispatch(\"get\",[e])};l.set=function(e,al,am){return l(e).dispatch(\"set\",[al,am])};N.prototype.set=function(e,al){return this.dispatch(\"set\",[e,al])};l.del=l[\"delete\"]=function(e,al){return l(e).dispatch(\"delete\",[al])};N.prototype.del=N.prototype[\"delete\"]=function(e){return this.dispatch(\"delete\",[e])};l.mapply=l.post=function(am,al,e){return l(am).dispatch(\"post\",[al,e])};N.prototype.mapply=N.prototype.post=function(al,e){return this.dispatch(\"post\",[al,e])};l.send=l.mcall=l.invoke=function(al,e){return l(al).dispatch(\"post\",[e,ab(arguments,2)])};N.prototype.send=N.prototype.mcall=N.prototype.invoke=function(e){return this.dispatch(\"post\",[e,ab(arguments,1)])};l.fapply=function(al,e){return l(al).dispatch(\"apply\",[void 0,e])};N.prototype.fapply=function(e){return this.dispatch(\"apply\",[void 0,e])};l[\"try\"]=l.fcall=function(e){return l(e).dispatch(\"apply\",[void 0,ab(arguments,1)])};N.prototype.fcall=function(){return this.dispatch(\"apply\",[void 0,ab(arguments)])};l.fbind=function(al){var an=l(al);var e=ab(arguments,1);return function am(){return an.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};N.prototype.fbind=function(){var am=this;var e=ab(arguments);return function al(){return am.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};l.keys=function(e){return l(e).dispatch(\"keys\",[])};N.prototype.keys=function(){return this.dispatch(\"keys\",[])};l.all=x;function x(e){return O(e,function(an){var am=0;var al=h();c(an,function(ar,aq,ap){var ao;if(y(aq)&&(ao=aq.inspect()).state===\"fulfilled\"){an[ap]=ao.value}else{++am;O(aq,function(at){an[ap]=at;if(--am===0){al.resolve(an)}},al.reject,function(at){al.notify({index:ap,value:at})})}},void 0);if(am===0){al.resolve(an)}return al.promise})}N.prototype.all=function(){return x(this)};l.allResolved=C(d,\"allResolved\",\"allSettled\");function d(e){return O(e,function(al){al=b(al,l);return O(x(b(al,function(am){return O(am,ad,ad)})),function(){return al})})}N.prototype.allResolved=function(){return d(this)};l.allSettled=t;function t(e){return l(e).allSettled()}N.prototype.allSettled=function(){return this.then(function(e){return x(b(e,function(am){am=l(am);function al(){return am.inspect()}return am.then(al,al)}))})};l.fail=l[\"catch\"]=function(e,al){return l(e).then(void 0,al)};N.prototype.fail=N.prototype[\"catch\"]=function(e){return this.then(void 0,e)};l.progress=F;function F(e,al){return l(e).then(void 0,void 0,al)}N.prototype.progress=function(e){return this.then(void 0,void 0,e)};l.fin=l[\"finally\"]=function(e,al){return l(e)[\"finally\"](al)};N.prototype.fin=N.prototype[\"finally\"]=function(e){e=l(e);return this.then(function(al){return e.fcall().then(function(){return al})},function(al){return e.fcall().then(function(){throw al})})};l.done=function(am,e,an,al){return l(am).done(e,an,al)};N.prototype.done=function(e,an,am){var al=function(ap){ai(function(){m(ap,ao);if(l.onerror){l.onerror(ap)}else{throw ap}})};var ao=e||an||am?this.then(e,an,am):this;if(typeof process===\"object\"&&process&&process.domain){al=process.domain.bind(al)}ao.then(void 0,al)};l.timeout=function(al,e,am){return l(al).timeout(e,am)};N.prototype.timeout=function(al,am){var e=h();var an=setTimeout(function(){e.reject(new Error(am||\"Timed out after \"+al+\" ms\"))},al);this.then(function(ao){clearTimeout(an);e.resolve(ao)},function(ao){clearTimeout(an);e.reject(ao)},e.notify);return e.promise};l.delay=function(e,al){if(al===void 0){al=e;e=void 0}return l(e).delay(al)};N.prototype.delay=function(e){return this.then(function(am){var al=h();setTimeout(function(){al.resolve(am)},e);return al.promise})};l.nfapply=function(al,e){return l(al).nfapply(e)};N.prototype.nfapply=function(al){var e=h();var am=ab(al);am.push(e.makeNodeResolver());this.fapply(am).fail(e.reject);return e.promise};l.nfcall=function(al){var e=ab(arguments,1);return l(al).nfapply(e)};N.prototype.nfcall=function(){var al=ab(arguments);var e=h();al.push(e.makeNodeResolver());this.fapply(al).fail(e.reject);return e.promise};l.nfbind=l.denodeify=function(al){var e=ab(arguments,1);return function(){var an=e.concat(ab(arguments));var am=h();an.push(am.makeNodeResolver());l(al).fapply(an).fail(am.reject);return am.promise}};N.prototype.nfbind=N.prototype.denodeify=function(){var e=ab(arguments);e.unshift(this);return l.denodeify.apply(void 0,e)};l.nbind=function(am,e){var al=ab(arguments,2);return function(){var ap=al.concat(ab(arguments));var an=h();ap.push(an.makeNodeResolver());function ao(){return am.apply(e,arguments)}l(ao).fapply(ap).fail(an.reject);return an.promise}};N.prototype.nbind=function(){var e=ab(arguments,0);e.unshift(this);return l.nbind.apply(void 0,e)};l.nmapply=l.npost=function(am,al,e){return l(am).npost(al,e)};N.prototype.nmapply=N.prototype.npost=function(am,al){var an=ab(al||[]);var e=h();an.push(e.makeNodeResolver());this.dispatch(\"post\",[am,an]).fail(e.reject);return e.promise};l.nsend=l.nmcall=l.ninvoke=function(am,al){var an=ab(arguments,2);var e=h();an.push(e.makeNodeResolver());l(am).dispatch(\"post\",[al,an]).fail(e.reject);return e.promise};N.prototype.nsend=N.prototype.nmcall=N.prototype.ninvoke=function(al){var am=ab(arguments,1);var e=h();am.push(e.makeNodeResolver());this.dispatch(\"post\",[al,am]).fail(e.reject);return e.promise};l.nodeify=ae;function ae(al,e){return l(al).nodeify(e)}N.prototype.nodeify=function(e){if(e){this.then(function(al){ai(function(){e(null,al)})},function(al){ai(function(){e(al)})})}else{return this}};var s=W();return l});\n",
              "mode": "100644"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"1.0.1\"\n",
              "mode": "100644"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "content": "Q = require \"../main\"\n\ndescribe \"q\", ->\n  it \"should be a promise library\", (done) ->\n\n    Q(\"wat\").then (value) ->\n      assert.equal value, \"wat\"\n      done()\n    .done()\n",
              "mode": "100644"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "/*!\n *\n * Copyright 2009-2012 Kris Kowal under the terms of the MIT\n * license found at http://github.com/kriskowal/q/raw/master/LICENSE\n *\n * With parts by Tyler Close\n * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found\n * at http://www.opensource.org/licenses/mit-license.html\n * Forked at ref_send.js version: 2009-05-11\n *\n * With parts by Mark Miller\n * Copyright (C) 2011 Google Inc.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n(function(a){if(typeof bootstrap===\"function\"){bootstrap(\"promise\",a)}else{if(typeof exports===\"object\"){module.exports=a()}else{if(typeof define===\"function\"&&define.amd){define(a)}else{if(typeof ses!==\"undefined\"){if(!ses.ok()){return}else{ses.makeQ=a}}else{Q=a()}}}}})(function(){var E=false;try{throw new Error()}catch(ah){E=!!ah.stack}var u=W();var j;var ad=function(){};var ai=(function(){var ap={task:void 0,next:null};var ao=ap;var ar=false;var al=void 0;var an=false;function e(){while(ap.next){ap=ap.next;var at=ap.task;ap.task=void 0;var au=ap.domain;if(au){ap.domain=void 0;au.enter()}try{at()}catch(av){if(an){if(au){au.exit()}setTimeout(e,0);if(au){au.enter()}throw av}else{setTimeout(function(){throw av},0)}}if(au){au.exit()}}ar=false}ai=function(at){ao=ao.next={task:at,domain:an&&process.domain,next:null};if(!ar){ar=true;al()}};if(typeof process!==\"undefined\"&&process.nextTick){an=true;al=function(){process.nextTick(e)}}else{if(typeof setImmediate===\"function\"){if(typeof window!==\"undefined\"){al=setImmediate.bind(window,e)}else{al=function(){setImmediate(e)}}}else{if(typeof MessageChannel!==\"undefined\"){var aq=new MessageChannel();aq.port1.onmessage=function(){al=am;aq.port1.onmessage=e;e()};var am=function(){aq.port2.postMessage(0)};al=function(){setTimeout(e,0);am()}}else{al=function(){setTimeout(e,0)}}}}return ai})();var a=Function.call;function p(e){return function(){return a.apply(e,arguments)}}var ab=p(Array.prototype.slice);var c=p(Array.prototype.reduce||function(an,am){var e=0,al=this.length;if(arguments.length===1){do{if(e in this){am=this[e++];break}if(++e>=al){throw new TypeError()}}while(1)}for(;e<al;e++){if(e in this){am=an(am,this[e],e)}}return am});var R=p(Array.prototype.indexOf||function(al){for(var e=0;e<this.length;e++){if(this[e]===al){return e}}return -1});var b=p(Array.prototype.map||function(an,al){var e=this;var am=[];c(e,function(aq,ap,ao){am.push(an.call(al,ap,ao,e))},void 0);return am});var H=Object.create||function(al){function e(){}e.prototype=al;return new e()};var A=p(Object.prototype.hasOwnProperty);var G=Object.keys||function(e){var am=[];for(var al in e){if(A(e,al)){am.push(al)}}return am};var ak=p(Object.prototype.toString);function V(e){return e===Object(e)}function w(e){return(ak(e)===\"[object StopIteration]\"||e instanceof I)}var I;if(typeof ReturnValue!==\"undefined\"){I=ReturnValue}else{I=function(e){this.value=e}}var Y=\"From previous event:\";function m(e,ao){if(E&&ao.stack&&typeof e===\"object\"&&e!==null&&e.stack&&e.stack.indexOf(Y)===-1){var am=[];for(var an=ao;!!an;an=an.source){if(an.stack){am.unshift(an.stack)}}am.unshift(e.stack);var al=am.join(\"\\n\"+Y+\"\\n\");e.stack=K(al)}}function K(an){var al=an.split(\"\\n\");var ao=[];for(var am=0;am<al.length;++am){var e=al[am];if(!g(e)&&!Z(e)&&e){ao.push(e)}}return ao.join(\"\\n\")}function Z(e){return e.indexOf(\"(module.js:\")!==-1||e.indexOf(\"(node.js:\")!==-1}function af(e){var an=/at .+ \\((.+):(\\d+):(?:\\d+)\\)$/.exec(e);if(an){return[an[1],Number(an[2])]}var am=/at ([^ ]+):(\\d+):(?:\\d+)$/.exec(e);if(am){return[am[1],Number(am[2])]}var al=/.*@(.+):(\\d+)$/.exec(e);if(al){return[al[1],Number(al[2])]}}function g(al){var am=af(al);if(!am){return false}var an=am[0];var e=am[1];return an===j&&e>=u&&e<=s}function W(){if(!E){return}try{throw new Error()}catch(ao){var al=ao.stack.split(\"\\n\");var am=al[0].indexOf(\"@\")>0?al[1]:al[2];var an=af(am);if(!an){return}j=an[0];return an[1]}}function C(am,e,al){return function(){if(typeof console!==\"undefined\"&&typeof console.warn===\"function\"){console.warn(e+\" is deprecated, use \"+al+\" instead.\",new Error(\"\").stack)}return am.apply(am,arguments)}}function l(e){if(y(e)){return e}if(M(e)){return L(e)}else{return z(e)}}l.resolve=l;l.nextTick=ai;l.longStackSupport=false;l.defer=h;function h(){var an=[],ap=[],ao;var al=H(h.prototype);var ar=H(N.prototype);ar.promiseDispatch=function(au,av,at){var e=ab(arguments);if(an){an.push(e);if(av===\"when\"&&at[1]){ap.push(at[1])}}else{ai(function(){ao.promiseDispatch.apply(ao,e)})}};ar.valueOf=function(){if(an){return ar}var e=J(ao);if(y(e)){ao=e}return e};ar.inspect=function(){if(!ao){return{state:\"pending\"}}return ao.inspect()};if(l.longStackSupport&&E){try{throw new Error()}catch(aq){ar.stack=aq.stack.substring(aq.stack.indexOf(\"\\n\")+1)}}function am(e){ao=e;ar.source=e;c(an,function(au,at){ai(function(){e.promiseDispatch.apply(e,at)})},void 0);an=void 0;ap=void 0}al.promise=ar;al.resolve=function(e){if(ao){return}am(l(e))};al.fulfill=function(e){if(ao){return}am(z(e))};al.reject=function(e){if(ao){return}am(D(e))};al.notify=function(e){if(ao){return}c(ap,function(au,at){ai(function(){at(e)})},void 0)};return al}h.prototype.makeNodeResolver=function(){var e=this;return function(al,am){if(al){e.reject(al)}else{if(arguments.length>2){e.resolve(ab(arguments,1))}else{e.resolve(am)}}}};l.Promise=T;l.promise=T;function T(am){if(typeof am!==\"function\"){throw new TypeError(\"resolver must be a function.\")}var e=h();try{am(e.resolve,e.reject,e.notify)}catch(al){e.reject(al)}return e.promise}T.race=n;T.all=x;T.reject=D;T.resolve=l;l.passByCopy=function(e){return e};N.prototype.passByCopy=function(){return this};l.join=function(e,al){return l(e).join(al)};N.prototype.join=function(e){return l([this,e]).spread(function(al,am){if(al===am){return al}else{throw new Error(\"Can't join: not the same: \"+al+\" \"+am)}})};l.race=n;function n(e){return T(function(ao,an){for(var am=0,al=e.length;am<al;am++){l(e[am]).then(ao,an)}})}N.prototype.race=function(){return this.then(l.race)};l.makePromise=N;function N(al,ao,an){if(ao===void 0){ao=function(ap){return D(new Error(\"Promise does not support operation: \"+ap))}}if(an===void 0){an=function(){return{state:\"unknown\"}}}var am=H(N.prototype);am.promiseDispatch=function(at,au,aq){var ap;try{if(al[au]){ap=al[au].apply(am,aq)}else{ap=ao.call(am,au,aq)}}catch(ar){ap=D(ar)}if(at){at(ap)}};am.inspect=an;if(an){var e=an();if(e.state===\"rejected\"){am.exception=e.reason}am.valueOf=function(){var ap=an();if(ap.state===\"pending\"||ap.state===\"rejected\"){return am}return ap.value}}return am}N.prototype.toString=function(){return\"[object Promise]\"};N.prototype.then=function(ao,ap,al){var aq=this;var ar=h();var am=false;function an(av){try{return typeof ao===\"function\"?ao(av):av}catch(au){return D(au)}}function at(au){if(typeof ap===\"function\"){m(au,aq);try{return ap(au)}catch(av){return D(av)}}return D(au)}function e(au){return typeof al===\"function\"?al(au):au}ai(function(){aq.promiseDispatch(function(au){if(am){return}am=true;ar.resolve(an(au))},\"when\",[function(au){if(am){return}am=true;ar.resolve(at(au))}])});aq.promiseDispatch(void 0,\"when\",[void 0,function(au){var aw;var ax=false;try{aw=e(au)}catch(av){ax=true;if(l.onerror){l.onerror(av)}else{throw av}}if(!ax){ar.notify(aw)}}]);return ar.promise};l.when=O;function O(am,e,al,an){return l(am).then(e,al,an)}N.prototype.thenResolve=function(e){return this.then(function(){return e})};l.thenResolve=function(al,e){return l(al).thenResolve(e)};N.prototype.thenReject=function(e){return this.then(function(){throw e})};l.thenReject=function(al,e){return l(al).thenReject(e)};l.nearer=J;function J(al){if(y(al)){var e=al.inspect();if(e.state===\"fulfilled\"){return e.value}}return al}l.isPromise=y;function y(e){return V(e)&&typeof e.promiseDispatch===\"function\"&&typeof e.inspect===\"function\"}l.isPromiseAlike=M;function M(e){return V(e)&&typeof e.then===\"function\"}l.isPending=ac;function ac(e){return y(e)&&e.inspect().state===\"pending\"}N.prototype.isPending=function(){return this.inspect().state===\"pending\"};l.isFulfilled=P;function P(e){return !y(e)||e.inspect().state===\"fulfilled\"}N.prototype.isFulfilled=function(){return this.inspect().state===\"fulfilled\"};l.isRejected=U;function U(e){return y(e)&&e.inspect().state===\"rejected\"}N.prototype.isRejected=function(){return this.inspect().state===\"rejected\"};var aa=[];var aj=[];var o=true;function ag(){aa.length=0;aj.length=0;if(!o){o=true}}function B(al,e){if(!o){return}aj.push(al);if(e&&typeof e.stack!==\"undefined\"){aa.push(e.stack)}else{aa.push(\"(no stack) \"+e)}}function k(al){if(!o){return}var e=R(aj,al);if(e!==-1){aj.splice(e,1);aa.splice(e,1)}}l.resetUnhandledRejections=ag;l.getUnhandledReasons=function(){return aa.slice()};l.stopUnhandledRejectionTracking=function(){ag();o=false};ag();l.reject=D;function D(al){var e=N({when:function(ao){if(ao){k(this)}return ao?ao(al):this}},function an(){return this},function am(){return{state:\"rejected\",reason:al}});B(e,al);return e}l.fulfill=z;function z(e){return N({when:function(){return e},get:function(am){return e[am]},set:function(am,an){e[am]=an},\"delete\":function(am){delete e[am]},post:function(an,am){if(an===null||an===void 0){return e.apply(void 0,am)}else{return e[an].apply(e,am)}},apply:function(an,am){return e.apply(an,am)},keys:function(){return G(e)}},void 0,function al(){return{state:\"fulfilled\",value:e}})}function L(al){var e=h();ai(function(){try{al.then(e.resolve,e.reject,e.notify)}catch(am){e.reject(am)}});return e.promise}l.master=v;function v(e){return N({isDef:function(){}},function al(an,am){return X(e,an,am)},function(){return l(e).inspect()})}l.spread=f;function f(am,e,al){return l(am).spread(e,al)}N.prototype.spread=function(e,al){return this.all().then(function(am){return e.apply(void 0,am)},al)};l.async=S;function S(e){return function(){function am(at,aq){var ap;if(typeof StopIteration===\"undefined\"){try{ap=an[at](aq)}catch(ar){return D(ar)}if(ap.done){return ap.value}else{return O(ap.value,ao,al)}}else{try{ap=an[at](aq)}catch(ar){if(w(ar)){return ar.value}else{return D(ar)}}return O(ap,ao,al)}}var an=e.apply(this,arguments);var ao=am.bind(am,\"next\");var al=am.bind(am,\"throw\");return ao()}}l.spawn=r;function r(e){l.done(l.async(e)())}l[\"return\"]=i;function i(e){throw new I(e)}l.promised=q;function q(e){return function(){return f([this,x(arguments)],function(al,am){return e.apply(al,am)})}}l.dispatch=X;function X(al,am,e){return l(al).dispatch(am,e)}N.prototype.dispatch=function(an,am){var al=this;var e=h();ai(function(){al.promiseDispatch(e.resolve,an,am)});return e.promise};l.get=function(e,al){return l(e).dispatch(\"get\",[al])};N.prototype.get=function(e){return this.dispatch(\"get\",[e])};l.set=function(e,al,am){return l(e).dispatch(\"set\",[al,am])};N.prototype.set=function(e,al){return this.dispatch(\"set\",[e,al])};l.del=l[\"delete\"]=function(e,al){return l(e).dispatch(\"delete\",[al])};N.prototype.del=N.prototype[\"delete\"]=function(e){return this.dispatch(\"delete\",[e])};l.mapply=l.post=function(am,al,e){return l(am).dispatch(\"post\",[al,e])};N.prototype.mapply=N.prototype.post=function(al,e){return this.dispatch(\"post\",[al,e])};l.send=l.mcall=l.invoke=function(al,e){return l(al).dispatch(\"post\",[e,ab(arguments,2)])};N.prototype.send=N.prototype.mcall=N.prototype.invoke=function(e){return this.dispatch(\"post\",[e,ab(arguments,1)])};l.fapply=function(al,e){return l(al).dispatch(\"apply\",[void 0,e])};N.prototype.fapply=function(e){return this.dispatch(\"apply\",[void 0,e])};l[\"try\"]=l.fcall=function(e){return l(e).dispatch(\"apply\",[void 0,ab(arguments,1)])};N.prototype.fcall=function(){return this.dispatch(\"apply\",[void 0,ab(arguments)])};l.fbind=function(al){var an=l(al);var e=ab(arguments,1);return function am(){return an.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};N.prototype.fbind=function(){var am=this;var e=ab(arguments);return function al(){return am.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};l.keys=function(e){return l(e).dispatch(\"keys\",[])};N.prototype.keys=function(){return this.dispatch(\"keys\",[])};l.all=x;function x(e){return O(e,function(an){var am=0;var al=h();c(an,function(ar,aq,ap){var ao;if(y(aq)&&(ao=aq.inspect()).state===\"fulfilled\"){an[ap]=ao.value}else{++am;O(aq,function(at){an[ap]=at;if(--am===0){al.resolve(an)}},al.reject,function(at){al.notify({index:ap,value:at})})}},void 0);if(am===0){al.resolve(an)}return al.promise})}N.prototype.all=function(){return x(this)};l.allResolved=C(d,\"allResolved\",\"allSettled\");function d(e){return O(e,function(al){al=b(al,l);return O(x(b(al,function(am){return O(am,ad,ad)})),function(){return al})})}N.prototype.allResolved=function(){return d(this)};l.allSettled=t;function t(e){return l(e).allSettled()}N.prototype.allSettled=function(){return this.then(function(e){return x(b(e,function(am){am=l(am);function al(){return am.inspect()}return am.then(al,al)}))})};l.fail=l[\"catch\"]=function(e,al){return l(e).then(void 0,al)};N.prototype.fail=N.prototype[\"catch\"]=function(e){return this.then(void 0,e)};l.progress=F;function F(e,al){return l(e).then(void 0,void 0,al)}N.prototype.progress=function(e){return this.then(void 0,void 0,e)};l.fin=l[\"finally\"]=function(e,al){return l(e)[\"finally\"](al)};N.prototype.fin=N.prototype[\"finally\"]=function(e){e=l(e);return this.then(function(al){return e.fcall().then(function(){return al})},function(al){return e.fcall().then(function(){throw al})})};l.done=function(am,e,an,al){return l(am).done(e,an,al)};N.prototype.done=function(e,an,am){var al=function(ap){ai(function(){m(ap,ao);if(l.onerror){l.onerror(ap)}else{throw ap}})};var ao=e||an||am?this.then(e,an,am):this;if(typeof process===\"object\"&&process&&process.domain){al=process.domain.bind(al)}ao.then(void 0,al)};l.timeout=function(al,e,am){return l(al).timeout(e,am)};N.prototype.timeout=function(al,am){var e=h();var an=setTimeout(function(){e.reject(new Error(am||\"Timed out after \"+al+\" ms\"))},al);this.then(function(ao){clearTimeout(an);e.resolve(ao)},function(ao){clearTimeout(an);e.reject(ao)},e.notify);return e.promise};l.delay=function(e,al){if(al===void 0){al=e;e=void 0}return l(e).delay(al)};N.prototype.delay=function(e){return this.then(function(am){var al=h();setTimeout(function(){al.resolve(am)},e);return al.promise})};l.nfapply=function(al,e){return l(al).nfapply(e)};N.prototype.nfapply=function(al){var e=h();var am=ab(al);am.push(e.makeNodeResolver());this.fapply(am).fail(e.reject);return e.promise};l.nfcall=function(al){var e=ab(arguments,1);return l(al).nfapply(e)};N.prototype.nfcall=function(){var al=ab(arguments);var e=h();al.push(e.makeNodeResolver());this.fapply(al).fail(e.reject);return e.promise};l.nfbind=l.denodeify=function(al){var e=ab(arguments,1);return function(){var an=e.concat(ab(arguments));var am=h();an.push(am.makeNodeResolver());l(al).fapply(an).fail(am.reject);return am.promise}};N.prototype.nfbind=N.prototype.denodeify=function(){var e=ab(arguments);e.unshift(this);return l.denodeify.apply(void 0,e)};l.nbind=function(am,e){var al=ab(arguments,2);return function(){var ap=al.concat(ab(arguments));var an=h();ap.push(an.makeNodeResolver());function ao(){return am.apply(e,arguments)}l(ao).fapply(ap).fail(an.reject);return an.promise}};N.prototype.nbind=function(){var e=ab(arguments,0);e.unshift(this);return l.nbind.apply(void 0,e)};l.nmapply=l.npost=function(am,al,e){return l(am).npost(al,e)};N.prototype.nmapply=N.prototype.npost=function(am,al){var an=ab(al||[]);var e=h();an.push(e.makeNodeResolver());this.dispatch(\"post\",[am,an]).fail(e.reject);return e.promise};l.nsend=l.nmcall=l.ninvoke=function(am,al){var an=ab(arguments,2);var e=h();an.push(e.makeNodeResolver());l(am).dispatch(\"post\",[al,an]).fail(e.reject);return e.promise};N.prototype.nsend=N.prototype.nmcall=N.prototype.ninvoke=function(al){var am=ab(arguments,1);var e=h();am.push(e.makeNodeResolver());this.dispatch(\"post\",[al,am]).fail(e.reject);return e.promise};l.nodeify=ae;function ae(al,e){return l(al).nodeify(e)}N.prototype.nodeify=function(e){if(e){this.then(function(al){ai(function(){e(null,al)})},function(al){ai(function(){e(al)})})}else{return this}};var s=W();return l});\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"1.0.1\"};",
              "type": "blob"
            },
            "test/test": {
              "path": "test/test",
              "content": "(function() {\n  var Q;\n\n  Q = require(\"../main\");\n\n  describe(\"q\", function() {\n    return it(\"should be a promise library\", function(done) {\n      return Q(\"wat\").then(function(value) {\n        assert.equal(value, \"wat\");\n        return done();\n      }).done();\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://www.danielx.net/editor/"
          },
          "version": "1.0.1",
          "entryPoint": "main",
          "repository": {
            "branch": "v1.0.1",
            "default_branch": "master",
            "full_name": "distri/q",
            "homepage": null,
            "description": "Packaging q for distri",
            "html_url": "https://github.com/distri/q",
            "url": "https://api.github.com/repos/distri/q",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "util": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "util\n====\n\nSmall utility methods for JS\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "Util\n====\n\n    module.exports =\n      approach: (current, target, amount) ->\n        (target - current).clamp(-amount, amount) + current\n\nApply a stylesheet idempotently.\n\n      applyStylesheet: (style, id=\"primary\") ->\n        styleNode = document.createElement(\"style\")\n        styleNode.innerHTML = style\n        styleNode.id = id\n\n        if previousStyleNode = document.head.querySelector(\"style##{id}\")\n          previousStyleNode.parentNode.removeChild(prevousStyleNode)\n\n        document.head.appendChild(styleNode)\n\n      defaults: (target, objects...) ->\n        for object in objects\n          for name of object\n            unless target.hasOwnProperty(name)\n              target[name] = object[name]\n\n        return target\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.1.0\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    approach: function(current, target, amount) {\n      return (target - current).clamp(-amount, amount) + current;\n    },\n    applyStylesheet: function(style, id) {\n      var previousStyleNode, styleNode;\n      if (id == null) {\n        id = \"primary\";\n      }\n      styleNode = document.createElement(\"style\");\n      styleNode.innerHTML = style;\n      styleNode.id = id;\n      if (previousStyleNode = document.head.querySelector(\"style#\" + id)) {\n        previousStyleNode.parentNode.removeChild(prevousStyleNode);\n      }\n      return document.head.appendChild(styleNode);\n    },\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.1.0\"};",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.0",
          "entryPoint": "main",
          "repository": {
            "id": 18501018,
            "name": "util",
            "full_name": "distri/util",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/util",
            "description": "Small utility methods for JS",
            "fork": false,
            "url": "https://api.github.com/repos/distri/util",
            "forks_url": "https://api.github.com/repos/distri/util/forks",
            "keys_url": "https://api.github.com/repos/distri/util/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/util/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/util/teams",
            "hooks_url": "https://api.github.com/repos/distri/util/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/util/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/util/events",
            "assignees_url": "https://api.github.com/repos/distri/util/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/util/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/util/tags",
            "blobs_url": "https://api.github.com/repos/distri/util/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/util/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/util/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/util/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/util/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/util/languages",
            "stargazers_url": "https://api.github.com/repos/distri/util/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/util/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/util/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/util/subscription",
            "commits_url": "https://api.github.com/repos/distri/util/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/util/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/util/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/util/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/util/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/util/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/util/merges",
            "archive_url": "https://api.github.com/repos/distri/util/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/util/downloads",
            "issues_url": "https://api.github.com/repos/distri/util/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/util/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/util/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/util/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/util/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/util/releases{/id}",
            "created_at": "2014-04-06T22:42:56Z",
            "updated_at": "2014-04-06T22:42:56Z",
            "pushed_at": "2014-04-06T22:42:56Z",
            "git_url": "git://github.com/distri/util.git",
            "ssh_url": "git@github.com:distri/util.git",
            "clone_url": "https://github.com/distri/util.git",
            "svn_url": "https://github.com/distri/util",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.0",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    },
    "hotkeys": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "hotkeys\n=======\n\nHotkeys module for editors\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Hotkeys\n=======\n\nHotkeys module for the editors.\n\n    module.exports = (I={}, self=Core(I)) ->\n      self.extend\n        addHotkey: (key, method) ->\n          $(document).bind \"keydown\", key, (event) ->\n            if typeof method is \"function\"\n              method\n                editor: self\n            else\n              self[method]()\n\n            event.preventDefault()\n\n      return self\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n  \"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"\n]\n",
          "type": "blob"
        },
        "test/hotkeys.coffee": {
          "path": "test/hotkeys.coffee",
          "mode": "100644",
          "content": "Hotkeys = require \"../main\"\n\ndescribe \"hotkeys\", ->\n  it \"should be hot\", (done) ->\n    hotkeys = Hotkeys()\n    \n    hotkeys.addHotkey \"a\", ->\n      done()\n\n    $(document).trigger $.Event \"keydown\",\n      which: 65 # a\n      keyCode: 65\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      addHotkey: function(key, method) {\n        return $(document).bind(\"keydown\", key, function(event) {\n          if (typeof method === \"function\") {\n            method({\n              editor: self\n            });\n          } else {\n            self[method]();\n          }\n          return event.preventDefault();\n        });\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\",\"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"]};",
          "type": "blob"
        },
        "test/hotkeys": {
          "path": "test/hotkeys",
          "content": "(function() {\n  var Hotkeys;\n\n  Hotkeys = require(\"../main\");\n\n  describe(\"hotkeys\", function() {\n    return it(\"should be hot\", function(done) {\n      var hotkeys;\n      hotkeys = Hotkeys();\n      hotkeys.addHotkey(\"a\", function() {\n        return done();\n      });\n      return $(document).trigger($.Event(\"keydown\", {\n        which: 65,\n        keyCode: 65\n      }));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/hotkeys.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "//code.jquery.com/jquery-1.10.1.min.js",
        "http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js"
      ],
      "repository": {
        "id": 14673639,
        "name": "hotkeys",
        "full_name": "distri/hotkeys",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/hotkeys",
        "description": "Hotkeys module for editors",
        "fork": false,
        "url": "https://api.github.com/repos/distri/hotkeys",
        "forks_url": "https://api.github.com/repos/distri/hotkeys/forks",
        "keys_url": "https://api.github.com/repos/distri/hotkeys/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/hotkeys/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/hotkeys/teams",
        "hooks_url": "https://api.github.com/repos/distri/hotkeys/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/hotkeys/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/hotkeys/events",
        "assignees_url": "https://api.github.com/repos/distri/hotkeys/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/hotkeys/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/hotkeys/tags",
        "blobs_url": "https://api.github.com/repos/distri/hotkeys/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/hotkeys/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/hotkeys/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/hotkeys/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/hotkeys/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/hotkeys/languages",
        "stargazers_url": "https://api.github.com/repos/distri/hotkeys/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/hotkeys/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/hotkeys/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/hotkeys/subscription",
        "commits_url": "https://api.github.com/repos/distri/hotkeys/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/hotkeys/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/hotkeys/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/hotkeys/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/hotkeys/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/hotkeys/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/hotkeys/merges",
        "archive_url": "https://api.github.com/repos/distri/hotkeys/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/hotkeys/downloads",
        "issues_url": "https://api.github.com/repos/distri/hotkeys/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/hotkeys/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/hotkeys/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/hotkeys/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/hotkeys/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/hotkeys/releases{/id}",
        "created_at": "2013-11-25T01:55:42Z",
        "updated_at": "2013-11-25T02:03:57Z",
        "pushed_at": "2013-11-25T02:03:56Z",
        "git_url": "git://github.com/distri/hotkeys.git",
        "ssh_url": "git@github.com:distri/hotkeys.git",
        "clone_url": "https://github.com/distri/hotkeys.git",
        "svn_url": "https://github.com/distri/hotkeys",
        "homepage": null,
        "size": 264,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "jquery-utils": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "jquery-utils\n============\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "    require \"hotkeys\"\n    require \"image-reader\"\n    require \"./take_class\"\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\ndependencies:\n  hotkeys: \"distri/jquery-hotkeys:v0.9.2\"\n  \"image-reader\": \"distri/jquery-image_reader:v0.2.0\"\n",
          "type": "blob"
        },
        "take_class.coffee.md": {
          "path": "take_class.coffee.md",
          "mode": "100644",
          "content": "Take Class\n==========\n\nTake the named class from all the sibling elements. Perfect for something like\nradio buttons.\n\n    (($) ->\n      $.fn.takeClass = (name) ->\n        @addClass(name).siblings().removeClass(name)\n\n        return this\n    )(jQuery)\n",
          "type": "blob"
        },
        "test/image_reader.coffee": {
          "path": "test/image_reader.coffee",
          "mode": "100644",
          "content": "require \"../main\"\n\ndescribe \"jQuery#pasteImageReader\", ->\n  it \"should exist\", ->\n    assert $.fn.pasteImageReader\n\ndescribe \"jQuery#dropImageReader\", ->\n  it \"should exist\", ->\n    assert $.fn.dropImageReader\n",
          "type": "blob"
        },
        "test/take_class.coffee": {
          "path": "test/take_class.coffee",
          "mode": "100644",
          "content": "require \"../main\"\n\ndescribe \"jQuery#takeClass\", ->\n  it \"should exist\", ->\n    assert $.fn.takeClass\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  require(\"hotkeys\");\n\n  require(\"image-reader\");\n\n  require(\"./take_class\");\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"],\"dependencies\":{\"hotkeys\":\"distri/jquery-hotkeys:v0.9.2\",\"image-reader\":\"distri/jquery-image_reader:v0.2.0\"}};",
          "type": "blob"
        },
        "take_class": {
          "path": "take_class",
          "content": "(function() {\n  (function($) {\n    return $.fn.takeClass = function(name) {\n      this.addClass(name).siblings().removeClass(name);\n      return this;\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=take_class.coffee",
          "type": "blob"
        },
        "test/image_reader": {
          "path": "test/image_reader",
          "content": "(function() {\n  require(\"../main\");\n\n  describe(\"jQuery#pasteImageReader\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.pasteImageReader);\n    });\n  });\n\n  describe(\"jQuery#dropImageReader\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.dropImageReader);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/image_reader.coffee",
          "type": "blob"
        },
        "test/take_class": {
          "path": "test/take_class",
          "content": "(function() {\n  require(\"../main\");\n\n  describe(\"jQuery#takeClass\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.takeClass);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/take_class.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "//code.jquery.com/jquery-1.10.1.min.js"
      ],
      "repository": {
        "id": 13183366,
        "name": "jquery-utils",
        "full_name": "distri/jquery-utils",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/jquery-utils",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/distri/jquery-utils",
        "forks_url": "https://api.github.com/repos/distri/jquery-utils/forks",
        "keys_url": "https://api.github.com/repos/distri/jquery-utils/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/jquery-utils/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/jquery-utils/teams",
        "hooks_url": "https://api.github.com/repos/distri/jquery-utils/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/jquery-utils/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/jquery-utils/events",
        "assignees_url": "https://api.github.com/repos/distri/jquery-utils/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/jquery-utils/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/jquery-utils/tags",
        "blobs_url": "https://api.github.com/repos/distri/jquery-utils/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/jquery-utils/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/jquery-utils/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/jquery-utils/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/jquery-utils/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/jquery-utils/languages",
        "stargazers_url": "https://api.github.com/repos/distri/jquery-utils/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/jquery-utils/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/jquery-utils/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/jquery-utils/subscription",
        "commits_url": "https://api.github.com/repos/distri/jquery-utils/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/jquery-utils/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/jquery-utils/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/jquery-utils/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/jquery-utils/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/jquery-utils/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/jquery-utils/merges",
        "archive_url": "https://api.github.com/repos/distri/jquery-utils/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/jquery-utils/downloads",
        "issues_url": "https://api.github.com/repos/distri/jquery-utils/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/jquery-utils/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/jquery-utils/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/jquery-utils/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/jquery-utils/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/jquery-utils/releases{/id}",
        "created_at": "2013-09-29T00:25:09Z",
        "updated_at": "2013-11-29T20:57:42Z",
        "pushed_at": "2013-10-25T17:28:57Z",
        "git_url": "git://github.com/distri/jquery-utils.git",
        "ssh_url": "git@github.com:distri/jquery-utils.git",
        "clone_url": "https://github.com/distri/jquery-utils.git",
        "svn_url": "https://github.com/distri/jquery-utils",
        "homepage": null,
        "size": 592,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "hotkeys": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "jquery.hotkeys\n==============\n\njQuery hotkeys plugin\n",
              "type": "blob"
            },
            "hotkeys.coffee.md": {
              "path": "hotkeys.coffee.md",
              "mode": "100644",
              "content": "jQuery Hotkeys Plugin\n=====================\n\nCopyright 2010, John Resig\nDual licensed under the MIT or GPL Version 2 licenses.\n\nBased upon the plugin by Tzury Bar Yochay:\nhttp://github.com/tzuryby/hotkeys\n\nOriginal idea by:\nBinny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/\n\n    if jQuery?\n      ((jQuery) ->\n        isTextAcceptingInput = (element) ->\n          /textarea|select/i.test(element.nodeName) or element.type is \"text\" or element.type is \"password\"\n\n        isFunctionKey = (event) ->\n          (event.type != \"keypress\") && (112 <= event.which <= 123)\n\n        jQuery.hotkeys =\n          version: \"0.9.0\"\n\n          specialKeys:\n            8: \"backspace\"\n            9: \"tab\"\n            13: \"return\"\n            16: \"shift\"\n            17: \"ctrl\"\n            18: \"alt\"\n            19: \"pause\"\n            20: \"capslock\"\n            27: \"esc\"\n            32: \"space\"\n            33: \"pageup\"\n            34: \"pagedown\"\n            35: \"end\"\n            36: \"home\"\n            37: \"left\"\n            38: \"up\"\n            39: \"right\"\n            40: \"down\"\n            45: \"insert\"\n            46: \"del\"\n            96: \"0\"\n            97: \"1\"\n            98: \"2\"\n            99: \"3\"\n            100: \"4\"\n            101: \"5\"\n            102: \"6\"\n            103: \"7\"\n            104: \"8\"\n            105: \"9\"\n            106: \"*\"\n            107: \"+\"\n            109: \"-\"\n            110: \".\"\n            111 : \"/\"\n            112: \"f1\"\n            113: \"f2\"\n            114: \"f3\"\n            115: \"f4\"\n            116: \"f5\"\n            117: \"f6\"\n            118: \"f7\"\n            119: \"f8\"\n            120: \"f9\"\n            121: \"f10\"\n            122: \"f11\"\n            123: \"f12\"\n            144: \"numlock\"\n            145: \"scroll\"\n            186: \";\"\n            187: \"=\"\n            188: \",\"\n            189: \"-\"\n            190: \".\"\n            191: \"/\"\n            219: \"[\"\n            220: \"\\\\\"\n            221: \"]\"\n            222: \"'\"\n            224: \"meta\"\n\n          shiftNums:\n            \"`\": \"~\"\n            \"1\": \"!\"\n            \"2\": \"@\"\n            \"3\": \"#\"\n            \"4\": \"$\"\n            \"5\": \"%\"\n            \"6\": \"^\"\n            \"7\": \"&\"\n            \"8\": \"*\"\n            \"9\": \"(\"\n            \"0\": \")\"\n            \"-\": \"_\"\n            \"=\": \"+\"\n            \";\": \":\"\n            \"'\": \"\\\"\"\n            \",\": \"<\"\n            \".\": \">\"\n            \"/\": \"?\"\n            \"\\\\\": \"|\"\n\n        keyHandler = (handleObj) ->\n          # Only care when a possible input has been specified\n          if typeof handleObj.data != \"string\"\n            return\n\n          origHandler = handleObj.handler\n          keys = handleObj.data.toLowerCase().split(\" \")\n\n          handleObj.handler = (event) ->\n            # Keypress represents characters, not special keys\n            special = event.type != \"keypress\" && jQuery.hotkeys.specialKeys[ event.which ]\n            character = String.fromCharCode( event.which ).toLowerCase()\n            modif = \"\"\n            possible = {}\n            target = event.target\n\n            # check combinations (alt|ctrl|shift+anything)\n            if event.altKey && special != \"alt\"\n              modif += \"alt+\"\n\n            if event.ctrlKey && special != \"ctrl\"\n              modif += \"ctrl+\"\n\n            # TODO: Need to make sure this works consistently across platforms\n            if event.metaKey && !event.ctrlKey && special != \"meta\"\n              modif += \"meta+\"\n\n            # Don't fire in text-accepting inputs that we didn't directly bind to\n            # unless a non-shift modifier key or function key is pressed\n            unless this == target\n              if isTextAcceptingInput(target) && !modif && !isFunctionKey(event)\n                return\n\n            if event.shiftKey && special != \"shift\"\n              modif += \"shift+\"\n\n            if special\n              possible[ modif + special ] = true\n            else\n              possible[ modif + character ] = true\n              possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true\n\n              # \"$\" can be triggered as \"Shift+4\" or \"Shift+$\" or just \"$\"\n              if modif == \"shift+\"\n                possible[ jQuery.hotkeys.shiftNums[ character ] ] = true\n\n            for key in keys\n              if possible[key]\n                return origHandler.apply( this, arguments )\n\n        jQuery.each [ \"keydown\", \"keyup\", \"keypress\" ], ->\n          jQuery.event.special[ this ] = { add: keyHandler }\n\n      )(jQuery)\n    else\n      console.warn \"jQuery not found, no hotkeys added :(\"\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.9.2\"\nentryPoint: \"hotkeys\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\n",
              "type": "blob"
            },
            "test/hotkeys.coffee": {
              "path": "test/hotkeys.coffee",
              "mode": "100644",
              "content": "require \"../hotkeys\"\n\ndescribe \"hotkeys binding\", ->\n  it \"should bind a hotkey\", (done) ->\n    $(document).bind \"keydown\", \"a\", ->\n      done()\n\n    $(document).trigger $.Event \"keydown\",\n      which: 65 # a\n      keyCode: 65\n",
              "type": "blob"
            }
          },
          "distribution": {
            "hotkeys": {
              "path": "hotkeys",
              "content": "(function() {\n  if (typeof jQuery !== \"undefined\" && jQuery !== null) {\n    (function(jQuery) {\n      var isFunctionKey, isTextAcceptingInput, keyHandler;\n      isTextAcceptingInput = function(element) {\n        return /textarea|select/i.test(element.nodeName) || element.type === \"text\" || element.type === \"password\";\n      };\n      isFunctionKey = function(event) {\n        var _ref;\n        return (event.type !== \"keypress\") && ((112 <= (_ref = event.which) && _ref <= 123));\n      };\n      jQuery.hotkeys = {\n        version: \"0.9.0\",\n        specialKeys: {\n          8: \"backspace\",\n          9: \"tab\",\n          13: \"return\",\n          16: \"shift\",\n          17: \"ctrl\",\n          18: \"alt\",\n          19: \"pause\",\n          20: \"capslock\",\n          27: \"esc\",\n          32: \"space\",\n          33: \"pageup\",\n          34: \"pagedown\",\n          35: \"end\",\n          36: \"home\",\n          37: \"left\",\n          38: \"up\",\n          39: \"right\",\n          40: \"down\",\n          45: \"insert\",\n          46: \"del\",\n          96: \"0\",\n          97: \"1\",\n          98: \"2\",\n          99: \"3\",\n          100: \"4\",\n          101: \"5\",\n          102: \"6\",\n          103: \"7\",\n          104: \"8\",\n          105: \"9\",\n          106: \"*\",\n          107: \"+\",\n          109: \"-\",\n          110: \".\",\n          111: \"/\",\n          112: \"f1\",\n          113: \"f2\",\n          114: \"f3\",\n          115: \"f4\",\n          116: \"f5\",\n          117: \"f6\",\n          118: \"f7\",\n          119: \"f8\",\n          120: \"f9\",\n          121: \"f10\",\n          122: \"f11\",\n          123: \"f12\",\n          144: \"numlock\",\n          145: \"scroll\",\n          186: \";\",\n          187: \"=\",\n          188: \",\",\n          189: \"-\",\n          190: \".\",\n          191: \"/\",\n          219: \"[\",\n          220: \"\\\\\",\n          221: \"]\",\n          222: \"'\",\n          224: \"meta\"\n        },\n        shiftNums: {\n          \"`\": \"~\",\n          \"1\": \"!\",\n          \"2\": \"@\",\n          \"3\": \"#\",\n          \"4\": \"$\",\n          \"5\": \"%\",\n          \"6\": \"^\",\n          \"7\": \"&\",\n          \"8\": \"*\",\n          \"9\": \"(\",\n          \"0\": \")\",\n          \"-\": \"_\",\n          \"=\": \"+\",\n          \";\": \":\",\n          \"'\": \"\\\"\",\n          \",\": \"<\",\n          \".\": \">\",\n          \"/\": \"?\",\n          \"\\\\\": \"|\"\n        }\n      };\n      keyHandler = function(handleObj) {\n        var keys, origHandler;\n        if (typeof handleObj.data !== \"string\") {\n          return;\n        }\n        origHandler = handleObj.handler;\n        keys = handleObj.data.toLowerCase().split(\" \");\n        return handleObj.handler = function(event) {\n          var character, key, modif, possible, special, target, _i, _len;\n          special = event.type !== \"keypress\" && jQuery.hotkeys.specialKeys[event.which];\n          character = String.fromCharCode(event.which).toLowerCase();\n          modif = \"\";\n          possible = {};\n          target = event.target;\n          if (event.altKey && special !== \"alt\") {\n            modif += \"alt+\";\n          }\n          if (event.ctrlKey && special !== \"ctrl\") {\n            modif += \"ctrl+\";\n          }\n          if (event.metaKey && !event.ctrlKey && special !== \"meta\") {\n            modif += \"meta+\";\n          }\n          if (this !== target) {\n            if (isTextAcceptingInput(target) && !modif && !isFunctionKey(event)) {\n              return;\n            }\n          }\n          if (event.shiftKey && special !== \"shift\") {\n            modif += \"shift+\";\n          }\n          if (special) {\n            possible[modif + special] = true;\n          } else {\n            possible[modif + character] = true;\n            possible[modif + jQuery.hotkeys.shiftNums[character]] = true;\n            if (modif === \"shift+\") {\n              possible[jQuery.hotkeys.shiftNums[character]] = true;\n            }\n          }\n          for (_i = 0, _len = keys.length; _i < _len; _i++) {\n            key = keys[_i];\n            if (possible[key]) {\n              return origHandler.apply(this, arguments);\n            }\n          }\n        };\n      };\n      return jQuery.each([\"keydown\", \"keyup\", \"keypress\"], function() {\n        return jQuery.event.special[this] = {\n          add: keyHandler\n        };\n      });\n    })(jQuery);\n  } else {\n    console.warn(\"jQuery not found, no hotkeys added :(\");\n  }\n\n}).call(this);\n\n//# sourceURL=hotkeys.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.9.2\",\"entryPoint\":\"hotkeys\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"]};",
              "type": "blob"
            },
            "test/hotkeys": {
              "path": "test/hotkeys",
              "content": "(function() {\n  require(\"../hotkeys\");\n\n  describe(\"hotkeys binding\", function() {\n    return it(\"should bind a hotkey\", function(done) {\n      $(document).bind(\"keydown\", \"a\", function() {\n        return done();\n      });\n      return $(document).trigger($.Event(\"keydown\", {\n        which: 65,\n        keyCode: 65\n      }));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/hotkeys.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.9.2",
          "entryPoint": "hotkeys",
          "remoteDependencies": [
            "//code.jquery.com/jquery-1.10.1.min.js"
          ],
          "repository": {
            "id": 13182272,
            "name": "jquery-hotkeys",
            "full_name": "distri/jquery-hotkeys",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/jquery-hotkeys",
            "description": "jQuery hotkeys plugin",
            "fork": false,
            "url": "https://api.github.com/repos/distri/jquery-hotkeys",
            "forks_url": "https://api.github.com/repos/distri/jquery-hotkeys/forks",
            "keys_url": "https://api.github.com/repos/distri/jquery-hotkeys/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/jquery-hotkeys/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/jquery-hotkeys/teams",
            "hooks_url": "https://api.github.com/repos/distri/jquery-hotkeys/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/jquery-hotkeys/events",
            "assignees_url": "https://api.github.com/repos/distri/jquery-hotkeys/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/jquery-hotkeys/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/jquery-hotkeys/tags",
            "blobs_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/jquery-hotkeys/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/jquery-hotkeys/languages",
            "stargazers_url": "https://api.github.com/repos/distri/jquery-hotkeys/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/jquery-hotkeys/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/jquery-hotkeys/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/jquery-hotkeys/subscription",
            "commits_url": "https://api.github.com/repos/distri/jquery-hotkeys/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/jquery-hotkeys/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/jquery-hotkeys/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/jquery-hotkeys/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/jquery-hotkeys/merges",
            "archive_url": "https://api.github.com/repos/distri/jquery-hotkeys/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/jquery-hotkeys/downloads",
            "issues_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/jquery-hotkeys/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/jquery-hotkeys/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/jquery-hotkeys/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/jquery-hotkeys/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/jquery-hotkeys/releases{/id}",
            "created_at": "2013-09-28T22:58:08Z",
            "updated_at": "2013-11-29T20:59:45Z",
            "pushed_at": "2013-09-29T23:55:14Z",
            "git_url": "git://github.com/distri/jquery-hotkeys.git",
            "ssh_url": "git@github.com:distri/jquery-hotkeys.git",
            "clone_url": "https://github.com/distri/jquery-hotkeys.git",
            "svn_url": "https://github.com/distri/jquery-hotkeys",
            "homepage": null,
            "size": 608,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.9.2",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "image-reader": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "Copyright (c) 2012 Daniel X. Moore\n\nMIT License\n\nPermission is hereby granted, free of charge, to any person obtaining\na copy of this software and associated documentation files (the\n\"Software\"), to deal in the Software without restriction, including\nwithout limitation the rights to use, copy, modify, merge, publish,\ndistribute, sublicense, and/or sell copies of the Software, and to\npermit persons to whom the Software is furnished to do so, subject to\nthe following conditions:\n\nThe above copyright notice and this permission notice shall be\nincluded in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\nNONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\nLIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION\nOF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\nWITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "# Jquery::ImageReader\n\nHelpful jQuery plugins for dropping and pasting image data.\n\n## Usage\n\n```coffeescript\n$(\"html\").pasteImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n\n$(\"html\").dropImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n```\n\n## Contributing\n\n1. Fork it\n2. Create your feature branch (`git checkout -b my-new-feature`)\n3. Commit your changes (`git commit -am 'Added some feature'`)\n4. Push to the branch (`git push origin my-new-feature`)\n5. Create new Pull Request\n",
              "type": "blob"
            },
            "drop.coffee.md": {
              "path": "drop.coffee.md",
              "mode": "100644",
              "content": "Drop\n====\n\n    (($) ->\n      $.event.fix = ((originalFix) ->\n        (event) ->\n          event = originalFix.apply(this, arguments)\n\n          if event.type.indexOf('drag') == 0 || event.type.indexOf('drop') == 0\n            event.dataTransfer = event.originalEvent.dataTransfer\n\n          event\n\n      )($.event.fix)\n\n      defaults =\n        callback: $.noop\n        matchType: /image.*/\n\n      $.fn.dropImageReader = (options) ->\n        if typeof options == \"function\"\n          options =\n            callback: options\n\n        options = $.extend({}, defaults, options)\n\n        stopFn = (event) ->\n          event.stopPropagation()\n          event.preventDefault()\n\n        this.each ->\n          element = this\n          $this = $(this)\n\n          $this.bind 'dragenter dragover dragleave', stopFn\n\n          $this.bind 'drop', (event) ->\n            stopFn(event)\n\n            Array::forEach.call event.dataTransfer.files, (file) ->\n              return unless file.type.match(options.matchType)\n\n              reader = new FileReader()\n\n              reader.onload = (evt) ->\n                options.callback.call element,\n                  dataURL: evt.target.result\n                  event: evt\n                  file: file\n                  name: file.name\n\n              reader.readAsDataURL(file)\n\n    )(jQuery)\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "\n    require \"./paste\"\n    require \"./drop\"\n",
              "type": "blob"
            },
            "paste.coffee.md": {
              "path": "paste.coffee.md",
              "mode": "100644",
              "content": "Paste\n=====\n\n    (($) ->\n      $.event.fix = ((originalFix) ->\n        (event) ->\n          event = originalFix.apply(this, arguments)\n\n          if event.type.indexOf('copy') == 0 || event.type.indexOf('paste') == 0\n            event.clipboardData = event.originalEvent.clipboardData\n\n          return event\n\n      )($.event.fix)\n\n      defaults =\n        callback: $.noop\n        matchType: /image.*/\n\n      $.fn.pasteImageReader = (options) ->\n        if typeof options == \"function\"\n          options =\n            callback: options\n\n        options = $.extend({}, defaults, options)\n\n        @each ->\n          element = this\n          $this = $(this)\n\n          $this.bind 'paste', (event) ->\n            found = false\n            clipboardData = event.clipboardData\n\n            Array::forEach.call clipboardData.types, (type, i) ->\n              return if found\n\n              if type.match(options.matchType) or (clipboardData.items && clipboardData.items[i].type.match(options.matchType))\n                file = clipboardData.items[i].getAsFile()\n\n                reader = new FileReader()\n\n                reader.onload = (evt) ->\n                  options.callback.call element,\n                    dataURL: evt.target.result\n                    event: evt\n                    file: file\n                    name: file.name\n\n                reader.readAsDataURL(file)\n\n                found = true\n\n    )(jQuery)\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\n",
              "type": "blob"
            },
            "test/image_reader.coffee": {
              "path": "test/image_reader.coffee",
              "mode": "100644",
              "content": "require \"../main\"\n\n$(\"html\").pasteImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n\n$(\"html\").dropImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "drop": {
              "path": "drop",
              "content": "(function() {\n  (function($) {\n    var defaults;\n    $.event.fix = (function(originalFix) {\n      return function(event) {\n        event = originalFix.apply(this, arguments);\n        if (event.type.indexOf('drag') === 0 || event.type.indexOf('drop') === 0) {\n          event.dataTransfer = event.originalEvent.dataTransfer;\n        }\n        return event;\n      };\n    })($.event.fix);\n    defaults = {\n      callback: $.noop,\n      matchType: /image.*/\n    };\n    return $.fn.dropImageReader = function(options) {\n      var stopFn;\n      if (typeof options === \"function\") {\n        options = {\n          callback: options\n        };\n      }\n      options = $.extend({}, defaults, options);\n      stopFn = function(event) {\n        event.stopPropagation();\n        return event.preventDefault();\n      };\n      return this.each(function() {\n        var $this, element;\n        element = this;\n        $this = $(this);\n        $this.bind('dragenter dragover dragleave', stopFn);\n        return $this.bind('drop', function(event) {\n          stopFn(event);\n          return Array.prototype.forEach.call(event.dataTransfer.files, function(file) {\n            var reader;\n            if (!file.type.match(options.matchType)) {\n              return;\n            }\n            reader = new FileReader();\n            reader.onload = function(evt) {\n              return options.callback.call(element, {\n                dataURL: evt.target.result,\n                event: evt,\n                file: file,\n                name: file.name\n              });\n            };\n            return reader.readAsDataURL(file);\n          });\n        });\n      });\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=drop.coffee",
              "type": "blob"
            },
            "main": {
              "path": "main",
              "content": "(function() {\n  require(\"./paste\");\n\n  require(\"./drop\");\n\n}).call(this);\n\n//# sourceURL=main.coffee",
              "type": "blob"
            },
            "paste": {
              "path": "paste",
              "content": "(function() {\n  (function($) {\n    var defaults;\n    $.event.fix = (function(originalFix) {\n      return function(event) {\n        event = originalFix.apply(this, arguments);\n        if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {\n          event.clipboardData = event.originalEvent.clipboardData;\n        }\n        return event;\n      };\n    })($.event.fix);\n    defaults = {\n      callback: $.noop,\n      matchType: /image.*/\n    };\n    return $.fn.pasteImageReader = function(options) {\n      if (typeof options === \"function\") {\n        options = {\n          callback: options\n        };\n      }\n      options = $.extend({}, defaults, options);\n      return this.each(function() {\n        var $this, element;\n        element = this;\n        $this = $(this);\n        return $this.bind('paste', function(event) {\n          var clipboardData, found;\n          found = false;\n          clipboardData = event.clipboardData;\n          return Array.prototype.forEach.call(clipboardData.types, function(type, i) {\n            var file, reader;\n            if (found) {\n              return;\n            }\n            if (type.match(options.matchType) || (clipboardData.items && clipboardData.items[i].type.match(options.matchType))) {\n              file = clipboardData.items[i].getAsFile();\n              reader = new FileReader();\n              reader.onload = function(evt) {\n                return options.callback.call(element, {\n                  dataURL: evt.target.result,\n                  event: evt,\n                  file: file,\n                  name: file.name\n                });\n              };\n              reader.readAsDataURL(file);\n              return found = true;\n            }\n          });\n        });\n      });\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=paste.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"]};",
              "type": "blob"
            },
            "test/image_reader": {
              "path": "test/image_reader",
              "content": "(function() {\n  require(\"../main\");\n\n  $(\"html\").pasteImageReader(function(_arg) {\n    var dataURL, event, file, name;\n    name = _arg.name, dataURL = _arg.dataURL, file = _arg.file, event = _arg.event;\n    return $(\"body\").css({\n      backgroundImage: \"url(\" + dataURL + \")\"\n    });\n  });\n\n  $(\"html\").dropImageReader(function(_arg) {\n    var dataURL, event, file, name;\n    name = _arg.name, dataURL = _arg.dataURL, file = _arg.file, event = _arg.event;\n    return $(\"body\").css({\n      backgroundImage: \"url(\" + dataURL + \")\"\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/image_reader.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "main",
          "remoteDependencies": [
            "//code.jquery.com/jquery-1.10.1.min.js"
          ],
          "repository": {
            "id": 4527535,
            "name": "jquery-image_reader",
            "full_name": "distri/jquery-image_reader",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/jquery-image_reader",
            "description": "Paste and Drop images into web apps",
            "fork": false,
            "url": "https://api.github.com/repos/distri/jquery-image_reader",
            "forks_url": "https://api.github.com/repos/distri/jquery-image_reader/forks",
            "keys_url": "https://api.github.com/repos/distri/jquery-image_reader/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/jquery-image_reader/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/jquery-image_reader/teams",
            "hooks_url": "https://api.github.com/repos/distri/jquery-image_reader/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/jquery-image_reader/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/jquery-image_reader/events",
            "assignees_url": "https://api.github.com/repos/distri/jquery-image_reader/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/jquery-image_reader/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/jquery-image_reader/tags",
            "blobs_url": "https://api.github.com/repos/distri/jquery-image_reader/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/jquery-image_reader/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/jquery-image_reader/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/jquery-image_reader/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/jquery-image_reader/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/jquery-image_reader/languages",
            "stargazers_url": "https://api.github.com/repos/distri/jquery-image_reader/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/jquery-image_reader/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/jquery-image_reader/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/jquery-image_reader/subscription",
            "commits_url": "https://api.github.com/repos/distri/jquery-image_reader/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/jquery-image_reader/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/jquery-image_reader/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/jquery-image_reader/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/jquery-image_reader/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/jquery-image_reader/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/jquery-image_reader/merges",
            "archive_url": "https://api.github.com/repos/distri/jquery-image_reader/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/jquery-image_reader/downloads",
            "issues_url": "https://api.github.com/repos/distri/jquery-image_reader/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/jquery-image_reader/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/jquery-image_reader/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/jquery-image_reader/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/jquery-image_reader/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/jquery-image_reader/releases{/id}",
            "created_at": "2012-06-02T07:12:27Z",
            "updated_at": "2013-11-29T21:02:52Z",
            "pushed_at": "2013-10-30T15:54:19Z",
            "git_url": "git://github.com/distri/jquery-image_reader.git",
            "ssh_url": "git@github.com:distri/jquery-image_reader.git",
            "clone_url": "https://github.com/distri/jquery-image_reader.git",
            "svn_url": "https://github.com/distri/jquery-image_reader",
            "homepage": null,
            "size": 142,
            "stargazers_count": 5,
            "watchers_count": 5,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 1,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 1,
            "open_issues": 0,
            "watchers": 5,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 1,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "observable": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "[![Build Status](https://travis-ci.org/distri/observable.svg?branch=npm)](https://travis-ci.org/distri/observable)\n\nObservable\n==========\n\nInstallation\n------------\n\nNode\n\n    npm install o_0\n\nUsage\n-----\n\n    Observable = require \"o_0\"\n\nGet notified when the value changes.\n\n    observable = Observable 5\n\n    observable() # 5\n\n    observable.observe (newValue) ->\n      console.log newValue\n\n    observable 10 # logs 10 to console\n\nArrays\n------\n\nProxy array methods.\n\n    observable = Observable [1, 2, 3]\n\n    observable.forEach (value) ->\n      # 1, 2, 3\n\nFunctions\n---------\n\nAutomagically compute dependencies for observable functions.\n\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n    lastName \"Bro\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    module.exports = Observable = (value, context) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        copy(listeners).forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n\nOur return function is a function that holds only a cached value which is updated\nwhen it's dependencies change.\n\nThe `magicDependency` call is so other functions can depend on this computed function the\nsame way we depend on other types of observables.\n\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        changed = ->\n          value = computeDependencies(self, fn, changed, context)\n          notify(value)\n\n        changed()\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (callback) ->\n        magicDependency(self)\n\n        if value?\n          [value].forEach (item) ->\n            callback.call(item, item)\n\n        return self\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            magicDependency(self)\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        # Provide length on a best effort basis because older browsers choke\n        if PROXY_LENGTH\n          Object.defineProperty self, 'length',\n            get: ->\n              magicDependency(self)\n              value.length\n            set: (length) ->\n              value.length = length\n              notifyReturning(value.length)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (callback) ->\n            self.forEach (item, index) ->\n              callback.call(item, item, index, self)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            magicDependency(self)\n            value[index]\n\n          first: ->\n            magicDependency(self)\n            value[0]\n\n          last: ->\n            magicDependency(self)\n            value[value.length-1]\n\n          size: ->\n            magicDependency(self)\n            value.length\n\n      extend self,\n        listeners: listeners\n\n        observe: (listener) ->\n          listeners.push listener\n\n        stopObserving: (fn) ->\n          remove listeners, fn\n\n        toggle: ->\n          self !value\n\n        increment: (n) ->\n          self value + n\n\n        decrement: (n) ->\n          self value - n\n\n        toString: ->\n          \"Observable(#{value})\"\n\n      return self\n\n    Observable.concat = ->\n      # Optimization: Manually copy arguments to an array\n      args = new Array(arguments.length)\n      for arg, i in arguments\n        args[i] = arguments[i]\n\n      collection = Observable(args)\n\n      o = Observable ->\n        flatten collection.map(splat)\n\n      o.push = collection.push\n\n      return o\n\nAppendix\n--------\n\nThe extend method adds one object's properties to another.\n\n    extend = (target) ->\n      # Optimization: iterate through arguments manually rather than pass to slice to create an array\n      for source, i in arguments\n        # The first argument is target, so skip it\n        if i > 0\n          for name of source\n            target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = []\n\n    magicDependency = (self) ->\n      observerSet = last(global.OBSERVABLE_ROOT_HACK)\n      if observerSet\n        observerSet.add self\n\nOptimization: Keep the function containing the try-catch as small as possible.\n\n    tryCallWithFinallyPop = (fn, context) ->\n      try\n        fn.call(context)\n      finally\n        global.OBSERVABLE_ROOT_HACK.pop()\n\nAutomagically compute dependencies.\n\n    computeDependencies = (self, fn, update, context) ->\n      deps = new Set\n\n      global.OBSERVABLE_ROOT_HACK.push(deps)\n\n      value = tryCallWithFinallyPop fn, context\n\n      self._deps?.forEach (observable) ->\n        observable.stopObserving update\n\n      self._deps = deps\n\n      deps.forEach (observable) ->\n        observable.observe update\n\n      return value\n\nCheck if we can proxy function length property.\n\n    try\n      Object.defineProperty (->), 'length',\n        get: ->\n        set: ->\n\n      PROXY_LENGTH = true\n    catch\n      PROXY_LENGTH = false\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n\n    copy = (array) ->\n      array.concat([])\n\n    get = (arg) ->\n      if typeof arg is \"function\"\n        arg()\n      else\n        arg\n\n    splat = (item) ->\n      results = []\n\n      return results unless item?\n\n      if typeof item.forEach is \"function\"\n        item.forEach (i) ->\n          results.push i\n      else\n        result = get item\n\n        results.push result if result?\n\n      results\n\n    last = (array) ->\n      array[array.length - 1]\n\n    flatten = (array) ->\n      array.reduce (a, b) ->\n        a.concat(b)\n      , []\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.3.8\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/observable.coffee": {
          "path": "test/observable.coffee",
          "content": "global.Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it \"should not fire when setting to the same value\", ->\n    o = Observable 5\n\n    o.observe ->\n      assert false\n\n    o(5)\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n    it \"should have the correct `this` scope for items\", (done) ->\n      o = Observable 5\n\n      o.each ->\n        assert.equal this, 5\n        done()\n\n    it \"should have the correct `this` scope for items in observable arrays\", ->\n      scopes = []\n\n      o = Observable [\"I'm\", \"an\", \"array\"]\n\n      o.each ->\n        scopes.push this\n\n      assert.equal scopes[0], \"I'm\"\n      assert.equal scopes[1], \"an\"\n      assert.equal scopes[2], \"array\"\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\n  it \"should increment\", ->\n    observable = Observable 1\n\n    observable.increment(5)\n\n    assert.equal observable(), 6\n\n  it \"should decremnet\", ->\n    observable = Observable 1\n\n    observable.decrement 5\n\n    assert.equal observable(), -4\n\n  it \"should toggle\", ->\n    observable = Observable false\n\n    observable.toggle()\n    assert.equal observable(), true\n\n    observable.toggle()\n    assert.equal observable(), false\n\n  it \"should trigger when toggling\", (done) ->\n    observable = Observable true\n    observable.observe (v) ->\n      assert.equal v, false\n      done()\n\n    observable.toggle()\n\n  it \"should have a nice toString\", ->\n    observable = Observable 5\n\n    assert.equal observable.toString(), \"Observable(5)\"\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  it \"#remove non-existent element\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.remove(0), undefined\n\n  it \"should proxy the length property\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.length, 3\n\n    called = false\n    o.observe (value) ->\n      assert.equal value[0], 1\n      assert.equal value[1], undefined\n      called = true\n\n    o.length = 1\n    assert.equal o.length, 1\n    assert.equal called, true\n\n  it \"should auto detect conditionals of length as a dependency\", ->\n    observableArray = Observable [1, 2, 3]\n\n    o = Observable ->\n      if observableArray.length > 5\n        true\n      else\n        false\n\n    assert.equal o(), false\n\n    called = 0\n    o.observe ->\n      called += 1\n\n    observableArray.push 4, 5, 6\n\n    assert.equal called, 1\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should compute array#get as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.get(0)\n\n    assert.equal observableFn(), 0\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#first as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.first() + 1\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 6\n\n  it \"should compute array#last as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.last()\n\n    assert.equal observableFn(), 2\n\n    observableArray.pop()\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#size as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.size() * 2\n\n    assert.equal observableFn(), 6\n\n    observableArray.pop()\n    assert.equal observableFn(), 4\n    observableArray.shift()\n    assert.equal observableFn(), 2\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should work with dynamic dependencies\", ->\n    observableArray = Observable []\n\n    dynamicObservable = Observable ->\n      observableArray.filter (item) ->\n        item.age() > 3\n\n    assert.equal dynamicObservable().length, 0\n\n    observableArray.push\n      age: Observable 1\n\n    observableArray()[0].age 5\n    assert.equal dynamicObservable().length, 1\n\n  it \"should work with context\", ->\n    model =\n      a: Observable \"Hello\"\n      b: Observable \"there\"\n\n    model.c = Observable ->\n      \"#{@a()} #{@b()}\"\n    , model\n\n    assert.equal model.c(), \"Hello there\"\n\n    model.b \"world\"\n\n    assert.equal model.c(), \"Hello world\"\n\n  it \"should be ok even if the function throws an exception\", ->\n    assert.throws ->\n      t = Observable ->\n        throw \"wat\"\n\n    # TODO: Should be able to find a test case that is affected by this rather that\n    # checking it directly\n    assert.equal global.OBSERVABLE_ROOT_HACK.length, 0\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each()\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n\n  it \"should work with multiple dependencies\", ->\n    letter = Observable \"A\"\n    checked = ->\n      l = letter()\n      @name().indexOf(l) is 0\n\n    first = {name: Observable(\"Andrew\")}\n    first.checked = Observable checked, first\n\n    second = {name: Observable(\"Benjamin\")}\n    second.checked = Observable checked, second\n\n    assert.equal first.checked(), true\n    assert.equal second.checked(), false\n\n    assert.equal letter.listeners.length, 2\n\n    letter \"B\"\n\n    assert.equal first.checked(), false\n    assert.equal second.checked(), true\n\n  it \"shouldn't double count dependencies\", ->\n    dep = Observable \"yo\"\n\n    o = Observable ->\n      dep()\n      dep()\n      dep()\n\n    count = 0\n    o.observe ->\n      count += 1\n\n    dep('heyy')\n\n    assert.equal count, 1\n\n  it \"should work with nested observable construction\", ->\n    gen = Observable ->\n      Observable \"Duder\"\n\n    o = gen()\n\n    assert.equal o(), \"Duder\"\n\n    o(\"wat\")\n\n    assert.equal o(), \"wat\"\n\n  describe \"Scoping\", ->\n    it \"should be scoped to optional context\", (done) ->\n      model =\n        firstName: Observable \"Duder\"\n        lastName: Observable \"Man\"\n\n      model.name = Observable ->\n        \"#{@firstName()} #{@lastName()}\"\n      , model\n\n      model.name.observe (newValue) ->\n        assert.equal newValue, \"Duder Bro\"\n\n        done()\n\n      model.lastName \"Bro\"\n\n  describe \"concat\", ->\n    it \"should work with a single observable\", ->\n      observable = Observable \"something\"\n      observableArray = Observable.concat observable\n      assert.equal observableArray.last(), \"something\"\n\n      observable \"something else\"\n      assert.equal observableArray.last(), \"something else\"\n\n    it \"should work with an undefined observable\", ->\n      observable = Observable undefined\n      observableArray = Observable.concat observable\n      assert.equal observableArray.size(), 0\n\n      observable \"defined\"\n      assert.equal observableArray.size(), 1\n\n    it \"should work with undefined\", ->\n      observableArray = Observable.concat undefined\n      assert.equal observableArray.size(), 0\n\n    it \"should work with []\", ->\n      observableArray = Observable.concat []\n      assert.equal observableArray.size(), 0\n\n    it \"should return an observable array that changes based on changes in inputs\", ->\n      numbers = Observable [1, 2, 3]\n      letters = Observable [\"a\", \"b\", \"c\"]\n      item = Observable({})\n      nullable = Observable null\n\n      observableArray = Observable.concat numbers, \"literal\", letters, item, nullable\n\n      assert.equal observableArray().length, 3 + 1 + 3 + 1\n\n      assert.equal observableArray()[0], 1\n      assert.equal observableArray()[3], \"literal\"\n      assert.equal observableArray()[4], \"a\"\n      assert.equal observableArray()[7], item()\n\n      numbers.push 4\n\n      assert.equal observableArray().length, 9\n\n      nullable \"cool\"\n\n      assert.equal observableArray().length, 10\n\n    it \"should work with observable functions that return arrays\", ->\n      item = Observable(\"wat\")\n\n      computedArray = Observable ->\n        [item()]\n\n      observableArray = Observable.concat computedArray, computedArray\n\n      assert.equal observableArray().length, 2\n\n      assert.equal observableArray()[1], \"wat\"\n\n      item \"yolo\"\n\n      assert.equal observableArray()[1], \"yolo\"\n\n    it \"should have a push method\", ->\n      observableArray = Observable.concat()\n\n      observable = Observable \"hey\"\n\n      observableArray.push observable\n\n      assert.equal observableArray()[0], \"hey\"\n\n      observable \"wat\"\n\n      assert.equal observableArray()[0], \"wat\"\n\n      observableArray.push \"cool\"\n      observableArray.push \"radical\"\n\n      assert.equal observableArray().length, 3\n\n    it \"should be observable\", (done) ->\n      observableArray = Observable.concat()\n\n      observableArray.observe (items) ->\n        assert.equal items.length, 3\n        done()\n\n      observableArray.push [\"A\", \"B\", \"C\"]\n\n    it \"should have an each method\", ->\n      observableArray = Observable.concat([\"A\", \"B\", \"C\"])\n\n      n = 0\n      observableArray.each () ->\n        n += 1\n\n      assert.equal n, 3\n\n  describe \"nesting dependencies\", ->\n    it \"should update the correct observable\", ->\n      a = Observable \"a\"\n      b = Observable \"b\"\n\n      results = Observable ->\n        r = Observable.concat()\n\n        r.push a\n        r.push b\n\n        r\n\n      # TODO: Should this just be\n      #     results.first()\n      assert.equal results().first(), \"a\"\n\n      a(\"newA\")\n\n      assert.equal results().first(), \"newA\"\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var Observable, PROXY_LENGTH, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat, tryCallWithFinallyPop,\n    __slice = [].slice;\n\n  module.exports = Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      changed();\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function(callback) {\n      magicDependency(self);\n      if (value != null) {\n        [value].forEach(function(item) {\n          return callback.call(item, item);\n        });\n      }\n      return self;\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      if (PROXY_LENGTH) {\n        Object.defineProperty(self, 'length', {\n          get: function() {\n            magicDependency(self);\n            return value.length;\n          },\n          set: function(length) {\n            value.length = length;\n            return notifyReturning(value.length);\n          }\n        });\n      }\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function(callback) {\n          self.forEach(function(item, index) {\n            return callback.call(item, item, index, self);\n          });\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          magicDependency(self);\n          return value[index];\n        },\n        first: function() {\n          magicDependency(self);\n          return value[0];\n        },\n        last: function() {\n          magicDependency(self);\n          return value[value.length - 1];\n        },\n        size: function() {\n          magicDependency(self);\n          return value.length;\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var arg, args, collection, i, o, _i, _len;\n    args = new Array(arguments.length);\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      arg = arguments[i];\n      args[i] = arguments[i];\n    }\n    collection = Observable(args);\n    o = Observable(function() {\n      return flatten(collection.map(splat));\n    });\n    o.push = collection.push;\n    return o;\n  };\n\n  extend = function(target) {\n    var i, name, source, _i, _len;\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      source = arguments[i];\n      if (i > 0) {\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  magicDependency = function(self) {\n    var observerSet;\n    observerSet = last(global.OBSERVABLE_ROOT_HACK);\n    if (observerSet) {\n      return observerSet.add(self);\n    }\n  };\n\n  tryCallWithFinallyPop = function(fn, context) {\n    try {\n      return fn.call(context);\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    var deps, value, _ref;\n    deps = new Set;\n    global.OBSERVABLE_ROOT_HACK.push(deps);\n    value = tryCallWithFinallyPop(fn, context);\n    if ((_ref = self._deps) != null) {\n      _ref.forEach(function(observable) {\n        return observable.stopObserving(update);\n      });\n    }\n    self._deps = deps;\n    deps.forEach(function(observable) {\n      return observable.observe(update);\n    });\n    return value;\n  };\n\n  try {\n    Object.defineProperty((function() {}), 'length', {\n      get: function() {},\n      set: function() {}\n    });\n    PROXY_LENGTH = true;\n  } catch (_error) {\n    PROXY_LENGTH = false;\n  }\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (item == null) {\n      return results;\n    }\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.3.8\"};",
          "type": "blob"
        },
        "test/observable": {
          "path": "test/observable",
          "content": "(function() {\n  global.Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it(\"should not fire when setting to the same value\", function() {\n      var o;\n      o = Observable(5);\n      o.observe(function() {\n        return assert(false);\n      });\n      return o(5);\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n      it(\"should have the correct `this` scope for items\", function(done) {\n        var o;\n        o = Observable(5);\n        return o.each(function() {\n          assert.equal(this, 5);\n          return done();\n        });\n      });\n      return it(\"should have the correct `this` scope for items in observable arrays\", function() {\n        var o, scopes;\n        scopes = [];\n        o = Observable([\"I'm\", \"an\", \"array\"]);\n        o.each(function() {\n          return scopes.push(this);\n        });\n        assert.equal(scopes[0], \"I'm\");\n        assert.equal(scopes[1], \"an\");\n        return assert.equal(scopes[2], \"array\");\n      });\n    });\n    it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n    it(\"should increment\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.increment(5);\n      return assert.equal(observable(), 6);\n    });\n    it(\"should decremnet\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.decrement(5);\n      return assert.equal(observable(), -4);\n    });\n    it(\"should toggle\", function() {\n      var observable;\n      observable = Observable(false);\n      observable.toggle();\n      assert.equal(observable(), true);\n      observable.toggle();\n      return assert.equal(observable(), false);\n    });\n    it(\"should trigger when toggling\", function(done) {\n      var observable;\n      observable = Observable(true);\n      observable.observe(function(v) {\n        assert.equal(v, false);\n        return done();\n      });\n      return observable.toggle();\n    });\n    return it(\"should have a nice toString\", function() {\n      var observable;\n      observable = Observable(5);\n      return assert.equal(observable.toString(), \"Observable(5)\");\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    it(\"#remove non-existent element\", function() {\n      var o;\n      o = Observable([1, 2, 3]);\n      return assert.equal(o.remove(0), void 0);\n    });\n    it(\"should proxy the length property\", function() {\n      var called, o;\n      o = Observable([1, 2, 3]);\n      assert.equal(o.length, 3);\n      called = false;\n      o.observe(function(value) {\n        assert.equal(value[0], 1);\n        assert.equal(value[1], void 0);\n        return called = true;\n      });\n      o.length = 1;\n      assert.equal(o.length, 1);\n      return assert.equal(called, true);\n    });\n    return it(\"should auto detect conditionals of length as a dependency\", function() {\n      var called, o, observableArray;\n      observableArray = Observable([1, 2, 3]);\n      o = Observable(function() {\n        if (observableArray.length > 5) {\n          return true;\n        } else {\n          return false;\n        }\n      });\n      assert.equal(o(), false);\n      called = 0;\n      o.observe(function() {\n        return called += 1;\n      });\n      observableArray.push(4, 5, 6);\n      return assert.equal(called, 1);\n    });\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should compute array#get as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.get(0);\n      });\n      assert.equal(observableFn(), 0);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#first as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.first() + 1;\n      });\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 6);\n    });\n    it(\"should compute array#last as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.last();\n      });\n      assert.equal(observableFn(), 2);\n      observableArray.pop();\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#size as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.size() * 2;\n      });\n      assert.equal(observableFn(), 6);\n      observableArray.pop();\n      assert.equal(observableFn(), 4);\n      observableArray.shift();\n      return assert.equal(observableFn(), 2);\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should work with dynamic dependencies\", function() {\n      var dynamicObservable, observableArray;\n      observableArray = Observable([]);\n      dynamicObservable = Observable(function() {\n        return observableArray.filter(function(item) {\n          return item.age() > 3;\n        });\n      });\n      assert.equal(dynamicObservable().length, 0);\n      observableArray.push({\n        age: Observable(1)\n      });\n      observableArray()[0].age(5);\n      return assert.equal(dynamicObservable().length, 1);\n    });\n    it(\"should work with context\", function() {\n      var model;\n      model = {\n        a: Observable(\"Hello\"),\n        b: Observable(\"there\")\n      };\n      model.c = Observable(function() {\n        return \"\" + (this.a()) + \" \" + (this.b());\n      }, model);\n      assert.equal(model.c(), \"Hello there\");\n      model.b(\"world\");\n      return assert.equal(model.c(), \"Hello world\");\n    });\n    it(\"should be ok even if the function throws an exception\", function() {\n      assert.throws(function() {\n        var t;\n        return t = Observable(function() {\n          throw \"wat\";\n        });\n      });\n      return assert.equal(global.OBSERVABLE_ROOT_HACK.length, 0);\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each());\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n    it(\"should work with multiple dependencies\", function() {\n      var checked, first, letter, second;\n      letter = Observable(\"A\");\n      checked = function() {\n        var l;\n        l = letter();\n        return this.name().indexOf(l) === 0;\n      };\n      first = {\n        name: Observable(\"Andrew\")\n      };\n      first.checked = Observable(checked, first);\n      second = {\n        name: Observable(\"Benjamin\")\n      };\n      second.checked = Observable(checked, second);\n      assert.equal(first.checked(), true);\n      assert.equal(second.checked(), false);\n      assert.equal(letter.listeners.length, 2);\n      letter(\"B\");\n      assert.equal(first.checked(), false);\n      return assert.equal(second.checked(), true);\n    });\n    it(\"shouldn't double count dependencies\", function() {\n      var count, dep, o;\n      dep = Observable(\"yo\");\n      o = Observable(function() {\n        dep();\n        dep();\n        return dep();\n      });\n      count = 0;\n      o.observe(function() {\n        return count += 1;\n      });\n      dep('heyy');\n      return assert.equal(count, 1);\n    });\n    it(\"should work with nested observable construction\", function() {\n      var gen, o;\n      gen = Observable(function() {\n        return Observable(\"Duder\");\n      });\n      o = gen();\n      assert.equal(o(), \"Duder\");\n      o(\"wat\");\n      return assert.equal(o(), \"wat\");\n    });\n    describe(\"Scoping\", function() {\n      return it(\"should be scoped to optional context\", function(done) {\n        var model;\n        model = {\n          firstName: Observable(\"Duder\"),\n          lastName: Observable(\"Man\")\n        };\n        model.name = Observable(function() {\n          return \"\" + (this.firstName()) + \" \" + (this.lastName());\n        }, model);\n        model.name.observe(function(newValue) {\n          assert.equal(newValue, \"Duder Bro\");\n          return done();\n        });\n        return model.lastName(\"Bro\");\n      });\n    });\n    describe(\"concat\", function() {\n      it(\"should work with a single observable\", function() {\n        var observable, observableArray;\n        observable = Observable(\"something\");\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.last(), \"something\");\n        observable(\"something else\");\n        return assert.equal(observableArray.last(), \"something else\");\n      });\n      it(\"should work with an undefined observable\", function() {\n        var observable, observableArray;\n        observable = Observable(void 0);\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.size(), 0);\n        observable(\"defined\");\n        return assert.equal(observableArray.size(), 1);\n      });\n      it(\"should work with undefined\", function() {\n        var observableArray;\n        observableArray = Observable.concat(void 0);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should work with []\", function() {\n        var observableArray;\n        observableArray = Observable.concat([]);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should return an observable array that changes based on changes in inputs\", function() {\n        var item, letters, nullable, numbers, observableArray;\n        numbers = Observable([1, 2, 3]);\n        letters = Observable([\"a\", \"b\", \"c\"]);\n        item = Observable({});\n        nullable = Observable(null);\n        observableArray = Observable.concat(numbers, \"literal\", letters, item, nullable);\n        assert.equal(observableArray().length, 3 + 1 + 3 + 1);\n        assert.equal(observableArray()[0], 1);\n        assert.equal(observableArray()[3], \"literal\");\n        assert.equal(observableArray()[4], \"a\");\n        assert.equal(observableArray()[7], item());\n        numbers.push(4);\n        assert.equal(observableArray().length, 9);\n        nullable(\"cool\");\n        return assert.equal(observableArray().length, 10);\n      });\n      it(\"should work with observable functions that return arrays\", function() {\n        var computedArray, item, observableArray;\n        item = Observable(\"wat\");\n        computedArray = Observable(function() {\n          return [item()];\n        });\n        observableArray = Observable.concat(computedArray, computedArray);\n        assert.equal(observableArray().length, 2);\n        assert.equal(observableArray()[1], \"wat\");\n        item(\"yolo\");\n        return assert.equal(observableArray()[1], \"yolo\");\n      });\n      it(\"should have a push method\", function() {\n        var observable, observableArray;\n        observableArray = Observable.concat();\n        observable = Observable(\"hey\");\n        observableArray.push(observable);\n        assert.equal(observableArray()[0], \"hey\");\n        observable(\"wat\");\n        assert.equal(observableArray()[0], \"wat\");\n        observableArray.push(\"cool\");\n        observableArray.push(\"radical\");\n        return assert.equal(observableArray().length, 3);\n      });\n      it(\"should be observable\", function(done) {\n        var observableArray;\n        observableArray = Observable.concat();\n        observableArray.observe(function(items) {\n          assert.equal(items.length, 3);\n          return done();\n        });\n        return observableArray.push([\"A\", \"B\", \"C\"]);\n      });\n      return it(\"should have an each method\", function() {\n        var n, observableArray;\n        observableArray = Observable.concat([\"A\", \"B\", \"C\"]);\n        n = 0;\n        observableArray.each(function() {\n          return n += 1;\n        });\n        return assert.equal(n, 3);\n      });\n    });\n    return describe(\"nesting dependencies\", function() {\n      return it(\"should update the correct observable\", function() {\n        var a, b, results;\n        a = Observable(\"a\");\n        b = Observable(\"b\");\n        results = Observable(function() {\n          var r;\n          r = Observable.concat();\n          r.push(a);\n          r.push(b);\n          return r;\n        });\n        assert.equal(results().first(), \"a\");\n        a(\"newA\");\n        return assert.equal(results().first(), \"newA\");\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "config": {
        "version": "0.3.8"
      },
      "version": "0.3.8",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.3.8",
        "default_branch": "master",
        "full_name": "distri/observable",
        "homepage": "http://observable.us",
        "description": null,
        "html_url": "https://github.com/distri/observable",
        "url": "https://api.github.com/repos/distri/observable",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "postmaster": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "postmaster\n==========\n\nSend and receive `postMessage` commands using promises to handle the results.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "###\n\nPostmaster wraps the `postMessage` API with promises.\n\n###\n\ndefaultReceiver = self\nackTimeout = 1000\n\nmodule.exports = Postmaster = (self={}) ->\n  send = (data) ->\n    target = self.remoteTarget()\n    if !Worker? or target instanceof Worker\n      target.postMessage data\n    else\n      target.postMessage data, \"*\"\n\n  dominant = Postmaster.dominant()\n  self.remoteTarget ?= -> dominant\n  self.receiver ?= -> defaultReceiver\n  self.ackTimeout ?= -> ackTimeout\n\n  self.receiver().addEventListener \"message\", (event) ->\n    # Only listening to messages from `opener`\n    if event.source is self.remoteTarget() or !event.source\n      data = event.data\n      {type, method, params, id} = data\n\n      switch type\n        when \"ack\"\n          pendingResponses[id]?.ack = true\n        when \"response\"\n          pendingResponses[id].resolve data.result\n        when \"error\"\n          pendingResponses[id].reject data.error\n        when \"message\"\n          send\n            type: \"ack\"\n            id: id\n\n          Promise.resolve()\n          .then ->\n            if typeof self[method] is \"function\"\n              self[method](params...)\n            else\n              throw new Error \"`#{method}` is not a function\"\n          .then (result) ->\n            send\n              type: \"response\"\n              id: id\n              result: result\n          .catch (error) ->\n            if typeof error is \"string\"\n              message = error\n            else\n              message = error.message\n\n            send\n              type: \"error\"\n              id: id\n              error:\n                message: message\n                stack: error.stack\n\n  pendingResponses = {}\n  remoteId = 0\n\n  clear = (id) ->\n    clearTimeout pendingResponses[id].timeout\n    delete pendingResponses[id]\n\n  self.invokeRemote = (method, params...) ->\n    new Promise (resolve, reject) ->\n      id = remoteId++\n\n      try\n        send\n          type: \"message\"\n          method: method\n          params: params\n          id: id\n      catch e\n        reject(e)\n        return\n\n      ackWait = self.ackTimeout()\n      timeout = setTimeout ->\n        pendingResponse = pendingResponses[id]\n        if pendingResponse and !pendingResponse.ack\n          clear(id)\n          reject new Error \"No ack received within #{ackWait}\"\n      , ackWait\n\n      pendingResponses[id] =\n        timeout: timeout\n        resolve: (result) ->\n          clear(id)\n          resolve(result)\n        reject: (error) ->\n          clear(id)\n          reject(error)\n\n  return self\n\nPostmaster.dominant = ->\n  if window? # iframe or child window context\n    opener or ((parent != window) and parent) or undefined\n  else # Web Worker Context\n    self\n\nreturn Postmaster\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.5.1\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/postmaster.coffee": {
          "path": "test/postmaster.coffee",
          "content": "Postmaster = require \"../main\"\n\nscriptContent = ->\n  fn = ->\n    pm = Postmaster()\n    pm.echo = (value) ->\n      return value\n    pm.throws = ->\n      throw new Error(\"This always throws\")\n    pm.promiseFail = ->\n      Promise.reject new Error \"This is a failed promise\"\n\n  \"\"\"\n    var module = {};\n    Postmaster = #{PACKAGE.distribution.main.content};\n    (#{fn.toString()})();\n  \"\"\"\n\ninitWindow = (targetWindow) ->\n  targetWindow.document.write \"<script>#{scriptContent()}<\\/script>\"\n\ndescribe \"Postmaster\", ->\n  it \"should work with openened windows\", (done) ->\n    childWindow = open(\"\", null, \"width=200,height=200\")\n\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .then (result) ->\n      assert.equal result, 5\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      childWindow.close()\n\n  it \"should work with iframes\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n  it \"should handle the remote call throwing errors\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"throws\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n    return\n\n  it \"should throwing a useful error when the remote doesn't define the function\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"someUndefinedFunction\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n    return\n\n  it \"should handle the remote call returning failed promises\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"promiseFail\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n    return\n\n  it \"should be able to go around the world\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.yolo = (txt) ->\n      \"heyy #{txt}\"\n    postmaster.invokeRemote \"invokeRemote\", \"yolo\", \"cool\"\n    .then (result) ->\n      assert.equal result, \"heyy cool\"\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n    return\n\n  it \"should work with web workers\", (done) ->\n    blob = new Blob [scriptContent()]\n    jsUrl = URL.createObjectURL(blob)\n\n    worker = new Worker(jsUrl)\n\n    base =\n      remoteTarget: -> worker\n      receiver: -> worker\n\n    postmaster = Postmaster(base)\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      worker.terminate()\n\n    return\n\n  it \"should fail quickly when contacting a window that doesn't support Postmaster\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .catch (e) ->\n      if e.message.match /no ack/i\n        done()\n      else\n        done(1)\n    .then ->\n      iframe.remove()\n\n    return\n\n  it \"should return a rejected promise when unable to send to the target\", (done) ->\n    postmaster = Postmaster\n      remoteTarget: -> null\n\n    postmaster.invokeRemote \"yo\"\n    .catch (e) ->\n      assert.equal e.message, \"Cannot read property 'postMessage' of null\"\n      done()\n\n    return\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "\n/*\n\nPostmaster wraps the `postMessage` API with promises.\n */\n\n(function() {\n  var Postmaster, ackTimeout, defaultReceiver,\n    __slice = [].slice;\n\n  defaultReceiver = self;\n\n  ackTimeout = 1000;\n\n  module.exports = Postmaster = function(self) {\n    var clear, dominant, pendingResponses, remoteId, send;\n    if (self == null) {\n      self = {};\n    }\n    send = function(data) {\n      var target;\n      target = self.remoteTarget();\n      if ((typeof Worker === \"undefined\" || Worker === null) || target instanceof Worker) {\n        return target.postMessage(data);\n      } else {\n        return target.postMessage(data, \"*\");\n      }\n    };\n    dominant = Postmaster.dominant();\n    if (self.remoteTarget == null) {\n      self.remoteTarget = function() {\n        return dominant;\n      };\n    }\n    if (self.receiver == null) {\n      self.receiver = function() {\n        return defaultReceiver;\n      };\n    }\n    if (self.ackTimeout == null) {\n      self.ackTimeout = function() {\n        return ackTimeout;\n      };\n    }\n    self.receiver().addEventListener(\"message\", function(event) {\n      var data, id, method, params, type, _ref;\n      if (event.source === self.remoteTarget() || !event.source) {\n        data = event.data;\n        type = data.type, method = data.method, params = data.params, id = data.id;\n        switch (type) {\n          case \"ack\":\n            return (_ref = pendingResponses[id]) != null ? _ref.ack = true : void 0;\n          case \"response\":\n            return pendingResponses[id].resolve(data.result);\n          case \"error\":\n            return pendingResponses[id].reject(data.error);\n          case \"message\":\n            send({\n              type: \"ack\",\n              id: id\n            });\n            return Promise.resolve().then(function() {\n              if (typeof self[method] === \"function\") {\n                return self[method].apply(self, params);\n              } else {\n                throw new Error(\"`\" + method + \"` is not a function\");\n              }\n            }).then(function(result) {\n              return send({\n                type: \"response\",\n                id: id,\n                result: result\n              });\n            })[\"catch\"](function(error) {\n              var message;\n              if (typeof error === \"string\") {\n                message = error;\n              } else {\n                message = error.message;\n              }\n              return send({\n                type: \"error\",\n                id: id,\n                error: {\n                  message: message,\n                  stack: error.stack\n                }\n              });\n            });\n        }\n      }\n    });\n    pendingResponses = {};\n    remoteId = 0;\n    clear = function(id) {\n      clearTimeout(pendingResponses[id].timeout);\n      return delete pendingResponses[id];\n    };\n    self.invokeRemote = function() {\n      var method, params;\n      method = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      return new Promise(function(resolve, reject) {\n        var ackWait, e, id, timeout;\n        id = remoteId++;\n        try {\n          send({\n            type: \"message\",\n            method: method,\n            params: params,\n            id: id\n          });\n        } catch (_error) {\n          e = _error;\n          reject(e);\n          return;\n        }\n        ackWait = self.ackTimeout();\n        timeout = setTimeout(function() {\n          var pendingResponse;\n          pendingResponse = pendingResponses[id];\n          if (pendingResponse && !pendingResponse.ack) {\n            clear(id);\n            return reject(new Error(\"No ack received within \" + ackWait));\n          }\n        }, ackWait);\n        return pendingResponses[id] = {\n          timeout: timeout,\n          resolve: function(result) {\n            clear(id);\n            return resolve(result);\n          },\n          reject: function(error) {\n            clear(id);\n            return reject(error);\n          }\n        };\n      });\n    };\n    return self;\n  };\n\n  Postmaster.dominant = function() {\n    if (typeof window !== \"undefined\" && window !== null) {\n      return opener || ((parent !== window) && parent) || void 0;\n    } else {\n      return self;\n    }\n  };\n\n  return Postmaster;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.5.1\"};",
          "type": "blob"
        },
        "test/postmaster": {
          "path": "test/postmaster",
          "content": "(function() {\n  var Postmaster, initWindow, scriptContent;\n\n  Postmaster = require(\"../main\");\n\n  scriptContent = function() {\n    var fn;\n    fn = function() {\n      var pm;\n      pm = Postmaster();\n      pm.echo = function(value) {\n        return value;\n      };\n      pm.throws = function() {\n        throw new Error(\"This always throws\");\n      };\n      return pm.promiseFail = function() {\n        return Promise.reject(new Error(\"This is a failed promise\"));\n      };\n    };\n    return \"var module = {};\\nPostmaster = \" + PACKAGE.distribution.main.content + \";\\n(\" + (fn.toString()) + \")();\";\n  };\n\n  initWindow = function(targetWindow) {\n    return targetWindow.document.write(\"<script>\" + (scriptContent()) + \"<\\/script>\");\n  };\n\n  describe(\"Postmaster\", function() {\n    it(\"should work with openened windows\", function(done) {\n      var childWindow, postmaster;\n      childWindow = open(\"\", null, \"width=200,height=200\");\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 5).then(function(result) {\n        return assert.equal(result, 5);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return childWindow.close();\n      });\n    });\n    it(\"should work with iframes\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call throwing errors\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.invokeRemote(\"throws\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should throwing a useful error when the remote doesn't define the function\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.invokeRemote(\"someUndefinedFunction\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call returning failed promises\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.invokeRemote(\"promiseFail\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should be able to go around the world\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.yolo = function(txt) {\n        return \"heyy \" + txt;\n      };\n      postmaster.invokeRemote(\"invokeRemote\", \"yolo\", \"cool\").then(function(result) {\n        return assert.equal(result, \"heyy cool\");\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should work with web workers\", function(done) {\n      var base, blob, jsUrl, postmaster, worker;\n      blob = new Blob([scriptContent()]);\n      jsUrl = URL.createObjectURL(blob);\n      worker = new Worker(jsUrl);\n      base = {\n        remoteTarget: function() {\n          return worker;\n        },\n        receiver: function() {\n          return worker;\n        }\n      };\n      postmaster = Postmaster(base);\n      postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return worker.terminate();\n      });\n    });\n    it(\"should fail quickly when contacting a window that doesn't support Postmaster\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.invokeRemote(\"echo\", 5)[\"catch\"](function(e) {\n        if (e.message.match(/no ack/i)) {\n          return done();\n        } else {\n          return done(1);\n        }\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    return it(\"should return a rejected promise when unable to send to the target\", function(done) {\n      var postmaster;\n      postmaster = Postmaster({\n        remoteTarget: function() {\n          return null;\n        }\n      });\n      postmaster.invokeRemote(\"yo\")[\"catch\"](function(e) {\n        assert.equal(e.message, \"Cannot read property 'postMessage' of null\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "config": {
        "version": "0.5.1"
      },
      "version": "0.5.1",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.5.1",
        "default_branch": "master",
        "full_name": "distri/postmaster",
        "homepage": null,
        "description": "Send and receive postMessage commands.",
        "html_url": "https://github.com/distri/postmaster",
        "url": "https://api.github.com/repos/distri/postmaster",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "touch-canvas": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "touch-canvas\n============\n\nA canvas you can touch\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"touch_canvas\"\nversion: \"0.3.1\"\ndependencies:\n  \"bindable\": \"distri/bindable:v0.1.0\"\n  \"core\": \"distri/core:v0.6.0\"\n  \"pixie-canvas\": \"distri/pixie-canvas:v0.9.2\"\n",
          "type": "blob"
        },
        "touch_canvas.coffee.md": {
          "path": "touch_canvas.coffee.md",
          "mode": "100644",
          "content": "Touch Canvas\n============\n\nDemo\n----\n\n>     #! demo\n>     paint = (position) ->\n>       x = position.x * canvas.width()\n>       y = position.y * canvas.height()\n>\n>       canvas.drawCircle\n>         radius: 10\n>         color: \"red\"\n>         position:\n>           x: x\n>           y: y\n>\n>     canvas.on \"touch\", (p) ->\n>       paint(p)\n>\n>     canvas.on \"move\", (p) ->\n>       paint(p)\n\n----\n\nImplementation\n--------------\n\nA canvas element that reports mouse and touch events in the range [0, 1].\n\n    Bindable = require \"bindable\"\n    Core = require \"core\"\n    PixieCanvas = require \"pixie-canvas\"\n\nA number really close to 1. We should never actually return 1, but move events\nmay get a little fast and loose with exiting the canvas, so let's play it safe.\n\n    MAX = 0.999999999999\n\n    TouchCanvas = (I={}) ->\n      self = PixieCanvas I\n\n      Core(I, self)\n\n      self.include Bindable\n\n      element = self.element()\n\n      # Keep track of if the mouse is active in the element\n      active = false\n\nWhen we click within the canvas set the value for the position we clicked at.\n\n      listen element, \"mousedown\", (e) ->\n        active = true\n\n        self.trigger \"touch\", localPosition(e)\n\nHandle touch starts\n\n      listen element, \"touchstart\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"touch\", localPosition(touch)\n\nWhen the mouse moves apply a change for each x value in the intervening positions.\n\n      listen element, \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle moves outside of the element.\n\n      listen document, \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle touch moves.\n\n      listen element, \"touchmove\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"move\", localPosition(touch)\n\nHandle releases.\n\n      listen element, \"mouseup\", (e) ->\n        self.trigger \"release\", localPosition(e)\n        active = false\n\n        return\n\nHandle touch ends.\n\n      listen element, \"touchend\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"release\", localPosition(touch)\n\nWhenever the mouse button is released from anywhere, deactivate. Be sure to\ntrigger the release event if the mousedown started within the element.\n\n      listen document, \"mouseup\", (e) ->\n        if active\n          self.trigger \"release\", localPosition(e)\n\n        active = false\n\n        return\n\nHelpers\n-------\n\nProcess touches\n\n      processTouches = (event, fn) ->\n        event.preventDefault()\n\n        if event.type is \"touchend\"\n          # touchend doesn't have any touches, but does have changed touches\n          touches = event.changedTouches\n        else\n          touches = event.touches\n\n        self.debug? Array::map.call touches, ({identifier, pageX, pageY}) ->\n          \"[#{identifier}: #{pageX}, #{pageY} (#{event.type})]\\n\"\n\n        Array::forEach.call touches, fn\n\nLocal event position.\n\n      localPosition = (e) ->\n        rect = element.getBoundingClientRect()\n\n        point =\n          x: clamp (e.pageX - rect.left) / rect.width, 0, MAX\n          y: clamp (e.pageY - rect.top) / rect.height, 0, MAX\n\n        # Add mouse into touch identifiers as 0\n        point.identifier = (e.identifier + 1) or 0\n\n        return point\n\nReturn self\n\n      return self\n\nAttach an event listener to an element\n\n    listen = (element, event, handler) ->\n      element.addEventListener(event, handler, false)\n\nClamp a number to be within a range.\n\n    clamp = (number, min, max) ->\n      Math.min(Math.max(number, min), max)\n\nExport\n\n    module.exports = TouchCanvas\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     TouchCanvas = require \"/touch_canvas\"\n>\n>     Interactive.register \"demo\", ({source, runtimeElement}) ->\n>       canvas = TouchCanvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
          "type": "blob"
        },
        "test/touch.coffee": {
          "path": "test/touch.coffee",
          "mode": "100644",
          "content": "TouchCanvas = require \"../touch_canvas\"\n\nextend = (target, sources...) ->\n  for source in sources\n    for name of source\n      target[name] = source[name]\n\n  return target\n\nfireEvent = (element, type, params={}) ->\n  event = document.createEvent(\"Events\")\n  event.initEvent type, true, false\n  extend event, params\n  element.dispatchEvent event\n\ndescribe \"TouchCanvas\", ->\n  it \"should be creatable\", ->\n    c = TouchCanvas()\n    assert c\n\n    document.body.appendChild(c.element())\n  \n  it \"should fire events\", (done) ->\n    canvas = TouchCanvas()\n\n    canvas.on \"touch\", (e) ->\n      done()\n\n    fireEvent canvas.element(), \"mousedown\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"touch_canvas\",\"version\":\"0.3.1\",\"dependencies\":{\"bindable\":\"distri/bindable:v0.1.0\",\"core\":\"distri/core:v0.6.0\",\"pixie-canvas\":\"distri/pixie-canvas:v0.9.2\"}};",
          "type": "blob"
        },
        "touch_canvas": {
          "path": "touch_canvas",
          "content": "(function() {\n  var Bindable, Core, MAX, PixieCanvas, TouchCanvas, clamp, listen;\n\n  Bindable = require(\"bindable\");\n\n  Core = require(\"core\");\n\n  PixieCanvas = require(\"pixie-canvas\");\n\n  MAX = 0.999999999999;\n\n  TouchCanvas = function(I) {\n    var active, element, localPosition, processTouches, self;\n    if (I == null) {\n      I = {};\n    }\n    self = PixieCanvas(I);\n    Core(I, self);\n    self.include(Bindable);\n    element = self.element();\n    active = false;\n    listen(element, \"mousedown\", function(e) {\n      active = true;\n      return self.trigger(\"touch\", localPosition(e));\n    });\n    listen(element, \"touchstart\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"touch\", localPosition(touch));\n      });\n    });\n    listen(element, \"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(document, \"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(element, \"touchmove\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"move\", localPosition(touch));\n      });\n    });\n    listen(element, \"mouseup\", function(e) {\n      self.trigger(\"release\", localPosition(e));\n      active = false;\n    });\n    listen(element, \"touchend\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"release\", localPosition(touch));\n      });\n    });\n    listen(document, \"mouseup\", function(e) {\n      if (active) {\n        self.trigger(\"release\", localPosition(e));\n      }\n      active = false;\n    });\n    processTouches = function(event, fn) {\n      var touches;\n      event.preventDefault();\n      if (event.type === \"touchend\") {\n        touches = event.changedTouches;\n      } else {\n        touches = event.touches;\n      }\n      if (typeof self.debug === \"function\") {\n        self.debug(Array.prototype.map.call(touches, function(_arg) {\n          var identifier, pageX, pageY;\n          identifier = _arg.identifier, pageX = _arg.pageX, pageY = _arg.pageY;\n          return \"[\" + identifier + \": \" + pageX + \", \" + pageY + \" (\" + event.type + \")]\\n\";\n        }));\n      }\n      return Array.prototype.forEach.call(touches, fn);\n    };\n    localPosition = function(e) {\n      var point, rect;\n      rect = element.getBoundingClientRect();\n      point = {\n        x: clamp((e.pageX - rect.left) / rect.width, 0, MAX),\n        y: clamp((e.pageY - rect.top) / rect.height, 0, MAX)\n      };\n      point.identifier = (e.identifier + 1) || 0;\n      return point;\n    };\n    return self;\n  };\n\n  listen = function(element, event, handler) {\n    return element.addEventListener(event, handler, false);\n  };\n\n  clamp = function(number, min, max) {\n    return Math.min(Math.max(number, min), max);\n  };\n\n  module.exports = TouchCanvas;\n\n}).call(this);\n\n//# sourceURL=touch_canvas.coffee",
          "type": "blob"
        },
        "test/touch": {
          "path": "test/touch",
          "content": "(function() {\n  var TouchCanvas, extend, fireEvent,\n    __slice = [].slice;\n\n  TouchCanvas = require(\"../touch_canvas\");\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  fireEvent = function(element, type, params) {\n    var event;\n    if (params == null) {\n      params = {};\n    }\n    event = document.createEvent(\"Events\");\n    event.initEvent(type, true, false);\n    extend(event, params);\n    return element.dispatchEvent(event);\n  };\n\n  describe(\"TouchCanvas\", function() {\n    it(\"should be creatable\", function() {\n      var c;\n      c = TouchCanvas();\n      assert(c);\n      return document.body.appendChild(c.element());\n    });\n    return it(\"should fire events\", function(done) {\n      var canvas;\n      canvas = TouchCanvas();\n      canvas.on(\"touch\", function(e) {\n        return done();\n      });\n      return fireEvent(canvas.element(), \"mousedown\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/touch.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.3.1",
      "entryPoint": "touch_canvas",
      "repository": {
        "id": 13783983,
        "name": "touch-canvas",
        "full_name": "distri/touch-canvas",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/touch-canvas",
        "description": "A canvas you can touch",
        "fork": false,
        "url": "https://api.github.com/repos/distri/touch-canvas",
        "forks_url": "https://api.github.com/repos/distri/touch-canvas/forks",
        "keys_url": "https://api.github.com/repos/distri/touch-canvas/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/touch-canvas/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/touch-canvas/teams",
        "hooks_url": "https://api.github.com/repos/distri/touch-canvas/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/touch-canvas/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/touch-canvas/events",
        "assignees_url": "https://api.github.com/repos/distri/touch-canvas/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/touch-canvas/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/touch-canvas/tags",
        "blobs_url": "https://api.github.com/repos/distri/touch-canvas/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/touch-canvas/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/touch-canvas/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/touch-canvas/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/touch-canvas/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/touch-canvas/languages",
        "stargazers_url": "https://api.github.com/repos/distri/touch-canvas/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/touch-canvas/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/touch-canvas/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/touch-canvas/subscription",
        "commits_url": "https://api.github.com/repos/distri/touch-canvas/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/touch-canvas/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/touch-canvas/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/touch-canvas/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/touch-canvas/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/touch-canvas/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/touch-canvas/merges",
        "archive_url": "https://api.github.com/repos/distri/touch-canvas/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/touch-canvas/downloads",
        "issues_url": "https://api.github.com/repos/distri/touch-canvas/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/touch-canvas/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/touch-canvas/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/touch-canvas/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/touch-canvas/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/touch-canvas/releases{/id}",
        "created_at": "2013-10-22T19:46:48Z",
        "updated_at": "2013-11-29T20:46:28Z",
        "pushed_at": "2013-11-29T20:46:28Z",
        "git_url": "git://github.com/distri/touch-canvas.git",
        "ssh_url": "git@github.com:distri/touch-canvas.git",
        "clone_url": "https://github.com/distri/touch-canvas.git",
        "svn_url": "https://github.com/distri/touch-canvas",
        "homepage": null,
        "size": 280,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.3.1",
        "defaultBranch": "master"
      },
      "dependencies": {
        "bindable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.coffee.md": {
              "path": "README.coffee.md",
              "mode": "100644",
              "content": "Bindable\n========\n\n    Core = require \"core\"\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self=Core(I)) ->\n      eventCallbacks = {}\n\n      self.extend\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n        on: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          # HACK: Here we annotate the callback function with namespace metadata\n          # This will probably lead to some strange edge cases, but should work fine\n          # for simple cases.\n          if namespace\n            callback.__PIXIE ||= {}\n            callback.__PIXIE[namespace] = true\n\n          eventCallbacks[event] ||= []\n          eventCallbacks[event].push(callback)\n\n          return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n        off: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          if event\n            eventCallbacks[event] ||= []\n\n            if namespace\n              # Select only the callbacks that do not have this namespace metadata\n              eventCallbacks[event] = eventCallbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n            else\n              if callback\n                remove eventCallbacks[event], callback\n              else\n                eventCallbacks[event] = []\n          else if namespace\n            # No event given\n            # Select only the callbacks that do not have this namespace metadata\n            # for any events bound\n            for key, callbacks of eventCallbacks\n              eventCallbacks[key] = callbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n          return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n        trigger: (event, parameters...) ->\n          callbacks = eventCallbacks[event]\n\n          if callbacks\n            callbacks.forEach (callback) ->\n              callback.apply(self, parameters)\n\n          return self\n\nLegacy method aliases.\n\n      self.extend\n        bind: self.on\n        unbind: self.off\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"README\"\nversion: \"0.1.0\"\ndependencies:\n  core: \"distri/core:v0.6.0\"\n",
              "type": "blob"
            },
            "test/bindable.coffee": {
              "path": "test/bindable.coffee",
              "mode": "100644",
              "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#bind and #trigger\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.bind \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#unbind\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.bind \"test\", callback\n    # Unbind specific event\n    o.unbind \"test\", callback\n    o.trigger \"test\"\n\n    o.bind \"test\", callback\n    # Unbind all events\n    o.unbind \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#unbind namespaced\", ->\n    o = Bindable()\n\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\", ->\n    o.trigger \"test\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "README": {
              "path": "README",
              "content": "(function() {\n  var Core, remove,\n    __slice = [].slice;\n\n  Core = require(\"core\");\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    eventCallbacks = {};\n    self.extend({\n      on: function(namespacedEvent, callback) {\n        var event, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (namespace) {\n          callback.__PIXIE || (callback.__PIXIE = {});\n          callback.__PIXIE[namespace] = true;\n        }\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        eventCallbacks[event].push(callback);\n        return self;\n      },\n      off: function(namespacedEvent, callback) {\n        var callbacks, event, key, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (event) {\n          eventCallbacks[event] || (eventCallbacks[event] = []);\n          if (namespace) {\n            eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          } else {\n            if (callback) {\n              remove(eventCallbacks[event], callback);\n            } else {\n              eventCallbacks[event] = [];\n            }\n          }\n        } else if (namespace) {\n          for (key in eventCallbacks) {\n            callbacks = eventCallbacks[key];\n            eventCallbacks[key] = callbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          }\n        }\n        return self;\n      },\n      trigger: function() {\n        var callbacks, event, parameters;\n        event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n        callbacks = eventCallbacks[event];\n        if (callbacks) {\n          callbacks.forEach(function(callback) {\n            return callback.apply(self, parameters);\n          });\n        }\n        return self;\n      }\n    });\n    return self.extend({\n      bind: self.on,\n      unbind: self.off\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=README.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.1.0\",\"dependencies\":{\"core\":\"distri/core:v0.6.0\"}};",
              "type": "blob"
            },
            "test/bindable": {
              "path": "test/bindable",
              "content": "(function() {\n  var Bindable, equal, ok, test;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#bind and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.bind(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#unbind\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.bind(\"test\", callback);\n      o.unbind(\"test\", callback);\n      o.trigger(\"test\");\n      o.bind(\"test\", callback);\n      o.unbind(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    return test(\"#unbind namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/bindable.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.0",
          "entryPoint": "README",
          "repository": {
            "id": 17189431,
            "name": "bindable",
            "full_name": "distri/bindable",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/bindable",
            "description": "Event binding",
            "fork": false,
            "url": "https://api.github.com/repos/distri/bindable",
            "forks_url": "https://api.github.com/repos/distri/bindable/forks",
            "keys_url": "https://api.github.com/repos/distri/bindable/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/bindable/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/bindable/teams",
            "hooks_url": "https://api.github.com/repos/distri/bindable/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/bindable/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/bindable/events",
            "assignees_url": "https://api.github.com/repos/distri/bindable/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/bindable/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/bindable/tags",
            "blobs_url": "https://api.github.com/repos/distri/bindable/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/bindable/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/bindable/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/bindable/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/bindable/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/bindable/languages",
            "stargazers_url": "https://api.github.com/repos/distri/bindable/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/bindable/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/bindable/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/bindable/subscription",
            "commits_url": "https://api.github.com/repos/distri/bindable/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/bindable/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/bindable/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/bindable/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/bindable/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/bindable/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/bindable/merges",
            "archive_url": "https://api.github.com/repos/distri/bindable/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/bindable/downloads",
            "issues_url": "https://api.github.com/repos/distri/bindable/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/bindable/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/bindable/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/bindable/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/bindable/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/bindable/releases{/id}",
            "created_at": "2014-02-25T21:50:35Z",
            "updated_at": "2014-02-25T21:50:35Z",
            "pushed_at": "2014-02-25T21:50:35Z",
            "git_url": "git://github.com/distri/bindable.git",
            "ssh_url": "git@github.com:distri/bindable.git",
            "clone_url": "https://github.com/distri/bindable.git",
            "svn_url": "https://github.com/distri/bindable",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.0",
            "defaultBranch": "master"
          },
          "dependencies": {
            "core": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "core\n====\n\nAn object extension system.\n",
                  "type": "blob"
                },
                "core.coffee.md": {
                  "path": "core.coffee.md",
                  "mode": "100644",
                  "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
                  "type": "blob"
                },
                "test/core.coffee": {
                  "path": "test/core.coffee",
                  "mode": "100644",
                  "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "core": {
                  "path": "core",
                  "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
                  "type": "blob"
                },
                "test/core": {
                  "path": "test/core",
                  "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.6.0",
              "entryPoint": "core",
              "repository": {
                "id": 13567517,
                "name": "core",
                "full_name": "distri/core",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/core",
                "description": "An object extension system.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/core",
                "forks_url": "https://api.github.com/repos/distri/core/forks",
                "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/core/teams",
                "hooks_url": "https://api.github.com/repos/distri/core/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/core/events",
                "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/core/tags",
                "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/core/languages",
                "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/core/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/core/subscription",
                "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/core/merges",
                "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/core/downloads",
                "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
                "created_at": "2013-10-14T17:04:33Z",
                "updated_at": "2013-12-24T00:49:21Z",
                "pushed_at": "2013-10-14T23:49:11Z",
                "git_url": "git://github.com/distri/core.git",
                "ssh_url": "git@github.com:distri/core.git",
                "clone_url": "https://github.com/distri/core.git",
                "svn_url": "https://github.com/distri/core",
                "homepage": null,
                "size": 592,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.6.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            }
          }
        },
        "core": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "core\n====\n\nAn object extension system.\n",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "mode": "100644",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
              "type": "blob"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "mode": "100644",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.6.0",
          "entryPoint": "core",
          "repository": {
            "id": 13567517,
            "name": "core",
            "full_name": "distri/core",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/core",
            "description": "An object extension system.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/core",
            "forks_url": "https://api.github.com/repos/distri/core/forks",
            "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/core/teams",
            "hooks_url": "https://api.github.com/repos/distri/core/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/core/events",
            "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/core/tags",
            "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/core/languages",
            "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/core/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/core/subscription",
            "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/core/merges",
            "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/core/downloads",
            "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
            "created_at": "2013-10-14T17:04:33Z",
            "updated_at": "2013-12-24T00:49:21Z",
            "pushed_at": "2013-10-14T23:49:11Z",
            "git_url": "git://github.com/distri/core.git",
            "ssh_url": "git@github.com:distri/core.git",
            "clone_url": "https://github.com/distri/core.git",
            "svn_url": "https://github.com/distri/core",
            "homepage": null,
            "size": 592,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.6.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "pixie-canvas": {
          "source": {
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"pixie_canvas\"\nversion: \"0.9.2\"\n",
              "type": "blob"
            },
            "pixie_canvas.coffee.md": {
              "path": "pixie_canvas.coffee.md",
              "mode": "100644",
              "content": "Pixie Canvas\n============\n\nPixieCanvas provides a convenient wrapper for working with Context2d.\n\nMethods try to be as flexible as possible as to what arguments they take.\n\nNon-getter methods return `this` for method chaining.\n\n    TAU = 2 * Math.PI\n\n    module.exports = (options={}) ->\n        defaults options,\n          width: 400\n          height: 400\n          init: ->\n\n        canvas = document.createElement \"canvas\"\n        canvas.width = options.width\n        canvas.height = options.height\n\n        context = undefined\n\n        self =\n\n`clear` clears the entire canvas (or a portion of it).\n\nTo clear the entire canvas use `canvas.clear()`\n\n>     #! paint\n>     # Set up: Fill canvas with blue\n>     canvas.fill(\"blue\")\n>\n>     # Clear a portion of the canvas\n>     canvas.clear\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n\n          clear: ({x, y, width, height}={}) ->\n            x ?= 0\n            y ?= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            context.clearRect(x, y, width, height)\n\n            return this\n\nFills the entire canvas (or a specified section of it) with\nthe given color.\n\n>     #! paint\n>     # Paint the town (entire canvas) red\n>     canvas.fill \"red\"\n>\n>     # Fill a section of the canvas white (#FFF)\n>     canvas.fill\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#FFF\"\n\n          fill: (color={}) ->\n            unless (typeof color is \"string\") or color.channels\n              {x, y, width, height, bounds, color} = color\n\n            {x, y, width, height} = bounds if bounds\n\n            x ||= 0\n            y ||= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            @fillColor(color)\n            context.fillRect(x, y, width, height)\n\n            return this\n\nA direct map to the Context2d draw image. `GameObject`s\nthat implement drawable will have this wrapped up nicely,\nso there is a good chance that you will not have to deal with\nit directly.\n\n>     #! paint\n>     $ \"<img>\",\n>       src: \"https://secure.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045\"\n>       load: ->\n>         canvas.drawImage(this, 25, 25)\n\n          drawImage: (args...) ->\n            context.drawImage(args...)\n\n            return this\n\nDraws a circle at the specified position with the specified\nradius and color.\n\n>     #! paint\n>     # Draw a large orange circle\n>     canvas.drawCircle\n>       radius: 30\n>       position: Point(100, 75)\n>       color: \"orange\"\n>\n>     # You may also set a stroke\n>     canvas.drawCircle\n>       x: 25\n>       y: 50\n>       radius: 10\n>       color: \"blue\"\n>       stroke:\n>         color: \"red\"\n>         width: 1\n\nYou can pass in circle objects as well.\n\n>     #! paint\n>     # Create a circle object to set up the next examples\n>     circle =\n>       radius: 20\n>       x: 50\n>       y: 50\n>\n>     # Draw a given circle in yellow\n>     canvas.drawCircle\n>       circle: circle\n>       color: \"yellow\"\n>\n>     # Draw the circle in green at a different position\n>     canvas.drawCircle\n>       circle: circle\n>       position: Point(25, 75)\n>       color: \"green\"\n\nYou may set a stroke, or even pass in only a stroke to draw an unfilled circle.\n\n>     #! paint\n>     # Draw an outline circle in purple.\n>     canvas.drawCircle\n>       x: 50\n>       y: 75\n>       radius: 10\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n>\n\n          drawCircle: ({x, y, radius, position, color, stroke, circle}) ->\n            {x, y, radius} = circle if circle\n            {x, y} = position if position\n\n            radius = 0 if radius < 0\n\n            context.beginPath()\n            context.arc(x, y, radius, 0, TAU, true)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return this\n\nDraws a rectangle at the specified position with given\nwidth and height. Optionally takes a position, bounds\nand color argument.\n\n\n          drawRect: ({x, y, width, height, position, bounds, color, stroke}) ->\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            if color\n              @fillColor(color)\n              context.fillRect(x, y, width, height)\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.strokeRect(x, y, width, height)\n\n            return @\n\n>     #! paint\n>     # Draw a red rectangle using x, y, width and height\n>     canvas.drawRect\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#F00\"\n\n----\n\nYou can mix and match position, witdth and height.\n\n>     #! paint\n>     canvas.drawRect\n>       position: Point(0, 0)\n>       width: 50\n>       height: 50\n>       color: \"blue\"\n>       stroke:\n>         color: \"orange\"\n>         width: 3\n\n----\n\nA bounds can be reused to draw multiple rectangles.\n\n>     #! paint\n>     bounds =\n>       x: 100\n>       y: 0\n>       width: 100\n>       height: 100\n>\n>     # Draw a purple rectangle using bounds\n>     canvas.drawRect\n>       bounds: bounds\n>       color: \"green\"\n>\n>     # Draw the outline of the same bounds, but at a different position\n>     canvas.drawRect\n>       bounds: bounds\n>       position: Point(0, 50)\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n\n----\n\nDraw a line from `start` to `end`.\n\n>     #! paint\n>     # Draw a sweet diagonal\n>     canvas.drawLine\n>       start: Point(0, 0)\n>       end: Point(200, 200)\n>       color: \"purple\"\n>\n>     # Draw another sweet diagonal\n>     canvas.drawLine\n>       start: Point(200, 0)\n>       end: Point(0, 200)\n>       color: \"red\"\n>       width: 6\n>\n>     # Now draw a sweet horizontal with a direction and a length\n>     canvas.drawLine\n>       start: Point(0, 100)\n>       length: 200\n>       direction: Point(1, 0)\n>       color: \"orange\"\n\n          drawLine: ({start, end, width, color, direction, length}) ->\n            width ||= 3\n\n            if direction\n              end = direction.norm(length).add(start)\n\n            @lineWidth(width)\n            @strokeColor(color)\n\n            context.beginPath()\n            context.moveTo(start.x, start.y)\n            context.lineTo(end.x, end.y)\n            context.closePath()\n            context.stroke()\n\n            return this\n\nDraw a polygon.\n\n>     #! paint\n>     # Draw a sweet rhombus\n>     canvas.drawPoly\n>       points: [\n>         Point(50, 25)\n>         Point(75, 50)\n>         Point(50, 75)\n>         Point(25, 50)\n>       ]\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawPoly: ({points, color, stroke}) ->\n            context.beginPath()\n            points.forEach (point, i) ->\n              if i == 0\n                context.moveTo(point.x, point.y)\n              else\n                context.lineTo(point.x, point.y)\n            context.lineTo points[0].x, points[0].y\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return @\n\nDraw a rounded rectangle.\n\nAdapted from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html\n\n>     #! paint\n>     # Draw a purple rounded rectangle with a red outline\n>     canvas.drawRoundRect\n>       position: Point(25, 25)\n>       radius: 10\n>       width: 150\n>       height: 100\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawRoundRect: ({x, y, width, height, radius, position, bounds, color, stroke}) ->\n            radius = 5 unless radius?\n\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            context.beginPath()\n            context.moveTo(x + radius, y)\n            context.lineTo(x + width - radius, y)\n            context.quadraticCurveTo(x + width, y, x + width, y + radius)\n            context.lineTo(x + width, y + height - radius)\n            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)\n            context.lineTo(x + radius, y + height)\n            context.quadraticCurveTo(x, y + height, x, y + height - radius)\n            context.lineTo(x, y + radius)\n            context.quadraticCurveTo(x, y, x + radius, y)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @lineWidth(stroke.width)\n              @strokeColor(stroke.color)\n              context.stroke()\n\n            return this\n\nDraws text on the canvas at the given position, in the given color.\nIf no color is given then the previous fill color is used.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: '#eee'\n>\n>     # A line to indicate the baseline\n>     canvas.drawLine\n>       start: Point(25, 50)\n>       end: Point(125, 50)\n>       color: \"#333\"\n>       width: 1\n>\n>     # Draw some text, note the position of the baseline\n>     canvas.drawText\n>       position: Point(25, 50)\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n\n\n          drawText: ({x, y, text, position, color, font}) ->\n            {x, y} = position if position\n\n            @fillColor(color)\n            @font(font) if font\n            context.fillText(text, x, y)\n\n            return this\n\nCenters the given text on the canvas at the given y position. An x position\nor point position can also be given in which case the text is centered at the\nx, y or position value specified.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: \"#eee\"\n>\n>     # Center text on the screen at y value 25\n>     canvas.centerText\n>       y: 25\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n>\n>     # Center text at point (75, 75)\n>     canvas.centerText\n>       position: Point(75, 75)\n>       color: \"green\"\n>       text: \"take this\"\n\n          centerText: ({text, x, y, position, color, font}) ->\n            {x, y} = position if position\n\n            x = canvas.width / 2 unless x?\n\n            textWidth = @measureText(text)\n\n            @drawText {\n              text\n              color\n              font\n              x: x - (textWidth) / 2\n              y\n            }\n\nSetting the fill color:\n\n`canvas.fillColor(\"#FF0000\")`\n\nPassing no arguments returns the fillColor:\n\n`canvas.fillColor() # => \"#FF000000\"`\n\nYou can also pass a Color object:\n\n`canvas.fillColor(Color('sky blue'))`\n\n          fillColor: (color) ->\n            if color\n              if color.channels\n                context.fillStyle = color.toString()\n              else\n                context.fillStyle = color\n\n              return @\n            else\n              return context.fillStyle\n\nSetting the stroke color:\n\n`canvas.strokeColor(\"#FF0000\")`\n\nPassing no arguments returns the strokeColor:\n\n`canvas.strokeColor() # => \"#FF0000\"`\n\nYou can also pass a Color object:\n\n`canvas.strokeColor(Color('sky blue'))`\n\n          strokeColor: (color) ->\n            if color\n              if color.channels\n                context.strokeStyle = color.toString()\n              else\n                context.strokeStyle = color\n\n              return this\n            else\n              return context.strokeStyle\n\nDetermine how wide some text is.\n\n`canvas.measureText('Hello World!') # => 55`\n\nIt may have accuracy issues depending on the font used.\n\n          measureText: (text) ->\n            context.measureText(text).width\n\nPasses this canvas to the block with the given matrix transformation\napplied. All drawing methods called within the block will draw\ninto the canvas with the transformation applied. The transformation\nis removed at the end of the block, even if the block throws an error.\n\n          withTransform: (matrix, block) ->\n            context.save()\n\n            context.transform(\n              matrix.a,\n              matrix.b,\n              matrix.c,\n              matrix.d,\n              matrix.tx,\n              matrix.ty\n            )\n\n            try\n              block(this)\n            finally\n              context.restore()\n\n            return this\n\nStraight proxy to context `putImageData` method.\n\n          putImageData: (args...) ->\n            context.putImageData(args...)\n\n            return this\n\nContext getter.\n\n          context: ->\n            context\n\nGetter for the actual html canvas element.\n\n          element: ->\n            canvas\n\nStraight proxy to context pattern creation.\n\n          createPattern: (image, repitition) ->\n            context.createPattern(image, repitition)\n\nSet a clip rectangle.\n\n          clip: (x, y, width, height) ->\n            context.beginPath()\n            context.rect(x, y, width, height)\n            context.clip()\n\n            return this\n\nGenerate accessors that get properties from the context object.\n\n        contextAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                context[attr] = newVal\n                return @\n              else\n                context[attr]\n\n        contextAttrAccessor(\n          \"font\",\n          \"globalAlpha\",\n          \"globalCompositeOperation\",\n          \"lineWidth\",\n          \"textAlign\",\n        )\n\nGenerate accessors that get properties from the canvas object.\n\n        canvasAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                canvas[attr] = newVal\n                return @\n              else\n                canvas[attr]\n\n        canvasAttrAccessor(\n          \"height\",\n          \"width\",\n        )\n\n        context = canvas.getContext('2d')\n\n        options.init(self)\n\n        return self\n\nHelpers\n-------\n\nFill in default properties for an object, setting them only if they are not\nalready present.\n\n    defaults = (target, objects...) ->\n      for object in objects\n        for name of object\n          unless target.hasOwnProperty(name)\n            target[name] = object[name]\n\n      return target\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     Canvas = require \"/pixie_canvas\"\n>\n>     window.Point ?= (x, y) ->\n>       x: x\n>       y: y\n>\n>     Interactive.register \"paint\", ({source, runtimeElement}) ->\n>       canvas = Canvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
              "type": "blob"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "mode": "100644",
              "content": "Canvas = require \"../pixie_canvas\"\n\ndescribe \"pixie canvas\", ->\n  it \"Should create a canvas\", ->\n    canvas = Canvas\n      width: 400\n      height: 150\n\n    assert canvas\n\n    assert canvas.width() is 400\n",
              "type": "blob"
            }
          },
          "distribution": {
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"pixie_canvas\",\"version\":\"0.9.2\"};",
              "type": "blob"
            },
            "pixie_canvas": {
              "path": "pixie_canvas",
              "content": "(function() {\n  var TAU, defaults,\n    __slice = [].slice;\n\n  TAU = 2 * Math.PI;\n\n  module.exports = function(options) {\n    var canvas, canvasAttrAccessor, context, contextAttrAccessor, self;\n    if (options == null) {\n      options = {};\n    }\n    defaults(options, {\n      width: 400,\n      height: 400,\n      init: function() {}\n    });\n    canvas = document.createElement(\"canvas\");\n    canvas.width = options.width;\n    canvas.height = options.height;\n    context = void 0;\n    self = {\n      clear: function(_arg) {\n        var height, width, x, y, _ref;\n        _ref = _arg != null ? _arg : {}, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;\n        if (x == null) {\n          x = 0;\n        }\n        if (y == null) {\n          y = 0;\n        }\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        context.clearRect(x, y, width, height);\n        return this;\n      },\n      fill: function(color) {\n        var bounds, height, width, x, y, _ref;\n        if (color == null) {\n          color = {};\n        }\n        if (!((typeof color === \"string\") || color.channels)) {\n          _ref = color, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, bounds = _ref.bounds, color = _ref.color;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        x || (x = 0);\n        y || (y = 0);\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        this.fillColor(color);\n        context.fillRect(x, y, width, height);\n        return this;\n      },\n      drawImage: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.drawImage.apply(context, args);\n        return this;\n      },\n      drawCircle: function(_arg) {\n        var circle, color, position, radius, stroke, x, y;\n        x = _arg.x, y = _arg.y, radius = _arg.radius, position = _arg.position, color = _arg.color, stroke = _arg.stroke, circle = _arg.circle;\n        if (circle) {\n          x = circle.x, y = circle.y, radius = circle.radius;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (radius < 0) {\n          radius = 0;\n        }\n        context.beginPath();\n        context.arc(x, y, radius, 0, TAU, true);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRect: function(_arg) {\n        var bounds, color, height, position, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (color) {\n          this.fillColor(color);\n          context.fillRect(x, y, width, height);\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.strokeRect(x, y, width, height);\n        }\n        return this;\n      },\n      drawLine: function(_arg) {\n        var color, direction, end, length, start, width;\n        start = _arg.start, end = _arg.end, width = _arg.width, color = _arg.color, direction = _arg.direction, length = _arg.length;\n        width || (width = 3);\n        if (direction) {\n          end = direction.norm(length).add(start);\n        }\n        this.lineWidth(width);\n        this.strokeColor(color);\n        context.beginPath();\n        context.moveTo(start.x, start.y);\n        context.lineTo(end.x, end.y);\n        context.closePath();\n        context.stroke();\n        return this;\n      },\n      drawPoly: function(_arg) {\n        var color, points, stroke;\n        points = _arg.points, color = _arg.color, stroke = _arg.stroke;\n        context.beginPath();\n        points.forEach(function(point, i) {\n          if (i === 0) {\n            return context.moveTo(point.x, point.y);\n          } else {\n            return context.lineTo(point.x, point.y);\n          }\n        });\n        context.lineTo(points[0].x, points[0].y);\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRoundRect: function(_arg) {\n        var bounds, color, height, position, radius, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, radius = _arg.radius, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (radius == null) {\n          radius = 5;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        context.beginPath();\n        context.moveTo(x + radius, y);\n        context.lineTo(x + width - radius, y);\n        context.quadraticCurveTo(x + width, y, x + width, y + radius);\n        context.lineTo(x + width, y + height - radius);\n        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);\n        context.lineTo(x + radius, y + height);\n        context.quadraticCurveTo(x, y + height, x, y + height - radius);\n        context.lineTo(x, y + radius);\n        context.quadraticCurveTo(x, y, x + radius, y);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.lineWidth(stroke.width);\n          this.strokeColor(stroke.color);\n          context.stroke();\n        }\n        return this;\n      },\n      drawText: function(_arg) {\n        var color, font, position, text, x, y;\n        x = _arg.x, y = _arg.y, text = _arg.text, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        this.fillColor(color);\n        if (font) {\n          this.font(font);\n        }\n        context.fillText(text, x, y);\n        return this;\n      },\n      centerText: function(_arg) {\n        var color, font, position, text, textWidth, x, y;\n        text = _arg.text, x = _arg.x, y = _arg.y, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (x == null) {\n          x = canvas.width / 2;\n        }\n        textWidth = this.measureText(text);\n        return this.drawText({\n          text: text,\n          color: color,\n          font: font,\n          x: x - textWidth / 2,\n          y: y\n        });\n      },\n      fillColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.fillStyle = color.toString();\n          } else {\n            context.fillStyle = color;\n          }\n          return this;\n        } else {\n          return context.fillStyle;\n        }\n      },\n      strokeColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.strokeStyle = color.toString();\n          } else {\n            context.strokeStyle = color;\n          }\n          return this;\n        } else {\n          return context.strokeStyle;\n        }\n      },\n      measureText: function(text) {\n        return context.measureText(text).width;\n      },\n      withTransform: function(matrix, block) {\n        context.save();\n        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);\n        try {\n          block(this);\n        } finally {\n          context.restore();\n        }\n        return this;\n      },\n      putImageData: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.putImageData.apply(context, args);\n        return this;\n      },\n      context: function() {\n        return context;\n      },\n      element: function() {\n        return canvas;\n      },\n      createPattern: function(image, repitition) {\n        return context.createPattern(image, repitition);\n      },\n      clip: function(x, y, width, height) {\n        context.beginPath();\n        context.rect(x, y, width, height);\n        context.clip();\n        return this;\n      }\n    };\n    contextAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            context[attr] = newVal;\n            return this;\n          } else {\n            return context[attr];\n          }\n        };\n      });\n    };\n    contextAttrAccessor(\"font\", \"globalAlpha\", \"globalCompositeOperation\", \"lineWidth\", \"textAlign\");\n    canvasAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            canvas[attr] = newVal;\n            return this;\n          } else {\n            return canvas[attr];\n          }\n        };\n      });\n    };\n    canvasAttrAccessor(\"height\", \"width\");\n    context = canvas.getContext('2d');\n    options.init(self);\n    return self;\n  };\n\n  defaults = function() {\n    var name, object, objects, target, _i, _len;\n    target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = objects.length; _i < _len; _i++) {\n      object = objects[_i];\n      for (name in object) {\n        if (!target.hasOwnProperty(name)) {\n          target[name] = object[name];\n        }\n      }\n    }\n    return target;\n  };\n\n}).call(this);\n\n//# sourceURL=pixie_canvas.coffee",
              "type": "blob"
            },
            "test/test": {
              "path": "test/test",
              "content": "(function() {\n  var Canvas;\n\n  Canvas = require(\"../pixie_canvas\");\n\n  describe(\"pixie canvas\", function() {\n    return it(\"Should create a canvas\", function() {\n      var canvas;\n      canvas = Canvas({\n        width: 400,\n        height: 150\n      });\n      assert(canvas);\n      return assert(canvas.width() === 400);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.9.2",
          "entryPoint": "pixie_canvas",
          "repository": {
            "id": 12096899,
            "name": "pixie-canvas",
            "full_name": "distri/pixie-canvas",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/pixie-canvas",
            "description": "A pretty ok HTML5 canvas wrapper",
            "fork": false,
            "url": "https://api.github.com/repos/distri/pixie-canvas",
            "forks_url": "https://api.github.com/repos/distri/pixie-canvas/forks",
            "keys_url": "https://api.github.com/repos/distri/pixie-canvas/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/pixie-canvas/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/pixie-canvas/teams",
            "hooks_url": "https://api.github.com/repos/distri/pixie-canvas/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/pixie-canvas/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/pixie-canvas/events",
            "assignees_url": "https://api.github.com/repos/distri/pixie-canvas/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/pixie-canvas/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/pixie-canvas/tags",
            "blobs_url": "https://api.github.com/repos/distri/pixie-canvas/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/pixie-canvas/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/pixie-canvas/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/pixie-canvas/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/pixie-canvas/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/pixie-canvas/languages",
            "stargazers_url": "https://api.github.com/repos/distri/pixie-canvas/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/pixie-canvas/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/pixie-canvas/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/pixie-canvas/subscription",
            "commits_url": "https://api.github.com/repos/distri/pixie-canvas/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/pixie-canvas/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/pixie-canvas/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/pixie-canvas/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/pixie-canvas/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/pixie-canvas/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/pixie-canvas/merges",
            "archive_url": "https://api.github.com/repos/distri/pixie-canvas/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/pixie-canvas/downloads",
            "issues_url": "https://api.github.com/repos/distri/pixie-canvas/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/pixie-canvas/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/pixie-canvas/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/pixie-canvas/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/pixie-canvas/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/pixie-canvas/releases{/id}",
            "created_at": "2013-08-14T01:15:34Z",
            "updated_at": "2013-11-29T20:54:07Z",
            "pushed_at": "2013-11-29T20:54:07Z",
            "git_url": "git://github.com/distri/pixie-canvas.git",
            "ssh_url": "git@github.com:distri/pixie-canvas.git",
            "clone_url": "https://github.com/distri/pixie-canvas.git",
            "svn_url": "https://github.com/distri/pixie-canvas",
            "homepage": null,
            "size": 664,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 1,
            "forks": 0,
            "open_issues": 1,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.9.2",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    },
    "ui": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "MIT License\n\nCopyright (c) 2016 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "NOTES.md": {
          "path": "NOTES.md",
          "content": "Notes\n=====\n\nWrapping simple promise returning handlers around the modal should make it easy\nto prompt.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "UI\n===\n\nArtisanal User Interface\n\nMenus\n-----\n\n- Context Menu\n- Menu Bar\n- Nested submenus\n\nSimple DSL for creating menus and binding to handlers.\n\n```\n{ContextMenu} = require \"ui\"\n\ncontextMenu = ContextMenu()\ndocument.body.appendChild contextMenu.element\n```\n\nModals\n------\n\n- Alert\n- Confirm\n- Prompt\n\nPromise returning prompts, confirms, etc.\n\nActions\n-------\n\nHotkeys, help text, icons, enabled/disabled states.\n\nZ-Indexes\n---------\n\nIs there a sane way to do z-indexes? Right now I'm just listing them.\n\nModal: 1000\nContext Menu: 2000\n",
          "mode": "100644",
          "type": "blob"
        },
        "TODO.md": {
          "path": "TODO.md",
          "content": "TODO\n====\n\nModals\n  ✔️Alert\n  ✔️Prompt\n  ✔Confirm\n  ✔General\n\nMenus\n  ✔️Menu Bar\n  ✔️Context Menu\n  ✔️Keyboard Navigation (Up, Down, Left, Right)\n  ✔️Accelerator Keys\n  ✔️Display Hotkeys\n  ✔️Indicate Enabled/Disabled\n  ✔️Nested Submenus\n\nToaster/Popup Notifications\n  Animations\n  Native notifications?\n\nGlobal Hotkeys\n\nLoader / Progress\n\nDocumentation\n  Modals\n  Menus\n  Context Menus\n  Hotkeys\n  Windows\n\nExamples\n  Modal Progress Bar\n\nWindows\n  ✔Draggable\n  ✔Resizable (Need to add invisible overlay when moving the mouse so iframes don't jank up the resize)\n  ✔Close\n  Maximize\n  ✔Z-Index\n  Option Menu\n\nTOMAYBE\n=======\n\nTile Windows\n\nForms\n\nTables/Grids\n\nLists\n\nFile Trees\n",
          "mode": "100644",
          "type": "blob"
        },
        "action.coffee": {
          "path": "action.coffee",
          "content": "###\nAction\n======\n\nActions have a function to call, a hotkey, and a function that determines\nwhether or not they are disabled. This is so we can present them in the UI for\nmenus.\n\nThe hotkey is for display purposes only and needs to be listened to by a\nseparate mechanism to perform. [TODO] The action can be executed like a regular\nfunction (instead of needing to use call).\n\nActions may have icons and help text as well.\n\n###\n\nObservable = require \"observable\"\n\n# TODO: This is just a test for toggling disabled state\nmodule.exports = (fn, hotkey) ->\n  disabled = Observable false\n  setInterval ->\n    disabled.toggle()\n  , 1000\n\n  disabled: disabled\n  hotkey: ->\n    hotkey\n  call: (args...) ->\n    fn.call(args...)\n",
          "mode": "100644",
          "type": "blob"
        },
        "demo.coffee": {
          "path": "demo.coffee",
          "content": "{ContextMenu, MenuBar, Modal, Observable, Util:{parseMenu}, Progress, Style, Table, Window} = require \"./export\"\n\n{o} = require \"./util\"\n\nnotepadMenuText = require \"./samples/notepad-menu\"\nnotepadMenuParsed = parseMenu notepadMenuText\n\nFormSampleTemplate = require \"./samples/test-form\"\n\nstyle = document.createElement \"style\"\nstyle.innerHTML = Style.all\ndocument.head.appendChild style\n\nsampleMenuParsed = parseMenu \"\"\"\n  [M]odal\n    [A]lert\n    [C]onfirm\n    [P]rompt\n    [F]orm\n    P[r]ogress\n  [T]est Nesting\n    Test[1]\n      Hello\n      Wat\n    Test[2]\n      [N]ested\n      -----\n      [R]ad\n        So Rad\n        =====\n        Hella\n          Hecka\n            Super Hecka\n              Wicked\n          ---\n          -\n          -\n          ==\n  [W]indow\n    New [I]mage -> newImage\n    New [P]ixel -> newPixel\n    New [T]ext -> newText\n    New [S]preadsheet -> newSheet\n\"\"\"\n{element} = MenuBar\n  items: sampleMenuParsed,\n  handlers:\n    alert: ->\n      Modal.alert \"yolo\"\n    prompt: ->\n      Modal.prompt \"Pretty cool, eh?\", \"Yeah!\"\n      .then console.log\n    confirm: ->\n      Modal.confirm \"Jawsome!\"\n      .then console.log\n    form: ->\n      Modal.form FormSampleTemplate()\n      .then console.log\n    progress: ->\n      initialMessage = \"Reticulating splines\"\n      progressView = Progress\n        value: 0\n        max: 2\n        message: initialMessage\n\n      Modal.show progressView.element,\n        cancellable: false\n\n      intervalId = setInterval ->\n        newValue = progressView.value() + 1/60\n        ellipsesCount = Math.floor(newValue * 4) % 4\n        ellipses = [0...ellipsesCount].map ->\n          \".\"\n        .join(\"\")\n        progressView.value(newValue)\n        progressView.message(initialMessage + ellipses)\n        if newValue > 2\n          clearInterval intervalId\n          Modal.hide()\n      , 15\n    newImage: ->\n      img = document.createElement \"img\"\n      img.src = \"https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/pI1mvEvxcXJk4mNHNUW-kZsNJsrPDXcAtgguyYETRXQ\"\n\n      addWindow\n        title: \"Yoo\"\n        content: img\n        iconEmoji: \"💼\"\n\n    newPixel: ->\n      frame = document.createElement \"iframe\"\n      frame.src = \"https://danielx.net/pixel-editor/embedded/\"\n\n      addWindow\n        title: \"Pixel\"\n        content: frame\n\n    newText: ->\n      textarea = document.createElement \"textarea\"\n\n      addWindow\n        title: \"Notepad.exe\"\n        content: textarea\n\n    newSheet: ->\n      data = [0...5].map (i) ->\n        id: i\n        name: \"yolo\"\n        color: \"#FF0000\"\n\n      InputTemplate = require \"./templates/input\"\n      RowElement = (datum) ->\n        tr = document.createElement \"tr\"\n        types = [\n          \"number\"\n          \"text\"\n          \"color\"\n        ]\n\n        Object.keys(datum).forEach (key, i) ->\n          td = document.createElement \"td\"\n          td.appendChild InputTemplate\n            value: o datum, key\n            type: types[i]\n\n          tr.appendChild td\n\n        return tr\n\n      {element} = tableView = Table {\n        data\n        RowElement\n      }\n\n      menuBar = MenuBar\n        items: parseMenu \"\"\"\n          Insert\n            Row -> insertRow\n          Help\n            About\n        \"\"\"\n        handlers:\n          about: ->\n            Modal.alert \"Spreadsheet v0.0.1 by Daniel X Moore\"\n          insertRow: ->\n            data.push\n              id: 50\n              name: \"new\"\n              color: \"#FF00FF\"\n\n            tableView.render()\n\n      addWindow\n        title: \"Spreadsheet [DEMO VERSION]\"\n        content: element\n        menuBar: menuBar.element\n\ndocument.body.appendChild element\n\ndesktop = document.createElement \"desktop\"\ndocument.body.appendChild desktop\n\ncontextMenu = ContextMenu\n  items: sampleMenuParsed[1][1]\n  handlers: {}\n\ndesktop.addEventListener \"contextmenu\", (e) ->\n  if e.target is desktop\n    e.preventDefault()\n\n    contextMenu.display\n      inElement: document.body\n      x: e.pageX\n      y: e.pageY\n\naddWindow = (params) ->\n  windowView = Window params\n\n  desktop.appendChild windowView.element\n\n  return windowView\n",
          "mode": "100644",
          "type": "blob"
        },
        "export.coffee": {
          "path": "export.coffee",
          "content": "Action = require \"./action\"\nContextMenuView = require \"./views/context-menu\"\nModal = require \"./modal\"\nMenuView = require \"./views/menu\"\nMenuBarView = require \"./views/menu-bar\"\nMenuItemView = require \"./views/menu-item\"\nObservable = require \"observable\"\nProgressView = require \"./views/progress\"\nStyle = require \"./style\"\nTableView = require \"./views/table\"\nWindowView = require \"./views/window\"\n\nmodule.exports = {\n  Action: Action\n  Bindable: require \"bindable\"\n  ContextMenu: ContextMenuView\n  Modal\n  Menu: MenuView\n  MenuBar: MenuBarView\n  MenuItem: MenuItemView\n  Observable: Observable\n  Progress: ProgressView\n  Style\n  Table: TableView\n  Util:\n    parseMenu: require \"./lib/indent-parse\"\n  Window: WindowView\n}\n",
          "mode": "100644",
          "type": "blob"
        },
        "hotkeys.coffee": {
          "path": "hotkeys.coffee",
          "content": "###\nHotkeys\n=======\n\nBind hotkeys\n\n    Hotkey = require \"hotkey\"\n\n    Hotkey \"ctrl+r\", ->\n      alert \"radical!\"\n\nWe'd like to be able to generate a list of hotkeys with descriptions.\n\nQuestions\n---------\n\nShould we just use Mousetrap?\n\nMaybe, but it may have different semantics with preventDefault/defaultPrevented.\n\nShould we allow binding to specific elements?\n\nImagine a windowing OS where non-iframe apps are inside draggable windows. We'd\nlike to have each 'app' able to have its own hotkeys and at the same time have\nglobal OS level hotkeys.\n\nShould `defaultPrevented` prevent executing the hotkey action? Yes\n\nShould executing a hotkey preventDefault? Yes\n\n###\n\n# TODO: This is just a rough outline\nmodule.exports = (element) ->\n  handlers = {}\n\n  handle = (event) ->\n    {key} = event\n\n    modifiersActive = [\"alt\", \"ctrl\", \"meta\", \"shift\"].filter (modifier) ->\n      event[\"#{modifier}Key\"]\n\n    combo = modifiersActive.concat(key).join(\"+\")\n\n    # TODO: Don't trigger \"plain\" events in input/text fields\n\n    handlers[combo]?(e)\n",
          "mode": "100644",
          "type": "blob"
        },
        "lib/assert.coffee": {
          "path": "lib/assert.coffee",
          "content": "module.exports = (condition, message) ->\n  throw new Error message unless condition\n",
          "mode": "100644",
          "type": "blob"
        },
        "lib/indent-parse.coffee": {
          "path": "lib/indent-parse.coffee",
          "content": "top = (stack) ->\n  stack[stack.length - 1]\n\nparse = (source) ->\n  stack = [[]]\n  indentation = /^(  )*/\n  depth = 0\n\n  source.split(\"\\n\").forEach (line, lineNumber) ->\n    match = line.match(indentation)[0]\n    text = line.replace(match, \"\")\n    newDepth = match.length / 2\n\n    return unless text.trim().length\n    current = text\n\n    if newDepth > depth\n      unless newDepth is depth + 1\n        throw new Error \"Unexpected indentation on line #{lineNumber}\"\n      # We're one level further in\n      # Convert the simple string to a [label, items] pair\n      items = []\n      prev = top(stack)\n      prev.push [prev.pop(), items]\n      stack.push items\n    else if newDepth < depth\n      # Pop stack to correct depth\n      stack = stack.slice(0, newDepth + 1)\n\n    depth = newDepth\n\n    top(stack).push current\n\n  return stack[0]\n\nmodule.exports = parse\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "if PACKAGE.name is \"ROOT\"\n  require \"./demo\"\nelse\n  module.exports = require \"./export\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "modal.coffee": {
          "path": "modal.coffee",
          "content": "###\nModal\n\nDisplay modal alerts or dialogs.\n\nModal has promise returning equivalents of the native browser:\n\n- Alert\n- Confirm\n- Prompt\n\nThese accept the same arguments and return a promise fulfilled with\nthe same return value as the native methods.\n\nYou can display any element in the modal:\n\n    modal.show myElement\n\n###\n\n{formDataToObject, handle, empty} = require \"./util\"\n\nPromptTemplate = require \"./templates/modal/prompt\"\nModalTemplate = require \"./templates/modal\"\n\nmodal = ModalTemplate()\n\ncancellable = true\nmodal.onclick = (e) ->\n  if e.target is modal and cancellable\n    Modal.hide()\n\ndocument.addEventListener \"keydown\", (e) ->\n  unless e.defaultPrevented\n    if e.key is \"Escape\" and cancellable\n      e.preventDefault()\n      Modal.hide()\n\ndocument.body.appendChild modal\n\ncloseHandler = null\n\nprompt = (params) ->\n  new Promise (resolve) ->\n    element = PromptTemplate params\n\n    Modal.show element,\n      cancellable: false\n      closeHandler: resolve\n    element.querySelector(params.focus)?.focus()\n\nmodule.exports = Modal =\n  show: (element, options) ->\n    if typeof options is \"function\"\n      closeHandler = options\n    else\n      closeHandler = options?.closeHandler\n      if options?.cancellable?\n        cancellable = options.cancellable\n\n    empty(modal).appendChild(element)\n    modal.classList.add \"active\"\n\n  hide: (dataForHandler) ->\n    closeHandler?(dataForHandler)\n    modal.classList.remove \"active\"\n    cancellable = true\n    empty(modal)\n\n  alert: (message) ->\n    prompt\n      title: \"Alert\"\n      message: message\n      focus: \"button\"\n      confirm: handle ->\n        Modal.hide()\n\n  prompt: (message, defaultValue=\"\") ->\n    prompt\n      title: \"Prompt\"\n      message: message\n      focus: \"input\"\n      defaultValue: defaultValue\n      cancel: handle ->\n        Modal.hide(null)\n      confirm: handle ->\n        Modal.hide modal.querySelector(\"input\").value\n\n  confirm: (message) ->\n    prompt\n      title: \"Confirm\"\n      message: message\n      focus: \"button\"\n      cancel: handle ->\n        Modal.hide(false)\n      confirm: handle ->\n        Modal.hide(true)\n\n  form: (formElement) ->\n    new Promise (resolve) ->\n      submitHandler = handle (e) ->\n        formData = new FormData(formElement)\n        result = formDataToObject(formData)\n        Modal.hide(result)\n\n      formElement.addEventListener \"submit\", submitHandler\n\n      Modal.show formElement, (result) ->\n        formElement.removeEventListener \"submit\", submitHandler\n        resolve(result)\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.9\"\nentryPoint: \"main\"\nremoteDependencies: [\n]\ndependencies:\n  observable: \"distri/observable:master\"\n  bindable: \"distri/bindable:master\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/notepad-menu.coffee": {
          "path": "samples/notepad-menu.coffee",
          "content": "module.exports = \"\"\"\n  [F]ile\n    [N]ew\n    [O]pen\n    [S]ave\n    Save [A]s\n    -\n    Page Set[u]p\n    [P]rint\n    -\n    E[x]it\n  [E]dit\n    [U]ndo\n    Redo\n    -\n    Cu[t]\n    [C]opy\n    [P]aste\n    De[l]ete\n    -\n    [F]ind\n    Find [N]ext\n    [R]eplace\n    [G]o To\n    -\n    Select [A]ll\n    Time/[D]ate\n  F[o]rmat\n    [W]ord Wrap\n    [F]ont...\n  [V]iew\n    [S]tatus Bar\n  [H]elp\n    View [H]elp\n    -\n    [A]bout Notepad\n\"\"\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/test-form.jadelet": {
          "path": "samples/test-form.jadelet",
          "content": "form\n  h1 Cool Form Bro\n  p\n    a(href=\"https://yolo.biz\") Yolo\n  input(name=\"yolo\")\n  input(name=\"x\" value=\"Lorem\")\n  input(name=\"y\" value=\"florem\")\n  input(name=\"z\" type=\"number\" value=5)\n  input(name=\"file\" type=\"file\")\n  textarea(name=\"text\")\n  button Submit\n",
          "mode": "100644",
          "type": "blob"
        },
        "style.coffee": {
          "path": "style.coffee",
          "content": "styles = {}\n\nall = \"\"\"\n  main\n  loader\n  menu\n  modal\n  table\n  window\n\"\"\".split(\"\\n\").map (stylePath) ->\n  content = require \"./style/#{stylePath}\"\n  styles[stylePath] = content\n\n  return content\n.join(\"\\n\")\n\nstyles.all = all\n\nmodule.exports = styles\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/loader.styl": {
          "path": "style/loader.styl",
          "content": "// Loader\nloader\n  display: block\n  padding: 1em\n\n  > p:empty\n    margin: 0\n\n  > progress\n    display: block\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/main.styl": {
          "path": "style/main.styl",
          "content": "*\n  box-sizing: border-box\n\nbody\n  display: flex\n  flex-direction: column\n  font-family: Sans-Serif\n  font-size: 14px\n  margin: 0\n\nbody, html\n  height: 100%\n\ninput, textarea, keygen, select, button\n  font-size: inherit\n  font-family: inherit\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/menu.styl": {
          "path": "style/menu.styl",
          "content": "// Menus\nno-select()\n  user-select: none\n  -moz-user-select: none\n  -webkit-user-select: none\n  -ms-user-select: none\n\nmenu\n  no-select()\n\n  background-color: lightgrey\n  border-bottom: 1px solid rgba(0, 0, 0, 0.5)\n  line-height: 18px\n  margin: 0\n  z-index: 1\n\n  &:focus\n    outline: none\n\nmenu.context\n  z-index: 2000\n\nmenu-item\n  display: block\n  list-style-type: none\n\n  &.active\n    background-color: #000080\n    color: white\n\n  > label\n    display: flex\n    padding: 0 0.25em\n    white-space: nowrap\n\n    > *\n      flex: 1 1 auto\n\n    > span.hotkey\n      margin-left: 1em\n\n      &:empty\n        margin-left: 0\n\n    > .decoration\n      align-self: center\n      flex: 0 1 auto\n      line-height: 1em\n      text-align: right\n      margin-left: 0.5em\n      padding-bottom: 0.125em\n\n      &:empty\n        margin-left: 0\n\n  &[disabled]\n    color: gray\n\n    &.active\n      background-color: rgba(0, 0, 0, 0.125)\n\nmenu.options\n  border-top: 1px solid rgba(255, 255, 255, 0.5)\n  border-left: 1px solid rgba(255, 255, 255, 0.5)\n  border-right: 1px solid rgba(0, 0, 0, 0.5)\n\n  box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.5)\n\n  display: none\n\n  padding: 2px\n  padding-bottom: 3px\n  position: absolute\n\n  &.active\n    display: block\n\n  // Submenu\n  > menu-item.menu\n    position: relative\n\n    > menu\n      position: absolute\n      left: 100%\n      top: -3px\n      margin-left: 1px\n\nmenu-item.menu.active\n  > menu\n    background-color: lightgrey\n    color: black\n    display: block\n\nmenu.bar\n  display: block\n  flex: 0 0 auto\n  margin: 0\n  padding: 0\n  position: initial\n  white-space: nowrap\n  overflow: hidden\n\n  > menu-item\n    display: inline-block\n    > label > .decoration\n      display: none\n\n  &.accelerator-active\n    span.accelerator\n      text-decoration: underline\n\n// For context menus starting from the bottom of the screen\nmenu.options.bottoms-up menu-item.menu > menu\n  top: initial\n  bottom: -4px\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/modal.styl": {
          "path": "style/modal.styl",
          "content": "#modal\n  align-items: center\n  background-color: rgba(0, 0, 0, 0.25)\n  display: none\n  justify-content: center\n  position: absolute\n  z-index: 1000\n  top: 0\n  width: 100%\n  height: 100%\n\n  &.active\n    display: flex\n\n  > *\n    background-color: white\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    box-shadow: 2px 2px 6px rgb(0, 0, 0, 0.5)\n    max-width: 90%\n    max-height: 90%\n\n  > form\n    display: block\n    padding: 1em\n\n    > h1\n      font-size: 1.5em\n      margin: 0\n\n    > input, textarea\n      display: block\n      margin-bottom: 1em\n      width: 100%\n\n    > button\n      margin-right: 1em\n      &:last-child\n        margin-right: 0\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/table.styl": {
          "path": "style/table.styl",
          "content": "container\n  display: block\n  height: 100%\n  overflow: auto\n  width: 100%\n\ntable\n  border-collapse: collapse\n  width: 100%\n\nth\n  text-align: left\n\nthead\n  border-bottom: 1px solid black\n\ntd > input\n  border: none\n  background-color: transparent\n  width: 100%\n  height: 100%\n  padding: 0\n\ntr:nth-child(even)\n  background-color: #EEE\n",
          "mode": "100644",
          "type": "blob"
        },
        "style/window.styl": {
          "path": "style/window.styl",
          "content": "no-select()\n  user-select: none\n  -moz-user-select: none\n  -webkit-user-select: none\n  -ms-user-select: none\n\ndesktop\n  no-select()\n\n  display: block\n  flex: 1 0 auto\n\nborder-color = rgba(0, 0, 0, 0.87)\n\nwindow\n  no-select()\n\n  background-color: lightgrey\n  border: 4px double border-color\n  border-radius: 4px\n  display: flex\n  flex-direction: column\n  position: absolute\n\n  > header\n    background-color: #000080\n    border-bottom: 1px solid border-color\n    cursor: default\n    display: flex\n    flex: 0 0 auto\n\n    > icon\n      background-position: 50%\n      background-repeat: no-repeat\n      background-size: 16px\n      color: white\n      display: inline-block\n      flex: 0 0 auto\n      text-align: center\n      width: 0\n\n    > control\n      background-color: lightgrey\n      color: white\n      display: inline-block\n      flex: 0 0 auto\n      font-family: monospace\n      width: 18px\n      text-shadow: 1px 0px 0px #000, -1px 0px 0px #000, 0px -1px 0px #000, 0px 1px 0px #000, 1px 1px 0px #808080\n      text-align: center\n\n      border-left: 1px solid border-color\n      &:first-child\n        border-left: none\n\n      &.close\n        &::before\n          content: \"X\"\n\n      &.maximize\n        &::before\n          content: \"⏫\"\n\n      &.minimize\n        &::before\n          content: \"-\"\n\n      &.restore\n        display: none\n        &::before\n          content: \"⏬\"\n\n    > title-bar\n      color: white\n      display: inline-block\n      flex: 1 1 auto\n      overflow: hidden\n      padding: 0 1rem 0 6px\n      text-overflow: ellipsis\n      white-space: nowrap\n\n  > viewport\n    background-color: white\n    display: flex\n    height: 100%\n    overflow: auto\n    position: relative\n    z-index: 0\n\n    > *\n      margin: auto\n\n    > textarea\n      border: none\n      font-family: monospace\n      height: 100%\n      padding: 2px 4px\n      resize: none\n      width: 100%\n\n    > iframe\n      border: none\n      height: 100%\n      width: 100%\n      position: absolute\n\n  > resize\n    display: block\n    position: absolute\n\n    &.e, &.w\n      cursor: ew-resize\n\n    &.n, &.s\n      cursor: ns-resize\n\n    &.h\n      height: 4px\n      width: 100%\n\n    &.v\n      height: 100%\n      width: 4px\n\n    &.w\n      left: -4px\n    &.e\n      right: -4px\n    &.n\n      top: -4px\n    &.s\n      bottom: -4px\n\n    &.n.w\n      cursor: nw-resize\n\n    &.n.e\n      cursor: ne-resize\n\n    &.s.e\n      cursor: se-resize\n\n    &.s.w\n      cursor: sw-resize\n\n    &.n.v\n      border-bottom: 1px solid black\n      height: 23px\n\n    &.s.v\n      border-top: 1px solid black\n      height: 23px\n\n    &.e.h\n      border-left: 1px solid black\n      width: 22px\n\n    &.w.h\n      border-right: 1px solid black\n      width: 22px\n\n  &.minimized\n    > header\n      border-bottom: none\n\n      > control\n        display: none\n\n        &.minimize\n          border-right: none\n          display: inline-block\n          &::before\n            content: \"+\"\n\n    > menu, > resize, > viewport\n      display: none\n\n  &.maximized\n    border: none\n    border-radius: 0\n    height: 100%\n    width: 100%\n\n    > resize\n      display: none\n\n    > header\n      > control\n        display: none\n\n        &.restore, &.close\n          display: inline-block\n\nframe-guard\n  display: block\n  height: 100%\n  pointer-events: none\n  position: absolute\n  width: 100%\n  z-index: 100000\n\n  &.active\n    pointer-events: auto\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/input.jadelet": {
          "path": "templates/input.jadelet",
          "content": "input(@value @type)\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/menu-item.jadelet": {
          "path": "templates/menu-item.jadelet",
          "content": "menu-item(@class @click @mousemove @disabled)\n  label\n    = @title\n    span.hotkey= @hotkey\n    span.decoration= @decoration\n  = @content\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/menu-separator.jadelet": {
          "path": "templates/menu-separator.jadelet",
          "content": "menu-item\n  hr\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/menu.jadelet": {
          "path": "templates/menu.jadelet",
          "content": "menu(@class @click @style)= @items\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/modal.jadelet": {
          "path": "templates/modal.jadelet",
          "content": "#modal\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/modal/prompt.jadelet": {
          "path": "templates/modal/prompt.jadelet",
          "content": "form(submit=@confirm tabindex=-1)\n  h1= @title\n  p= @message\n  - if @defaultValue?\n    input(type=\"text\" value=@defaultValue)\n  button OK\n  - if @cancel\n    button(click=@cancel) Cancel\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/progress.jadelet": {
          "path": "templates/progress.jadelet",
          "content": "loader\n  p= @message\n  progress(@class @value @max)\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/table.jadelet": {
          "path": "templates/table.jadelet",
          "content": "container\n  table(@keydown)\n    thead\n      tr\n        - @headers.forEach (header) ->\n          th= header\n    tbody\n",
          "mode": "100644",
          "type": "blob"
        },
        "templates/window.jadelet": {
          "path": "templates/window.jadelet",
          "content": "window(@class)\n  resize.n.h\n  resize.e.v\n  resize.s.h\n  resize.w.v\n  resize.n.e.h\n  resize.n.e.v\n  resize.n.w.h\n  resize.n.w.v\n  resize.s.e.h\n  resize.s.e.v\n  resize.s.w.h\n  resize.s.w.v\n  header\n    icon(style=@iconStyle)= @iconEmoji\n    title-bar= @title\n    control.minimize(click=@minimize)\n    control.maximize(click=@maximize)\n    control.restore(click=@restore)\n    control.close(click=@close)\n  = @menuBar\n  viewport\n    = @content\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/menu-item.coffee": {
          "path": "test/menu-item.coffee",
          "content": "MenuItemView = require \"../views/menu-item\"\nObservable = require \"observable\"\n\ndescribe \"MenuItem\", ->\n  # TODO: Make context root optional\n\n  it \"should have correct custom action names\", ->\n    called = false\n\n    menuItem = MenuItemView\n      label: \"Cool -> Super Cool\"\n      contextRoot:\n        activeItem: ->\n        handlers:\n          \"Super Cool\": ->\n            called = true\n\n    assert !called\n    menuItem.click()\n    assert called\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/menu-parser.coffee": {
          "path": "test/menu-parser.coffee",
          "content": "parse = require \"../lib/indent-parse\"\n\ndescribe \"Menu Parser\", ->\n  it \"should parse menus into lists\", ->\n    data = \"\"\"\n      File\n    \"\"\"\n\n    results = parse(data)\n    assert.deepEqual [\"File\"], results\n\n  it \"should parse empty\", ->\n    data = \"\"\"\n    \"\"\"\n\n    assert.deepEqual [], parse(data)\n\n  it \"should deal with nesting ok\", ->\n    data = \"\"\"\n      File\n        Open\n        Save\n      Edit\n        Copy\n        Paste\n      Help\n    \"\"\"\n\n    results = parse(data)\n    assert.deepEqual [\n      [\"File\", [\"Open\", \"Save\"]]\n      [\"Edit\", [\"Copy\", \"Paste\"]]\n      \"Help\"\n    ], results\n\n  it \"should parse big ol' menus\", ->\n    results = parse \"\"\"\n      File\n        New\n        Open\n        Save\n        Save As\n      Edit\n        Undo\n        Redo\n        -\n        Cut\n        Copy\n        Paste\n        Delete\n        -\n        Find\n        Find Next\n        Replace\n        Go To\n        -\n        Select All\n        Time/Date\n      Format\n        Word Wrap\n        Font...\n      View\n        Status Bar\n      Help\n        View Help\n        -\n        About Notepad\n    \"\"\"\n\n    assert.deepEqual [\n      [\"File\", [\"New\", \"Open\", \"Save\", \"Save As\"]]\n      [\"Edit\", [\"Undo\", \"Redo\", \"-\", \"Cut\", \"Copy\", \"Paste\", \"Delete\", \"-\", \"Find\", \"Find Next\", \"Replace\", \"Go To\", \"-\", \"Select All\", \"Time/Date\"]]\n      [\"Format\", [\"Word Wrap\", \"Font...\"]]\n      [\"View\", [\"Status Bar\"]]\n      [\"Help\", [\"View Help\", \"-\", \"About Notepad\"]]\n    ], results\n\n  it \"should parse hella nested menus\", ->\n    results = parse \"\"\"\n      File\n        Special\n          Nested\n            Super\n              Awesome\n    \"\"\"\n\n    assert.deepEqual [\n      [\"File\", [\n        [\"Special\", [\n          [\"Nested\", [\n            [\"Super\", [\n              \"Awesome\"\n            ]]\n          ]]\n        ]]\n      ]]\n    ], results\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/menu.coffee": {
          "path": "test/menu.coffee",
          "content": "MenuView = require \"../views/menu\"\nObservable = require \"observable\"\n\ndescribe \"Menu\", ->\n  # TODO: Make context root optional\n\n  it \"should work with plain ol' items\", ->\n    menu = MenuView\n      items: [\n        \"Cool\"\n        \"Rad\"\n      ]\n      contextRoot:\n        activeItem: Observable null\n        handlers: {}\n\n    assert.equal menu.items().length, 2\n\n  it \"should allow observable items\", ->\n    items = Observable [\n      \"Cool\"\n      [\"Rad\", [\"2rad\", \"2Furious\"]]\n    ]\n\n    menu = MenuView\n      items: items\n      contextRoot:\n        activeItem: Observable null\n        handlers: {}\n\n    assert.equal menu.items().length, 2\n\n    items [\n      \"New Stuff\"\n    ]\n\n    assert.equal menu.items().length, 1\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/modal.coffee": {
          "path": "test/modal.coffee",
          "content": "PACKAGE.name = \"test\"\n\n{Modal} = require \"../main\"\n\ndescribe \"Modal\", ->\n  it \"shoud be totally chill\", ->\n    element = document.createElement \"p\"\n\n    called = false\n    handler = (value) ->\n      called = true\n      assert.equal value, \"yolo\"\n\n    Modal.show(element, handler)\n    Modal.hide('yolo')\n\n    assert called\n",
          "mode": "100644",
          "type": "blob"
        },
        "util.coffee": {
          "path": "util.coffee",
          "content": "Observable = require \"observable\"\n\nA = (attr) ->\n  (x) -> x[attr]\n\nF = (methodName) ->\n  (x) -> x[methodName]()\n\nget = (x, context) ->\n  if typeof x is 'function'\n    x.call(context)\n  else\n    x\n\n# Observable attribute helper\no = (object, name) ->\n  attribute = Observable(object[name])\n\n  attribute.observe (newValue) ->\n    object[name] = newValue\n\n  return attribute\n\n# Handle events by preventing the default action\nhandle = (fn) ->\n  (e) ->\n    return if e?.defaultPrevented\n    e?.preventDefault()\n    fn.call(this, e)\n\n# I hope I don't hate myself for this later\n# S for Safe invoke, invoke the method of the object, if it exists and is a\n# function, otherwise return the provided default value\nS = (object, method, defaultValue) ->\n  ->\n    if typeof object?[method] is 'function'\n      object[method]()\n    else\n      defaultValue\n\nasElement = A('element')\n\naccelerateItem = (items, key) ->\n  [acceleratedItem] = items.filter (item) ->\n    item.accelerator is key\n\n  if acceleratedItem\n    # TODO: should there be some kind of exec rather than click action?\n    acceleratedItem.click()\n\nisDescendant = (element, ancestor) ->\n  return unless element\n\n  while (parent = element.parentElement)\n    return true if element is ancestor\n    element = parent\n\nadvance = (list, amount) ->\n  [currentItem] = list.filter (item) ->\n    item.active()\n\n  activeItemIndex = list.indexOf(currentItem) + amount\n\n  if activeItemIndex < 0\n    activeItemIndex = list.length - 1\n  else if activeItemIndex >= list.length\n    activeItemIndex = 0\n\n  list[activeItemIndex]\n\n# TODO: Nested objects?\n# TODO: Convert keys ending in [] to array entries?\n# Just keeping it simple and crushing duplicate names\nformDataToObject = (formData) ->\n  Array.from(formData.entries()).reduce (object, [key, value]) ->\n    object[key] = value\n\n    object\n  , {}\n\n# Get the view associated with a dom element\n# This will let us use the dom tree rather than manage a separate tree\n# to dispatch events at the view level\n# the assumption is that a .view property is written to the root element in the\n# view when rendering a view's template element\nelementView = (element) ->\n  return unless element\n  return element.view if element.view\n  elementView element.parentElement\n\n# Remove all children from a dom node\nempty = (node) ->\n  while node.hasChildNodes()\n    node.removeChild(node.lastChild)\n\n  return node\n\nmodule.exports =\n  htmlEscape: (string) ->\n    String(string).replace /[&<>\"'\\/]/g, (s) ->\n      entityMap[s]\n\n  A: A\n  F: F\n  S: S\n  o: o\n\n  advance: advance\n  asElement: asElement\n  accelerateItem: accelerateItem\n  elementView: elementView\n  empty: empty\n  formDataToObject: formDataToObject\n  get: get\n  handle: handle\n  isDescendant: isDescendant\n\nentityMap =\n  \"&\": \"&amp;\"\n  \"<\": \"&lt;\"\n  \">\": \"&gt;\"\n  '\"': '&quot;'\n  \"'\": '&#39;'\n  \"/\": '&#x2F;'\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/context-menu.coffee": {
          "path": "views/context-menu.coffee",
          "content": "###\nContextMenu\n\nDisplay a context menu!\n\nQuestions:\n\nShould we be able to update the options in the menu after creation?\n\n###\n\n\nObservable = require \"observable\"\n\nMenuView = require \"./menu\"\n\n{isDescendant} = require \"../util\"\n\nmodule.exports = ({items, classes, handlers}) ->\n  activeItem = Observable null\n  classes ?= []\n  top = Observable \"\"\n  left = Observable \"\"\n\n  contextRoot =\n    activeItem: activeItem\n    handlers: handlers\n\n  self = MenuView\n    items: items\n    contextRoot: contextRoot\n    classes: -> [\"context\", \"options\"].concat(classes)\n    style: ->\n      \"top: #{top()}px; left: #{left()}px\"\n\n  element = self.element\n  element.view = self\n\n  self.contextRoot = contextRoot\n  self.display = ({inElement, x, y}) ->\n    top(y)\n    left(x)\n\n    # The element must be added to the dom before it can be activated\n    # it must be visible before it can be focused\n    (inElement or document.body).appendChild element\n    activeItem self\n    element.focus()\n\n  # This must be attached to the document body so we can de-activate when\n  # a person presses the mouse outside of our menu\n  # TODO: How should we clean up this global listener?\n  document.addEventListener \"mousedown\", (e) ->\n    unless isDescendant(e.target, element)\n      activeItem null\n\n  element.setAttribute(\"tabindex\", \"-1\")\n  element.addEventListener \"keydown\", (e) ->\n    {key} = e\n\n    switch key\n      when \"ArrowLeft\", \"ArrowUp\", \"ArrowRight\", \"ArrowDown\"\n        e.preventDefault()\n        direction = key.replace(\"Arrow\", \"\")\n\n        currentItem = activeItem()\n\n        if currentItem\n          currentItem.cursor(direction)\n\n      when \"Escape\"\n        activeItem null\n\n  return self\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/menu-bar.coffee": {
          "path": "views/menu-bar.coffee",
          "content": "# The MenuBar is a list MenuItems arranged in a bar across the top of a page or\n# window.\n\nObservable = require \"observable\"\n\nMenuView = require \"./menu\"\n\n{isDescendant, advance} = require \"../util\"\n\nmodule.exports = ({items, handlers}) ->\n  acceleratorActive = Observable false\n  # Track active menus and item for navigation\n  activeItem = Observable null\n  previouslyFocusedElement = null\n\n  contextRoot =\n    activeItem: activeItem\n    handlers: handlers\n\n  self = MenuView\n    classes: ->\n      [\n        \"bar\"\n        \"accelerator-active\" if acceleratorActive()\n      ]\n    items: items\n    contextRoot: contextRoot\n\n  element = self.element\n\n  # Redefine cursor movement\n  self.cursor = (direction) ->\n    switch direction\n      when \"Right\"\n        self.advance(1)\n      when \"Left\"\n        self.advance(-1)\n\n  # Redefine expand to down and not right on menu items\n  self.items.forEach (item) ->\n    item.horizontal = true\n    item.cursor = (direction) ->\n      console.log \"Item\", direction\n      if direction is \"Down\"\n        item.submenu?.advance(1)\n      else if direction is \"Up\"\n        item.submenu?.advance(-1)\n      else\n        item.parent.cursor direction\n\n  deactivate = ->\n    activeItem null\n    acceleratorActive false\n    # De-activate menu and focus previously focused element\n    previouslyFocusedElement?.focus()\n\n  document.addEventListener \"mousedown\", (e) ->\n    unless isDescendant(e.target, element)\n      acceleratorActive false\n      activeItem null\n\n  document.addEventListener \"keydown\", (e) ->\n    {key} = e\n    switch key\n      when \"Enter\"\n        activeItem()?.click()\n      when \"Alt\"\n        menuIsActive = false\n        if acceleratorActive() or menuIsActive\n          deactivate()\n        else\n          # Store previously focused element\n          # Get menu ready for accelerating!\n          previouslyFocusedElement = document.activeElement\n          element.focus()\n          activeItem self unless activeItem()\n          acceleratorActive true\n\n  # Dispatch the key to the active menu element\n  accelerateIfActive = (key) ->\n    if acceleratorActive()\n      activeItem()?.accelerate(key)\n\n  # We need to be able to focus the menu to receive keyboard events on it\n  element.setAttribute(\"tabindex\", \"-1\")\n  element.addEventListener \"keydown\", (e) ->\n    {key} = e\n\n    switch key\n      when \"ArrowLeft\", \"ArrowUp\", \"ArrowRight\", \"ArrowDown\"\n        e.preventDefault()\n        direction = key.replace(\"Arrow\", \"\")\n\n        currentItem = activeItem()\n\n        if currentItem\n          currentItem.cursor(direction)\n\n      when \"Escape\"\n        deactivate()\n      else\n        # Only prevent default if we successfully accelerated?\n        accelerated = accelerateIfActive(key.toLowerCase())\n        if accelerated?\n          e.preventDefault()\n\n  return self\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/menu-item.coffee": {
          "path": "views/menu-item.coffee",
          "content": "{advance, htmlEscape, asElement, F, S, isDescendant, accelerateItem, handle} = require \"../util\"\n\nMenuItemTemplate = require \"../templates/menu-item\"\n\n# MenuItemView\n# An item that appears in menus\nmodule.exports = ({label, MenuView, items, contextRoot, parent}) ->\n  self = {}\n\n  {activeItem, handlers} = contextRoot\n  # TODO: This gets called per menu item when the state changes\n  # Could we shift it a little to only be called for the relevant subtree?\n  active = ->\n    isDescendant activeItem()?.element, element\n\n  self.active = active\n\n  if items\n    submenu = MenuView({\n      items\n      contextRoot\n      parent: self\n    })\n    content = submenu.element\n\n  # Hook in to Action objects so we can display hotkeys\n  # and enabled/disabled statuses.\n  [labelText, actionName] = formatAction label\n  [title, accelerator] = formatLabel labelText\n  action = handlers[actionName]\n  disabled = S(action, \"disabled\", false)\n  hotkey = S(action, \"hotkey\", \"\")\n\n  click = (e) ->\n    return if disabled()\n    return if e?.defaultPrevented\n    e?.preventDefault()\n\n    if submenu\n      activeItem submenu\n      return\n\n    action?.call?(handlers)\n\n    # TODO: More cleanup than just clearing the active item, like also we\n    # should clear accelerator state, and maybe return focus to previously\n    # focused element.\n    # contextRoot.finish?\n    activeItem null\n\n  element = MenuItemTemplate\n    class: ->\n      [\n        \"menu\" if items\n        \"active\" if active()\n      ]\n    click: click\n\n    mousemove: (e) ->\n      # Click to activate top level menus unless a menu is already active\n      # then hover to show.\n      return unless activeItem()\n\n      if !e.defaultPrevented and isDescendant(e.target, element)\n        # Note: We're using preventDefault to prevent handling the\n        # activation above the first element that handles it\n        e.preventDefault()\n\n        activeItem self\n\n    title: title\n    content: content\n    decoration: \"▸\" if items\n    hotkey: hotkey\n    disabled: disabled\n\n  Object.assign self,\n    accelerator: accelerator\n    accelerate: (key) ->\n      if submenu\n        submenu.accelerate key\n      else\n        parent.accelerate key\n    click: click\n    parent: parent\n    element: element\n    submenu: submenu\n    cursor: (direction) ->\n      console.log \"Item Cursor\", direction\n      if submenu and direction is \"Right\"\n        # Select the first navigable item of the submenu\n        activeItem submenu.navigableItems[0]\n      else if parent.parent and direction is \"Left\"\n        # parent is the menu,\n        # parent.parent is the item in the menu containing the parent\n        if parent.parent.horizontal\n          parent.parent.cursor(direction)\n        else\n          activeItem parent.parent\n      else\n        parent.cursor(direction)\n\n  return self\n\n# Parse out custom action symbol from entries like:\n#\n#     [F]ont... -> showFont\n#\n# Falling back to formatting the action title\nformatAction = (labelText) ->\n  [title, action] = labelText.split(\"->\").map F(\"trim\")\n\n  unless action\n    action = title.replace(/[^A-Za-z0-9]/g, \"\")\n    action = action.charAt(0).toLowerCase() + action.substring(1)\n\n  return [title, action]\n\nformatLabel = (labelText) ->\n  accelerator = undefined\n  # Parse out accelerator keys for underlining when alt is pressed\n  titleHTML = htmlEscape(labelText).replace /\\[([^\\]]+)\\]/, (match, $1) ->\n    accelerator = $1.toLowerCase()\n    \"<span class=\\\"accelerator\\\">#{$1}</span>\"\n\n  span = document.createElement \"span\"\n  span.innerHTML = titleHTML\n\n  return [span, accelerator]\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/menu-separator.coffee": {
          "path": "views/menu-separator.coffee",
          "content": "MenuSeparatorTemplate = require \"../templates/menu-separator\"\n\nmodule.exports = ->\n  element: MenuSeparatorTemplate()\n  separator: true\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/menu.coffee": {
          "path": "views/menu.coffee",
          "content": "Observable = require \"observable\"\n\nassert = require \"../lib/assert\"\n\n{advance, accelerateItem, asElement, get, F, S, htmlEscape, handle, isDescendant} = require \"../util\"\n\nMenuTemplate = require \"../templates/menu\"\nMenuItemTemplate = require \"../templates/menu-item\"\n\nSeparatorView = require \"./menu-separator\"\nMenuItemView = require \"./menu-item\"\n\n# MenuView\n#\n# items is an array of item data\n# An item datum is either a string\n# or a pair of [label:string, items...]\n#\n# ex. [\n#   \"Cool\"\n#   [\"Submenu\", [\n#     \"Yo\",\n#     \"Wat\"\n#   ]]\n# ]\n#\nmodule.exports = MenuView = ({items, classes, style, contextRoot, parent}) ->\n  self = {}\n\n  classes ?= -> [\"options\"]\n\n  {activeItem} = contextRoot\n\n  # Converts items from the data to the element jazz\n  getItems = Observable ->\n    items.map (item) ->\n      switch\n        when typeof item is \"string\" and item.match(/^[=-]+$/)\n          SeparatorView()\n        when Array.isArray(item)\n          assert item.length is 2\n          [label, submenuItems] = item\n          MenuItemView\n            label: label\n            items: submenuItems\n            MenuView: MenuView\n            contextRoot: contextRoot\n            parent: self\n        else\n          MenuItemView\n            label: item\n            contextRoot: contextRoot\n            parent: self\n\n  navigableItems = Observable ->\n    getItems().filter (item) ->\n      !item.separator\n\n  # TODO: This gets called per menu item when the state changes\n  # Could we shift it a little to only be called for the relevant subtree?\n  # Possible solution: find the common ancestor of the new active and the previous\n  # active and only update the necessary ones\n  active = ->\n    isDescendant activeItem()?.element, self.element\n\n  Object.assign self,\n    accelerate: (key) ->\n      accelerateItem(getItems(), key)\n    cursor: (direction) ->\n      switch direction\n        when \"Up\"\n          self.advance(-1)\n        when \"Down\"\n          self.advance(1)\n        else\n          parent.parent?.cursor(direction)\n    parent: parent\n    items: getItems\n    advance: (n) ->\n      activeItem advance(navigableItems(), n)\n    navigableItems: navigableItems\n    element: MenuTemplate\n      style: style\n      class: ->\n        [\n          \"active\" if active()\n        ].concat classes()\n      click: handle (e) ->\n        activeItem self\n      items: ->\n        getItems().map asElement\n\n  return self\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/progress.coffee": {
          "path": "views/progress.coffee",
          "content": "Template = require \"../templates/progress\"\n\nObservable = require \"observable\"\n\nmodule.exports = (params={}) ->\n  {value, max, message} = params\n  value = Observable value or 0\n  max = Observable max\n  message = Observable message\n\n  element = Template\n    value: value\n    max: max\n    message: message\n\n  element: element\n  value: value\n  message: message\n  max: max\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/table.coffee": {
          "path": "views/table.coffee",
          "content": "{empty} = require \"../util\"\n\nTableTemplate = require \"../templates/table\"\n\n# Focus same cell in next row\nadvanceRow = (path, prev) ->\n  [td] = path.filter (element) ->\n    element.tagName is \"TD\"\n  return unless td\n\n  tr = td.parentElement\n  cellIndex = Array::indexOf.call(tr.children, td)\n  if prev\n    nextRowElement = tr.previousSibling\n  else\n    nextRowElement = tr.nextSibling\n\n  if nextRowElement\n    input = nextRowElement.children[cellIndex].querySelector('input')\n    input?.focus()\n\n# The table view takes source data and a constructor that returns a row element\n# for each source datum\n\n# The view will have the ability to filter/sort the data.\n\nTableView = ({data, headers, RowElement}) ->\n  headers ?= Object.keys data[0]\n\n  containerElement = TableTemplate\n    headers: headers\n    keydown: (event) ->\n      {key, path} = event\n      switch key\n        when \"Enter\", \"ArrowDown\"\n          event.preventDefault()\n          advanceRow path\n        when \"ArrowUp\"\n          event.preventDefault()\n          advanceRow path, true\n        # TODO: Left and Right\n        # Left and Right are trickier because you may want to navigate within a text input\n        # ... actually up and down get trickier too if we imagine text areas or\n        # even fancier inputs that may have their own controls...\n\n  tableBody = containerElement.querySelector('tbody')\n\n  filterFn = (datum) ->\n    true\n\n  filterAndSort = (data, filterFn, sortFn) ->\n    filterFn ?= -> true\n    filteredData = data.filter(filterFn)\n\n    if sortFn\n      filteredData.sort(sortFn)\n    else\n      filteredData\n\n  rowElements = ->\n    filterAndSort(data, filterFn, null).map RowElement\n\n  update = ->\n    empty tableBody\n    rowElements().forEach (element) ->\n      tableBody.appendChild element\n\n  update()\n\n  element: containerElement\n  render: update\n\nmodule.exports = TableView\n",
          "mode": "100644",
          "type": "blob"
        },
        "views/window.coffee": {
          "path": "views/window.coffee",
          "content": "WindowTemplate = require \"../templates/window\"\n\n{elementView} = require \"../util\"\n\n# We need an invisible full screen overlay to keep iframes from eating our\n# mousemove events\nframeGuard = document.createElement \"frame-guard\"\ndocument.body.appendChild frameGuard\n\ntopIndex = 0\nraiseToTop = (view) ->\n  return unless typeof view.zIndex is 'function'\n  zIndex = view.zIndex()\n  return if zIndex is topIndex\n  topIndex += 1\n\n  view.zIndex(topIndex)\n\n# Drag Handling\nactiveDrag = null\ndragStart = null\ndocument.addEventListener \"mousedown\", (e) ->\n  {target} = e\n\n  view = elementView target\n  if view\n    # TODO: only raise widows?\n    raiseToTop view\n\n  if target.tagName is \"TITLE-BAR\"\n    frameGuard.classList.add(\"active\")\n    dragStart = e\n    activeDrag = view\n\ndocument.addEventListener \"mousemove\", (e) ->\n  if activeDrag\n    {clientX:prevX, clientY:prevY} = dragStart\n    {clientX:x, clientY:y} = e\n\n    if activeDrag.maximized()\n      maximizedX = activeDrag.x()\n      maximizedY = activeDrag.y()\n\n      activeDrag.restore()\n      activeDrag.x x - activeDrag.width() / 2\n      activeDrag.y maximizedY\n\n    dx = x - prevX\n    dy = y - prevY\n\n    activeDrag.x activeDrag.x() + dx\n    activeDrag.y activeDrag.y() + dy\n\n    dragStart = e\n\n# Resize Handling\nactiveResize = null\nresizeStart = null\nresizeInitial = null\ndocument.addEventListener \"mousedown\", (e) ->\n  {target} = e\n\n  if target.tagName is \"RESIZE\"\n    frameGuard.classList.add(\"active\")\n    resizeStart = e\n    activeResize = target\n    {width, height, x, y} = elementView activeResize\n    resizeInitial =\n      width: width()\n      height: height()\n      x: x()\n      y: y()\n\ndocument.addEventListener \"mousemove\", (e) ->\n  if activeResize\n    {clientX:startX, clientY:startY} = resizeStart\n    {clientX:x, clientY:y} = e\n\n    dx = x - startX\n    dy = y - startY\n\n    width = resizeInitial.width\n    height = resizeInitial.height\n\n    if activeResize.classList.contains(\"e\")\n      width += dx\n\n    if activeResize.classList.contains(\"w\")\n      width -= dx\n\n    if activeResize.classList.contains(\"s\")\n      height += dy\n\n    if activeResize.classList.contains(\"n\")\n      height -= dy\n\n    width = Math.max(width, 200)\n    height = Math.max(height, 50)\n\n    actualDeltaX = width - resizeInitial.width\n    actualDeltaY = height - resizeInitial.height\n\n    view = elementView activeResize\n    if activeResize.classList.contains(\"n\")\n      view.y resizeInitial.y- actualDeltaY\n\n    if activeResize.classList.contains(\"w\")\n      view.x resizeInitial.x- actualDeltaX\n\n    view.width width\n    view.height height\n\n    view.trigger \"resize\"\n\ndocument.addEventListener \"mouseup\", ->\n  activeDrag = null\n  activeResize = null\n  frameGuard.classList.remove(\"active\")\n\nBindable = require \"bindable\"\nObservable = require \"observable\"\n\nmodule.exports = (params) ->\n  self = Bindable()\n\n  x = Observable params.x ? 50\n  y = Observable params.y ? 50\n  width = Observable params.width ? 400\n  height = Observable params.height ? 300\n  title = Observable params.title ? \"Untitled\"\n  minimized = Observable false\n  maximized = Observable false\n  prevWidth = Observable null\n  prevHeight = Observable null\n  prevX = Observable null\n  prevY = Observable null\n  iconURL = Observable params.iconURL or \"data:image/x-icon;base64,AAABAAIAICAQAAEABADoAgAAJgAAABAQEAABAAQAKAEAAA4DAAAoAAAAIAAAAEAAAAABAAQAAAAAAIACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAvwAAAL+/AL8AAAC/AL8Av78AAMDAwACAgIAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AAAAAAAAAAAAAAAAAAAAAAAACHd3d3d3d3d3d3d3dwAAAAj///////////////cAAAAI///////////////3AAAACP///////3d///d39wAAAAj/zMzM//mZ//+Zn/cAAAAI////////l///+X/3AAAACP/MzMzM//l3d3l/9wAAAAj/////////mZmZf/cAAAAI/8zMzMzM//l/+X/3AAAACP//////////l/l/9wAAAAj/zMzMzMzM//l5f/cAAAAI////////////mX/3AAAACP/MzMzMzMzM//n/9wAAAAj///////////////cAAAAI/8zMzMzMzMzMzP/3AAAACP//////////////9wAAAAj/zMzMzMzMzMzM//cAAAAI///////////////3AAAACP8AAAAA/8zMzMz/9wAAAAj/iZD/8P////////cAAAAI/4AAAAD/zMzMzP/3AAAACP+P8Luw////////9wAAAAj/gAC7sP/MzMzM//cAAAAI/4/wu7D////////3AAAACP+P8Luw/////4AAAAAAAAj/j/AAAP////+P94AAAAAI/4/wzMD/////j3gAAAAACP+IiIiA/////4eAAAAAAAj///////////+IAAAAAAAI////////////gAAAAAAACIiIiIiIiIiIiIAAAAAA4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAP4AAAH+AAAD/gAAB/4AAA/+AAAf8oAAAAEAAAACAAAAABAAQAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAvwAAAL+/AL8AAAC/AL8Av78AAMDAwACAgIAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AAAAAAAAAAAACHd3d3d3cAAI//////9wAAj8z5//n3AACP//+ZmfcAAI/MzPn59wAAj////5n3AACPzMzM+fcAAI//////9wAAjwAPzMz3AACPmY////cAAI/Pj8zM9wAAj8+P//AAAACPiI//9/gAAI/////3gAAAiIiIiIgAAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIAHAACADwAAgB8AAA==\"\n  iconEmoji = Observable params.iconEmoji or null\n\n  iconStyle = Observable ->\n    if iconEmoji()\n      \"\"\"\n        width: 18px;\n      \"\"\"\n    else\n      \"\"\"\n        background-image: url(#{iconURL()});\n        width: 18px;\n      \"\"\"\n\n  topIndex += 1\n  zIndex = Observable params.zIndex ? topIndex\n\n  element = WindowTemplate\n    iconStyle: iconStyle\n    iconEmoji: iconEmoji\n    title: title\n    menuBar: params.menuBar\n    content: params.content\n    class: ->\n      [\n        \"minimized\" if minimized()\n        \"maximized\" if maximized()\n      ]\n    close: ->\n      self.close()\n    minimize: ->\n      self.minimize()\n    maximize: ->\n      self.maximize()\n    restore: ->\n      self.restore()\n\n  styleBind(y, element, \"top\", \"px\")\n  styleBind(x, element, \"left\", \"px\")\n  styleBind(height, element, \"height\", \"px\")\n  styleBind(width, element, \"width\", \"px\")\n  styleBind(zIndex, element, \"zIndex\")\n\n  restore = ->\n    if prevX()?\n      x prevX()\n\n    if prevY()?\n      y prevY()\n\n    width prevWidth()\n    height prevHeight()\n\n    minimized false\n    maximized false\n\n    self.trigger \"resize\"\n\n  Object.assign self,\n    element: element\n    iconEmoji: iconEmoji\n    iconURL: iconURL\n    title: title\n    x: x\n    y: y\n    width: width\n    height: height\n    zIndex: zIndex\n    close: ->\n      # TODO: Allow prompt to cancel\n      # Maybe we count on people to override this method if they want\n      element.remove()\n\n    maximized: maximized\n    maximize: ->\n      maximized.toggle()\n\n      if maximized()\n        prevWidth width()\n        prevHeight height()\n        prevX x()\n        prevY y()\n\n        width null\n        height null\n        x 0\n        y 0\n\n        self.trigger \"resize\"\n        self.trigger \"maximize\"\n      else\n        restore()\n\n    minimized: minimized\n    minimize: ->\n      minimized.toggle()\n\n      if minimized()\n        prevWidth width()\n        prevHeight height()\n\n        width null\n        height null\n\n        self.trigger \"resize\"\n        self.trigger \"minimize\"\n      else\n        restore()\n\n    restore: ->\n      restore()\n\n    raiseToTop: ->\n      raiseToTop self\n\n  element.view = self\n\n  return self\n\nstyleBind = (observable, element, attr, suffix=\"\") ->\n  update = (newValue) ->\n\n    if newValue? and (newValue = parseInt newValue)?\n      element.style[attr] = \"#{newValue}#{suffix}\"\n    else\n      element.style[attr] = null\n\n  observable.observe update\n\n  update(observable())\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "action": {
          "path": "action",
          "content": "\n/*\nAction\n======\n\nActions have a function to call, a hotkey, and a function that determines\nwhether or not they are disabled. This is so we can present them in the UI for\nmenus.\n\nThe hotkey is for display purposes only and needs to be listened to by a\nseparate mechanism to perform. [TODO] The action can be executed like a regular\nfunction (instead of needing to use call).\n\nActions may have icons and help text as well.\n */\n\n(function() {\n  var Observable,\n    __slice = [].slice;\n\n  Observable = require(\"observable\");\n\n  module.exports = function(fn, hotkey) {\n    var disabled;\n    disabled = Observable(false);\n    setInterval(function() {\n      return disabled.toggle();\n    }, 1000);\n    return {\n      disabled: disabled,\n      hotkey: function() {\n        return hotkey;\n      },\n      call: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return fn.call.apply(fn, args);\n      }\n    };\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "demo": {
          "path": "demo",
          "content": "(function() {\n  var ContextMenu, FormSampleTemplate, MenuBar, Modal, Observable, Progress, Style, Table, Window, addWindow, contextMenu, desktop, element, notepadMenuParsed, notepadMenuText, o, parseMenu, sampleMenuParsed, style, _ref, _ref1;\n\n  _ref = require(\"./export\"), ContextMenu = _ref.ContextMenu, MenuBar = _ref.MenuBar, Modal = _ref.Modal, Observable = _ref.Observable, (_ref1 = _ref.Util, parseMenu = _ref1.parseMenu), Progress = _ref.Progress, Style = _ref.Style, Table = _ref.Table, Window = _ref.Window;\n\n  o = require(\"./util\").o;\n\n  notepadMenuText = require(\"./samples/notepad-menu\");\n\n  notepadMenuParsed = parseMenu(notepadMenuText);\n\n  FormSampleTemplate = require(\"./samples/test-form\");\n\n  style = document.createElement(\"style\");\n\n  style.innerHTML = Style.all;\n\n  document.head.appendChild(style);\n\n  sampleMenuParsed = parseMenu(\"[M]odal\\n  [A]lert\\n  [C]onfirm\\n  [P]rompt\\n  [F]orm\\n  P[r]ogress\\n[T]est Nesting\\n  Test[1]\\n    Hello\\n    Wat\\n  Test[2]\\n    [N]ested\\n    -----\\n    [R]ad\\n      So Rad\\n      =====\\n      Hella\\n        Hecka\\n          Super Hecka\\n            Wicked\\n        ---\\n        -\\n        -\\n        ==\\n[W]indow\\n  New [I]mage -> newImage\\n  New [P]ixel -> newPixel\\n  New [T]ext -> newText\\n  New [S]preadsheet -> newSheet\");\n\n  element = MenuBar({\n    items: sampleMenuParsed,\n    handlers: {\n      alert: function() {\n        return Modal.alert(\"yolo\");\n      },\n      prompt: function() {\n        return Modal.prompt(\"Pretty cool, eh?\", \"Yeah!\").then(console.log);\n      },\n      confirm: function() {\n        return Modal.confirm(\"Jawsome!\").then(console.log);\n      },\n      form: function() {\n        return Modal.form(FormSampleTemplate()).then(console.log);\n      },\n      progress: function() {\n        var initialMessage, intervalId, progressView;\n        initialMessage = \"Reticulating splines\";\n        progressView = Progress({\n          value: 0,\n          max: 2,\n          message: initialMessage\n        });\n        Modal.show(progressView.element, {\n          cancellable: false\n        });\n        return intervalId = setInterval(function() {\n          var ellipses, ellipsesCount, newValue, _i, _results;\n          newValue = progressView.value() + 1 / 60;\n          ellipsesCount = Math.floor(newValue * 4) % 4;\n          ellipses = (function() {\n            _results = [];\n            for (var _i = 0; 0 <= ellipsesCount ? _i < ellipsesCount : _i > ellipsesCount; 0 <= ellipsesCount ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).map(function() {\n            return \".\";\n          }).join(\"\");\n          progressView.value(newValue);\n          progressView.message(initialMessage + ellipses);\n          if (newValue > 2) {\n            clearInterval(intervalId);\n            return Modal.hide();\n          }\n        }, 15);\n      },\n      newImage: function() {\n        var img;\n        img = document.createElement(\"img\");\n        img.src = \"https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/pI1mvEvxcXJk4mNHNUW-kZsNJsrPDXcAtgguyYETRXQ\";\n        return addWindow({\n          title: \"Yoo\",\n          content: img,\n          iconEmoji: \"💼\"\n        });\n      },\n      newPixel: function() {\n        var frame;\n        frame = document.createElement(\"iframe\");\n        frame.src = \"https://danielx.net/pixel-editor/embedded/\";\n        return addWindow({\n          title: \"Pixel\",\n          content: frame\n        });\n      },\n      newText: function() {\n        var textarea;\n        textarea = document.createElement(\"textarea\");\n        return addWindow({\n          title: \"Notepad.exe\",\n          content: textarea\n        });\n      },\n      newSheet: function() {\n        var InputTemplate, RowElement, data, menuBar, tableView;\n        data = [0, 1, 2, 3, 4].map(function(i) {\n          return {\n            id: i,\n            name: \"yolo\",\n            color: \"#FF0000\"\n          };\n        });\n        InputTemplate = require(\"./templates/input\");\n        RowElement = function(datum) {\n          var tr, types;\n          tr = document.createElement(\"tr\");\n          types = [\"number\", \"text\", \"color\"];\n          Object.keys(datum).forEach(function(key, i) {\n            var td;\n            td = document.createElement(\"td\");\n            td.appendChild(InputTemplate({\n              value: o(datum, key),\n              type: types[i]\n            }));\n            return tr.appendChild(td);\n          });\n          return tr;\n        };\n        element = (tableView = Table({\n          data: data,\n          RowElement: RowElement\n        })).element;\n        menuBar = MenuBar({\n          items: parseMenu(\"Insert\\n  Row -> insertRow\\nHelp\\n  About\"),\n          handlers: {\n            about: function() {\n              return Modal.alert(\"Spreadsheet v0.0.1 by Daniel X Moore\");\n            },\n            insertRow: function() {\n              data.push({\n                id: 50,\n                name: \"new\",\n                color: \"#FF00FF\"\n              });\n              return tableView.render();\n            }\n          }\n        });\n        return addWindow({\n          title: \"Spreadsheet [DEMO VERSION]\",\n          content: element,\n          menuBar: menuBar.element\n        });\n      }\n    }\n  }).element;\n\n  document.body.appendChild(element);\n\n  desktop = document.createElement(\"desktop\");\n\n  document.body.appendChild(desktop);\n\n  contextMenu = ContextMenu({\n    items: sampleMenuParsed[1][1],\n    handlers: {}\n  });\n\n  desktop.addEventListener(\"contextmenu\", function(e) {\n    if (e.target === desktop) {\n      e.preventDefault();\n      return contextMenu.display({\n        inElement: document.body,\n        x: e.pageX,\n        y: e.pageY\n      });\n    }\n  });\n\n  addWindow = function(params) {\n    var windowView;\n    windowView = Window(params);\n    desktop.appendChild(windowView.element);\n    return windowView;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "export": {
          "path": "export",
          "content": "(function() {\n  var Action, ContextMenuView, MenuBarView, MenuItemView, MenuView, Modal, Observable, ProgressView, Style, TableView, WindowView;\n\n  Action = require(\"./action\");\n\n  ContextMenuView = require(\"./views/context-menu\");\n\n  Modal = require(\"./modal\");\n\n  MenuView = require(\"./views/menu\");\n\n  MenuBarView = require(\"./views/menu-bar\");\n\n  MenuItemView = require(\"./views/menu-item\");\n\n  Observable = require(\"observable\");\n\n  ProgressView = require(\"./views/progress\");\n\n  Style = require(\"./style\");\n\n  TableView = require(\"./views/table\");\n\n  WindowView = require(\"./views/window\");\n\n  module.exports = {\n    Action: Action,\n    Bindable: require(\"bindable\"),\n    ContextMenu: ContextMenuView,\n    Modal: Modal,\n    Menu: MenuView,\n    MenuBar: MenuBarView,\n    MenuItem: MenuItemView,\n    Observable: Observable,\n    Progress: ProgressView,\n    Style: Style,\n    Table: TableView,\n    Util: {\n      parseMenu: require(\"./lib/indent-parse\")\n    },\n    Window: WindowView\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "hotkeys": {
          "path": "hotkeys",
          "content": "\n/*\nHotkeys\n=======\n\nBind hotkeys\n\n    Hotkey = require \"hotkey\"\n\n    Hotkey \"ctrl+r\", ->\n      alert \"radical!\"\n\nWe'd like to be able to generate a list of hotkeys with descriptions.\n\nQuestions\n---------\n\nShould we just use Mousetrap?\n\nMaybe, but it may have different semantics with preventDefault/defaultPrevented.\n\nShould we allow binding to specific elements?\n\nImagine a windowing OS where non-iframe apps are inside draggable windows. We'd\nlike to have each 'app' able to have its own hotkeys and at the same time have\nglobal OS level hotkeys.\n\nShould `defaultPrevented` prevent executing the hotkey action? Yes\n\nShould executing a hotkey preventDefault? Yes\n */\n\n(function() {\n  module.exports = function(element) {\n    var handle, handlers;\n    handlers = {};\n    return handle = function(event) {\n      var combo, key, modifiersActive;\n      key = event.key;\n      modifiersActive = [\"alt\", \"ctrl\", \"meta\", \"shift\"].filter(function(modifier) {\n        return event[\"\" + modifier + \"Key\"];\n      });\n      combo = modifiersActive.concat(key).join(\"+\");\n      return typeof handlers[combo] === \"function\" ? handlers[combo](e) : void 0;\n    };\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "lib/assert": {
          "path": "lib/assert",
          "content": "(function() {\n  module.exports = function(condition, message) {\n    if (!condition) {\n      throw new Error(message);\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "lib/indent-parse": {
          "path": "lib/indent-parse",
          "content": "(function() {\n  var parse, top;\n\n  top = function(stack) {\n    return stack[stack.length - 1];\n  };\n\n  parse = function(source) {\n    var depth, indentation, stack;\n    stack = [[]];\n    indentation = /^(  )*/;\n    depth = 0;\n    source.split(\"\\n\").forEach(function(line, lineNumber) {\n      var current, items, match, newDepth, prev, text;\n      match = line.match(indentation)[0];\n      text = line.replace(match, \"\");\n      newDepth = match.length / 2;\n      if (!text.trim().length) {\n        return;\n      }\n      current = text;\n      if (newDepth > depth) {\n        if (newDepth !== depth + 1) {\n          throw new Error(\"Unexpected indentation on line \" + lineNumber);\n        }\n        items = [];\n        prev = top(stack);\n        prev.push([prev.pop(), items]);\n        stack.push(items);\n      } else if (newDepth < depth) {\n        stack = stack.slice(0, newDepth + 1);\n      }\n      depth = newDepth;\n      return top(stack).push(current);\n    });\n    return stack[0];\n  };\n\n  module.exports = parse;\n\n}).call(this);\n",
          "type": "blob"
        },
        "main": {
          "path": "main",
          "content": "(function() {\n  if (PACKAGE.name === \"ROOT\") {\n    require(\"./demo\");\n  } else {\n    module.exports = require(\"./export\");\n  }\n\n}).call(this);\n",
          "type": "blob"
        },
        "modal": {
          "path": "modal",
          "content": "\n/*\nModal\n\nDisplay modal alerts or dialogs.\n\nModal has promise returning equivalents of the native browser:\n\n- Alert\n- Confirm\n- Prompt\n\nThese accept the same arguments and return a promise fulfilled with\nthe same return value as the native methods.\n\nYou can display any element in the modal:\n\n    modal.show myElement\n */\n\n(function() {\n  var Modal, ModalTemplate, PromptTemplate, cancellable, closeHandler, empty, formDataToObject, handle, modal, prompt, _ref;\n\n  _ref = require(\"./util\"), formDataToObject = _ref.formDataToObject, handle = _ref.handle, empty = _ref.empty;\n\n  PromptTemplate = require(\"./templates/modal/prompt\");\n\n  ModalTemplate = require(\"./templates/modal\");\n\n  modal = ModalTemplate();\n\n  cancellable = true;\n\n  modal.onclick = function(e) {\n    if (e.target === modal && cancellable) {\n      return Modal.hide();\n    }\n  };\n\n  document.addEventListener(\"keydown\", function(e) {\n    if (!e.defaultPrevented) {\n      if (e.key === \"Escape\" && cancellable) {\n        e.preventDefault();\n        return Modal.hide();\n      }\n    }\n  });\n\n  document.body.appendChild(modal);\n\n  closeHandler = null;\n\n  prompt = function(params) {\n    return new Promise(function(resolve) {\n      var element, _ref1;\n      element = PromptTemplate(params);\n      Modal.show(element, {\n        cancellable: false,\n        closeHandler: resolve\n      });\n      return (_ref1 = element.querySelector(params.focus)) != null ? _ref1.focus() : void 0;\n    });\n  };\n\n  module.exports = Modal = {\n    show: function(element, options) {\n      if (typeof options === \"function\") {\n        closeHandler = options;\n      } else {\n        closeHandler = options != null ? options.closeHandler : void 0;\n        if ((options != null ? options.cancellable : void 0) != null) {\n          cancellable = options.cancellable;\n        }\n      }\n      empty(modal).appendChild(element);\n      return modal.classList.add(\"active\");\n    },\n    hide: function(dataForHandler) {\n      if (typeof closeHandler === \"function\") {\n        closeHandler(dataForHandler);\n      }\n      modal.classList.remove(\"active\");\n      cancellable = true;\n      return empty(modal);\n    },\n    alert: function(message) {\n      return prompt({\n        title: \"Alert\",\n        message: message,\n        focus: \"button\",\n        confirm: handle(function() {\n          return Modal.hide();\n        })\n      });\n    },\n    prompt: function(message, defaultValue) {\n      if (defaultValue == null) {\n        defaultValue = \"\";\n      }\n      return prompt({\n        title: \"Prompt\",\n        message: message,\n        focus: \"input\",\n        defaultValue: defaultValue,\n        cancel: handle(function() {\n          return Modal.hide(null);\n        }),\n        confirm: handle(function() {\n          return Modal.hide(modal.querySelector(\"input\").value);\n        })\n      });\n    },\n    confirm: function(message) {\n      return prompt({\n        title: \"Confirm\",\n        message: message,\n        focus: \"button\",\n        cancel: handle(function() {\n          return Modal.hide(false);\n        }),\n        confirm: handle(function() {\n          return Modal.hide(true);\n        })\n      });\n    },\n    form: function(formElement) {\n      return new Promise(function(resolve) {\n        var submitHandler;\n        submitHandler = handle(function(e) {\n          var formData, result;\n          formData = new FormData(formElement);\n          result = formDataToObject(formData);\n          return Modal.hide(result);\n        });\n        formElement.addEventListener(\"submit\", submitHandler);\n        return Modal.show(formElement, function(result) {\n          formElement.removeEventListener(\"submit\", submitHandler);\n          return resolve(result);\n        });\n      });\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.9\",\"entryPoint\":\"main\",\"remoteDependencies\":[],\"dependencies\":{\"observable\":\"distri/observable:master\",\"bindable\":\"distri/bindable:master\"}};",
          "type": "blob"
        },
        "samples/notepad-menu": {
          "path": "samples/notepad-menu",
          "content": "(function() {\n  module.exports = \"[F]ile\\n  [N]ew\\n  [O]pen\\n  [S]ave\\n  Save [A]s\\n  -\\n  Page Set[u]p\\n  [P]rint\\n  -\\n  E[x]it\\n[E]dit\\n  [U]ndo\\n  Redo\\n  -\\n  Cu[t]\\n  [C]opy\\n  [P]aste\\n  De[l]ete\\n  -\\n  [F]ind\\n  Find [N]ext\\n  [R]eplace\\n  [G]o To\\n  -\\n  Select [A]ll\\n  Time/[D]ate\\nF[o]rmat\\n  [W]ord Wrap\\n  [F]ont...\\n[V]iew\\n  [S]tatus Bar\\n[H]elp\\n  View [H]elp\\n  -\\n  [A]bout Notepad\";\n\n}).call(this);\n",
          "type": "blob"
        },
        "samples/test-form": {
          "path": "samples/test-form",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"form\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"h1\", this, {}, function(__root) {\n        __root.buffer(\"Cool Form Bro\\n\");\n      }));\n      __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n        __root.buffer(__root.element(\"a\", this, {\n          \"href\": \"https://yolo.biz\"\n        }, function(__root) {\n          __root.buffer(\"Yolo\\n\");\n        }));\n      }));\n      __root.buffer(__root.element(\"input\", this, {\n        \"name\": \"yolo\"\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"input\", this, {\n        \"name\": \"x\",\n        \"value\": \"Lorem\"\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"input\", this, {\n        \"name\": \"y\",\n        \"value\": \"florem\"\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"input\", this, {\n        \"name\": \"z\",\n        \"type\": \"number\",\n        \"value\": 5\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"input\", this, {\n        \"name\": \"file\",\n        \"type\": \"file\"\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"textarea\", this, {\n        \"name\": \"text\"\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"button\", this, {}, function(__root) {\n        __root.buffer(\"Submit\\n\");\n      }));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "style": {
          "path": "style",
          "content": "(function() {\n  var all, styles;\n\n  styles = {};\n\n  all = \"main\\nloader\\nmenu\\nmodal\\ntable\\nwindow\".split(\"\\n\").map(function(stylePath) {\n    var content;\n    content = require(\"./style/\" + stylePath);\n    styles[stylePath] = content;\n    return content;\n  }).join(\"\\n\");\n\n  styles.all = all;\n\n  module.exports = styles;\n\n}).call(this);\n",
          "type": "blob"
        },
        "style/loader": {
          "path": "style/loader",
          "content": "module.exports = \"loader {\\n  display: block;\\n  padding: 1em;\\n}\\nloader > p:empty {\\n  margin: 0;\\n}\\nloader > progress {\\n  display: block;\\n}\\n\";",
          "type": "blob"
        },
        "style/main": {
          "path": "style/main",
          "content": "module.exports = \"* {\\n  box-sizing: border-box;\\n}\\nbody {\\n  display: flex;\\n  flex-direction: column;\\n  font-family: Sans-Serif;\\n  font-size: 14px;\\n  margin: 0;\\n}\\nbody,\\nhtml {\\n  height: 100%;\\n}\\ninput,\\ntextarea,\\nkeygen,\\nselect,\\nbutton {\\n  font-size: inherit;\\n  font-family: inherit;\\n}\\n\";",
          "type": "blob"
        },
        "style/menu": {
          "path": "style/menu",
          "content": "module.exports = \"menu {\\n  user-select: none;\\n  -moz-user-select: none;\\n  -webkit-user-select: none;\\n  -ms-user-select: none;\\n  background-color: #d3d3d3;\\n  border-bottom: 1px solid rgba(0,0,0,0.5);\\n  line-height: 18px;\\n  margin: 0;\\n  z-index: 1;\\n}\\nmenu:focus {\\n  outline: none;\\n}\\nmenu.context {\\n  z-index: 2000;\\n}\\nmenu-item {\\n  display: block;\\n  list-style-type: none;\\n}\\nmenu-item.active {\\n  background-color: #000080;\\n  color: #fff;\\n}\\nmenu-item > label {\\n  display: flex;\\n  padding: 0 0.25em;\\n  white-space: nowrap;\\n}\\nmenu-item > label > * {\\n  flex: 1 1 auto;\\n}\\nmenu-item > label > span.hotkey {\\n  margin-left: 1em;\\n}\\nmenu-item > label > span.hotkey:empty {\\n  margin-left: 0;\\n}\\nmenu-item > label > .decoration {\\n  align-self: center;\\n  flex: 0 1 auto;\\n  line-height: 1em;\\n  text-align: right;\\n  margin-left: 0.5em;\\n  padding-bottom: 0.125em;\\n}\\nmenu-item > label > .decoration:empty {\\n  margin-left: 0;\\n}\\nmenu-item[disabled] {\\n  color: #808080;\\n}\\nmenu-item[disabled].active {\\n  background-color: rgba(0,0,0,0.125);\\n}\\nmenu.options {\\n  border-top: 1px solid rgba(255,255,255,0.5);\\n  border-left: 1px solid rgba(255,255,255,0.5);\\n  border-right: 1px solid rgba(0,0,0,0.5);\\n  box-shadow: 2px 2px 1px rgba(0,0,0,0.5);\\n  display: none;\\n  padding: 2px;\\n  padding-bottom: 3px;\\n  position: absolute;\\n}\\nmenu.options.active {\\n  display: block;\\n}\\nmenu.options > menu-item.menu {\\n  position: relative;\\n}\\nmenu.options > menu-item.menu > menu {\\n  position: absolute;\\n  left: 100%;\\n  top: -3px;\\n  margin-left: 1px;\\n}\\nmenu-item.menu.active > menu {\\n  background-color: #d3d3d3;\\n  color: #000;\\n  display: block;\\n}\\nmenu.bar {\\n  display: block;\\n  flex: 0 0 auto;\\n  margin: 0;\\n  padding: 0;\\n  position: initial;\\n  white-space: nowrap;\\n  overflow: hidden;\\n}\\nmenu.bar > menu-item {\\n  display: inline-block;\\n}\\nmenu.bar > menu-item > label > .decoration {\\n  display: none;\\n}\\nmenu.bar.accelerator-active span.accelerator {\\n  text-decoration: underline;\\n}\\nmenu.options.bottoms-up menu-item.menu > menu {\\n  top: initial;\\n  bottom: -4px;\\n}\\n\";",
          "type": "blob"
        },
        "style/modal": {
          "path": "style/modal",
          "content": "module.exports = \"#modal {\\n  align-items: center;\\n  background-color: rgba(0,0,0,0.25);\\n  display: none;\\n  justify-content: center;\\n  position: absolute;\\n  z-index: 1000;\\n  top: 0;\\n  width: 100%;\\n  height: 100%;\\n}\\n#modal.active {\\n  display: flex;\\n}\\n#modal > * {\\n  background-color: #fff;\\n  border: 1px solid rgba(0,0,0,0.5);\\n  box-shadow: 2px 2px 6px #000;\\n  max-width: 90%;\\n  max-height: 90%;\\n}\\n#modal > form {\\n  display: block;\\n  padding: 1em;\\n}\\n#modal > form > h1 {\\n  font-size: 1.5em;\\n  margin: 0;\\n}\\n#modal > form > input,\\n#modal > form textarea {\\n  display: block;\\n  margin-bottom: 1em;\\n  width: 100%;\\n}\\n#modal > form > button {\\n  margin-right: 1em;\\n}\\n#modal > form > button:last-child {\\n  margin-right: 0;\\n}\\n\";",
          "type": "blob"
        },
        "style/table": {
          "path": "style/table",
          "content": "module.exports = \"container {\\n  display: block;\\n  height: 100%;\\n  overflow: auto;\\n  width: 100%;\\n}\\ntable {\\n  border-collapse: collapse;\\n  width: 100%;\\n}\\nth {\\n  text-align: left;\\n}\\nthead {\\n  border-bottom: 1px solid #000;\\n}\\ntd > input {\\n  border: none;\\n  background-color: transparent;\\n  width: 100%;\\n  height: 100%;\\n  padding: 0;\\n}\\ntr:nth-child(even) {\\n  background-color: #eee;\\n}\\n\";",
          "type": "blob"
        },
        "style/window": {
          "path": "style/window",
          "content": "module.exports = \"desktop {\\n  user-select: none;\\n  -moz-user-select: none;\\n  -webkit-user-select: none;\\n  -ms-user-select: none;\\n  display: block;\\n  flex: 1 0 auto;\\n}\\nwindow {\\n  user-select: none;\\n  -moz-user-select: none;\\n  -webkit-user-select: none;\\n  -ms-user-select: none;\\n  background-color: #d3d3d3;\\n  border: 4px double rgba(0,0,0,0.87);\\n  border-radius: 4px;\\n  display: flex;\\n  flex-direction: column;\\n  position: absolute;\\n}\\nwindow > header {\\n  background-color: #000080;\\n  border-bottom: 1px solid rgba(0,0,0,0.87);\\n  cursor: default;\\n  display: flex;\\n  flex: 0 0 auto;\\n}\\nwindow > header > icon {\\n  background-position: 50%;\\n  background-repeat: no-repeat;\\n  background-size: 16px;\\n  color: #fff;\\n  display: inline-block;\\n  flex: 0 0 auto;\\n  text-align: center;\\n  width: 0;\\n}\\nwindow > header > control {\\n  background-color: #d3d3d3;\\n  color: #fff;\\n  display: inline-block;\\n  flex: 0 0 auto;\\n  font-family: monospace;\\n  width: 18px;\\n  text-shadow: 1px 0px 0px #000, -1px 0px 0px #000, 0px -1px 0px #000, 0px 1px 0px #000, 1px 1px 0px #808080;\\n  text-align: center;\\n  border-left: 1px solid rgba(0,0,0,0.87);\\n}\\nwindow > header > control:first-child {\\n  border-left: none;\\n}\\nwindow > header > control.close::before {\\n  content: \\\"X\\\";\\n}\\nwindow > header > control.maximize::before {\\n  content: \\\"⏫\\\";\\n}\\nwindow > header > control.minimize::before {\\n  content: \\\"-\\\";\\n}\\nwindow > header > control.restore {\\n  display: none;\\n}\\nwindow > header > control.restore::before {\\n  content: \\\"⏬\\\";\\n}\\nwindow > header > title-bar {\\n  color: #fff;\\n  display: inline-block;\\n  flex: 1 1 auto;\\n  overflow: hidden;\\n  padding: 0 1rem 0 6px;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\nwindow > viewport {\\n  background-color: #fff;\\n  display: flex;\\n  height: 100%;\\n  overflow: auto;\\n  position: relative;\\n  z-index: 0;\\n}\\nwindow > viewport > * {\\n  margin: auto;\\n}\\nwindow > viewport > textarea {\\n  border: none;\\n  font-family: monospace;\\n  height: 100%;\\n  padding: 2px 4px;\\n  resize: none;\\n  width: 100%;\\n}\\nwindow > viewport > iframe {\\n  border: none;\\n  height: 100%;\\n  width: 100%;\\n  position: absolute;\\n}\\nwindow > resize {\\n  display: block;\\n  position: absolute;\\n}\\nwindow > resize.e,\\nwindow > resize.w {\\n  cursor: ew-resize;\\n}\\nwindow > resize.n,\\nwindow > resize.s {\\n  cursor: ns-resize;\\n}\\nwindow > resize.h {\\n  height: 4px;\\n  width: 100%;\\n}\\nwindow > resize.v {\\n  height: 100%;\\n  width: 4px;\\n}\\nwindow > resize.w {\\n  left: -4px;\\n}\\nwindow > resize.e {\\n  right: -4px;\\n}\\nwindow > resize.n {\\n  top: -4px;\\n}\\nwindow > resize.s {\\n  bottom: -4px;\\n}\\nwindow > resize.n.w {\\n  cursor: nw-resize;\\n}\\nwindow > resize.n.e {\\n  cursor: ne-resize;\\n}\\nwindow > resize.s.e {\\n  cursor: se-resize;\\n}\\nwindow > resize.s.w {\\n  cursor: sw-resize;\\n}\\nwindow > resize.n.v {\\n  border-bottom: 1px solid #000;\\n  height: 23px;\\n}\\nwindow > resize.s.v {\\n  border-top: 1px solid #000;\\n  height: 23px;\\n}\\nwindow > resize.e.h {\\n  border-left: 1px solid #000;\\n  width: 22px;\\n}\\nwindow > resize.w.h {\\n  border-right: 1px solid #000;\\n  width: 22px;\\n}\\nwindow.minimized > header {\\n  border-bottom: none;\\n}\\nwindow.minimized > header > control {\\n  display: none;\\n}\\nwindow.minimized > header > control.minimize {\\n  border-right: none;\\n  display: inline-block;\\n}\\nwindow.minimized > header > control.minimize::before {\\n  content: \\\"+\\\";\\n}\\nwindow.minimized > menu,\\nwindow.minimized > resize,\\nwindow.minimized > viewport {\\n  display: none;\\n}\\nwindow.maximized {\\n  border: none;\\n  border-radius: 0;\\n  height: 100%;\\n  width: 100%;\\n}\\nwindow.maximized > resize {\\n  display: none;\\n}\\nwindow.maximized > header > control {\\n  display: none;\\n}\\nwindow.maximized > header > control.restore,\\nwindow.maximized > header > control.close {\\n  display: inline-block;\\n}\\nframe-guard {\\n  display: block;\\n  height: 100%;\\n  pointer-events: none;\\n  position: absolute;\\n  width: 100%;\\n  z-index: 100000;\\n}\\nframe-guard.active {\\n  pointer-events: auto;\\n}\\n\";",
          "type": "blob"
        },
        "templates/input": {
          "path": "templates/input",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"input\", this, {\n      \"value\": this.value,\n      \"type\": this.type\n    }, function(__root) {}));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/menu-item": {
          "path": "templates/menu-item",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"menu-item\", this, {\n      \"class\": [this[\"class\"]],\n      \"click\": this.click,\n      \"mousemove\": this.mousemove,\n      \"disabled\": this.disabled\n    }, function(__root) {\n      __root.buffer(__root.element(\"label\", this, {}, function(__root) {\n        __root.buffer(this.title);\n        __root.buffer(__root.element(\"span\", this, {\n          \"class\": [\"hotkey\"]\n        }, function(__root) {\n          __root.buffer(this.hotkey);\n        }));\n        __root.buffer(__root.element(\"span\", this, {\n          \"class\": [\"decoration\"]\n        }, function(__root) {\n          __root.buffer(this.decoration);\n        }));\n      }));\n      __root.buffer(this.content);\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/menu-separator": {
          "path": "templates/menu-separator",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"menu-item\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"hr\", this, {}, function(__root) {}));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/menu": {
          "path": "templates/menu",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"menu\", this, {\n      \"class\": [this[\"class\"]],\n      style: [this.style],\n      \"click\": this.click\n    }, function(__root) {\n      __root.buffer(this.items);\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/modal": {
          "path": "templates/modal",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"div\", this, {\n      id: [\"modal\"]\n    }, function(__root) {}));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/modal/prompt": {
          "path": "templates/modal/prompt",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"form\", this, {\n      \"submit\": this.confirm,\n      \"tabindex\": -1\n    }, function(__root) {\n      __root.buffer(__root.element(\"h1\", this, {}, function(__root) {\n        __root.buffer(this.title);\n      }));\n      __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n        __root.buffer(this.message);\n      }));\n      if (this.defaultValue != null) {\n        __root.buffer(__root.element(\"input\", this, {\n          \"type\": \"text\",\n          \"value\": this.defaultValue\n        }, function(__root) {}));\n      }\n      __root.buffer(__root.element(\"button\", this, {}, function(__root) {\n        __root.buffer(\"OK\\n\");\n      }));\n      if (this.cancel) {\n        __root.buffer(__root.element(\"button\", this, {\n          \"click\": this.cancel\n        }, function(__root) {\n          __root.buffer(\"Cancel\\n\");\n        }));\n      }\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/progress": {
          "path": "templates/progress",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"loader\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n        __root.buffer(this.message);\n      }));\n      __root.buffer(__root.element(\"progress\", this, {\n        \"class\": [this[\"class\"]],\n        \"value\": this.value,\n        \"max\": this.max\n      }, function(__root) {}));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/table": {
          "path": "templates/table",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"container\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"table\", this, {\n        \"keydown\": this.keydown\n      }, function(__root) {\n        __root.buffer(__root.element(\"thead\", this, {}, function(__root) {\n          __root.buffer(__root.element(\"tr\", this, {}, function(__root) {\n            this.headers.forEach(function(header) {\n              return __root.buffer(__root.element(\"th\", this, {}, function(__root) {\n                __root.buffer(header);\n              }));\n            });\n          }));\n        }));\n        __root.buffer(__root.element(\"tbody\", this, {}, function(__root) {}));\n      }));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "templates/window": {
          "path": "templates/window",
          "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/jadelet-runtime\")(this);\n    __root.buffer(__root.element(\"window\", this, {\n      \"class\": [this[\"class\"]]\n    }, function(__root) {\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"n\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"e\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"s\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"w\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"n\", \"e\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"n\", \"e\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"n\", \"w\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"n\", \"w\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"s\", \"e\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"s\", \"e\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"s\", \"w\", \"h\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"resize\", this, {\n        \"class\": [\"s\", \"w\", \"v\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"header\", this, {}, function(__root) {\n        __root.buffer(__root.element(\"icon\", this, {\n          style: [this.iconStyle]\n        }, function(__root) {\n          __root.buffer(this.iconEmoji);\n        }));\n        __root.buffer(__root.element(\"title-bar\", this, {}, function(__root) {\n          __root.buffer(this.title);\n        }));\n        __root.buffer(__root.element(\"control\", this, {\n          \"class\": [\"minimize\"],\n          \"click\": this.minimize\n        }, function(__root) {}));\n        __root.buffer(__root.element(\"control\", this, {\n          \"class\": [\"maximize\"],\n          \"click\": this.maximize\n        }, function(__root) {}));\n        __root.buffer(__root.element(\"control\", this, {\n          \"class\": [\"restore\"],\n          \"click\": this.restore\n        }, function(__root) {}));\n        __root.buffer(__root.element(\"control\", this, {\n          \"class\": [\"close\"],\n          \"click\": this.close\n        }, function(__root) {}));\n      }));\n      __root.buffer(this.menuBar);\n      __root.buffer(__root.element(\"viewport\", this, {}, function(__root) {\n        __root.buffer(this.content);\n      }));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
          "type": "blob"
        },
        "test/menu-item": {
          "path": "test/menu-item",
          "content": "(function() {\n  var MenuItemView, Observable;\n\n  MenuItemView = require(\"../views/menu-item\");\n\n  Observable = require(\"observable\");\n\n  describe(\"MenuItem\", function() {\n    return it(\"should have correct custom action names\", function() {\n      var called, menuItem;\n      called = false;\n      menuItem = MenuItemView({\n        label: \"Cool -> Super Cool\",\n        contextRoot: {\n          activeItem: function() {},\n          handlers: {\n            \"Super Cool\": function() {\n              return called = true;\n            }\n          }\n        }\n      });\n      assert(!called);\n      menuItem.click();\n      return assert(called);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/menu-parser": {
          "path": "test/menu-parser",
          "content": "(function() {\n  var parse;\n\n  parse = require(\"../lib/indent-parse\");\n\n  describe(\"Menu Parser\", function() {\n    it(\"should parse menus into lists\", function() {\n      var data, results;\n      data = \"File\";\n      results = parse(data);\n      return assert.deepEqual([\"File\"], results);\n    });\n    it(\"should parse empty\", function() {\n      var data;\n      data = \"\";\n      return assert.deepEqual([], parse(data));\n    });\n    it(\"should deal with nesting ok\", function() {\n      var data, results;\n      data = \"File\\n  Open\\n  Save\\nEdit\\n  Copy\\n  Paste\\nHelp\";\n      results = parse(data);\n      return assert.deepEqual([[\"File\", [\"Open\", \"Save\"]], [\"Edit\", [\"Copy\", \"Paste\"]], \"Help\"], results);\n    });\n    it(\"should parse big ol' menus\", function() {\n      var results;\n      results = parse(\"File\\n  New\\n  Open\\n  Save\\n  Save As\\nEdit\\n  Undo\\n  Redo\\n  -\\n  Cut\\n  Copy\\n  Paste\\n  Delete\\n  -\\n  Find\\n  Find Next\\n  Replace\\n  Go To\\n  -\\n  Select All\\n  Time/Date\\nFormat\\n  Word Wrap\\n  Font...\\nView\\n  Status Bar\\nHelp\\n  View Help\\n  -\\n  About Notepad\");\n      return assert.deepEqual([[\"File\", [\"New\", \"Open\", \"Save\", \"Save As\"]], [\"Edit\", [\"Undo\", \"Redo\", \"-\", \"Cut\", \"Copy\", \"Paste\", \"Delete\", \"-\", \"Find\", \"Find Next\", \"Replace\", \"Go To\", \"-\", \"Select All\", \"Time/Date\"]], [\"Format\", [\"Word Wrap\", \"Font...\"]], [\"View\", [\"Status Bar\"]], [\"Help\", [\"View Help\", \"-\", \"About Notepad\"]]], results);\n    });\n    return it(\"should parse hella nested menus\", function() {\n      var results;\n      results = parse(\"File\\n  Special\\n    Nested\\n      Super\\n        Awesome\");\n      return assert.deepEqual([[\"File\", [[\"Special\", [[\"Nested\", [[\"Super\", [\"Awesome\"]]]]]]]]], results);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/menu": {
          "path": "test/menu",
          "content": "(function() {\n  var MenuView, Observable;\n\n  MenuView = require(\"../views/menu\");\n\n  Observable = require(\"observable\");\n\n  describe(\"Menu\", function() {\n    it(\"should work with plain ol' items\", function() {\n      var menu;\n      menu = MenuView({\n        items: [\"Cool\", \"Rad\"],\n        contextRoot: {\n          activeItem: Observable(null),\n          handlers: {}\n        }\n      });\n      return assert.equal(menu.items().length, 2);\n    });\n    return it(\"should allow observable items\", function() {\n      var items, menu;\n      items = Observable([\"Cool\", [\"Rad\", [\"2rad\", \"2Furious\"]]]);\n      menu = MenuView({\n        items: items,\n        contextRoot: {\n          activeItem: Observable(null),\n          handlers: {}\n        }\n      });\n      assert.equal(menu.items().length, 2);\n      items([\"New Stuff\"]);\n      return assert.equal(menu.items().length, 1);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/modal": {
          "path": "test/modal",
          "content": "(function() {\n  var Modal;\n\n  PACKAGE.name = \"test\";\n\n  Modal = require(\"../main\").Modal;\n\n  describe(\"Modal\", function() {\n    return it(\"shoud be totally chill\", function() {\n      var called, element, handler;\n      element = document.createElement(\"p\");\n      called = false;\n      handler = function(value) {\n        called = true;\n        return assert.equal(value, \"yolo\");\n      };\n      Modal.show(element, handler);\n      Modal.hide('yolo');\n      return assert(called);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "util": {
          "path": "util",
          "content": "(function() {\n  var A, F, Observable, S, accelerateItem, advance, asElement, elementView, empty, entityMap, formDataToObject, get, handle, isDescendant, o;\n\n  Observable = require(\"observable\");\n\n  A = function(attr) {\n    return function(x) {\n      return x[attr];\n    };\n  };\n\n  F = function(methodName) {\n    return function(x) {\n      return x[methodName]();\n    };\n  };\n\n  get = function(x, context) {\n    if (typeof x === 'function') {\n      return x.call(context);\n    } else {\n      return x;\n    }\n  };\n\n  o = function(object, name) {\n    var attribute;\n    attribute = Observable(object[name]);\n    attribute.observe(function(newValue) {\n      return object[name] = newValue;\n    });\n    return attribute;\n  };\n\n  handle = function(fn) {\n    return function(e) {\n      if (e != null ? e.defaultPrevented : void 0) {\n        return;\n      }\n      if (e != null) {\n        e.preventDefault();\n      }\n      return fn.call(this, e);\n    };\n  };\n\n  S = function(object, method, defaultValue) {\n    return function() {\n      if (typeof (object != null ? object[method] : void 0) === 'function') {\n        return object[method]();\n      } else {\n        return defaultValue;\n      }\n    };\n  };\n\n  asElement = A('element');\n\n  accelerateItem = function(items, key) {\n    var acceleratedItem;\n    acceleratedItem = items.filter(function(item) {\n      return item.accelerator === key;\n    })[0];\n    if (acceleratedItem) {\n      return acceleratedItem.click();\n    }\n  };\n\n  isDescendant = function(element, ancestor) {\n    var parent;\n    if (!element) {\n      return;\n    }\n    while ((parent = element.parentElement)) {\n      if (element === ancestor) {\n        return true;\n      }\n      element = parent;\n    }\n  };\n\n  advance = function(list, amount) {\n    var activeItemIndex, currentItem;\n    currentItem = list.filter(function(item) {\n      return item.active();\n    })[0];\n    activeItemIndex = list.indexOf(currentItem) + amount;\n    if (activeItemIndex < 0) {\n      activeItemIndex = list.length - 1;\n    } else if (activeItemIndex >= list.length) {\n      activeItemIndex = 0;\n    }\n    return list[activeItemIndex];\n  };\n\n  formDataToObject = function(formData) {\n    return Array.from(formData.entries()).reduce(function(object, _arg) {\n      var key, value;\n      key = _arg[0], value = _arg[1];\n      object[key] = value;\n      return object;\n    }, {});\n  };\n\n  elementView = function(element) {\n    if (!element) {\n      return;\n    }\n    if (element.view) {\n      return element.view;\n    }\n    return elementView(element.parentElement);\n  };\n\n  empty = function(node) {\n    while (node.hasChildNodes()) {\n      node.removeChild(node.lastChild);\n    }\n    return node;\n  };\n\n  module.exports = {\n    htmlEscape: function(string) {\n      return String(string).replace(/[&<>\"'\\/]/g, function(s) {\n        return entityMap[s];\n      });\n    },\n    A: A,\n    F: F,\n    S: S,\n    o: o,\n    advance: advance,\n    asElement: asElement,\n    accelerateItem: accelerateItem,\n    elementView: elementView,\n    empty: empty,\n    formDataToObject: formDataToObject,\n    get: get,\n    handle: handle,\n    isDescendant: isDescendant\n  };\n\n  entityMap = {\n    \"&\": \"&amp;\",\n    \"<\": \"&lt;\",\n    \">\": \"&gt;\",\n    '\"': '&quot;',\n    \"'\": '&#39;',\n    \"/\": '&#x2F;'\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/context-menu": {
          "path": "views/context-menu",
          "content": "\n/*\nContextMenu\n\nDisplay a context menu!\n\nQuestions:\n\nShould we be able to update the options in the menu after creation?\n */\n\n(function() {\n  var MenuView, Observable, isDescendant;\n\n  Observable = require(\"observable\");\n\n  MenuView = require(\"./menu\");\n\n  isDescendant = require(\"../util\").isDescendant;\n\n  module.exports = function(_arg) {\n    var activeItem, classes, contextRoot, element, handlers, items, left, self, top;\n    items = _arg.items, classes = _arg.classes, handlers = _arg.handlers;\n    activeItem = Observable(null);\n    if (classes == null) {\n      classes = [];\n    }\n    top = Observable(\"\");\n    left = Observable(\"\");\n    contextRoot = {\n      activeItem: activeItem,\n      handlers: handlers\n    };\n    self = MenuView({\n      items: items,\n      contextRoot: contextRoot,\n      classes: function() {\n        return [\"context\", \"options\"].concat(classes);\n      },\n      style: function() {\n        return \"top: \" + (top()) + \"px; left: \" + (left()) + \"px\";\n      }\n    });\n    element = self.element;\n    element.view = self;\n    self.contextRoot = contextRoot;\n    self.display = function(_arg1) {\n      var inElement, x, y;\n      inElement = _arg1.inElement, x = _arg1.x, y = _arg1.y;\n      top(y);\n      left(x);\n      (inElement || document.body).appendChild(element);\n      activeItem(self);\n      return element.focus();\n    };\n    document.addEventListener(\"mousedown\", function(e) {\n      if (!isDescendant(e.target, element)) {\n        return activeItem(null);\n      }\n    });\n    element.setAttribute(\"tabindex\", \"-1\");\n    element.addEventListener(\"keydown\", function(e) {\n      var currentItem, direction, key;\n      key = e.key;\n      switch (key) {\n        case \"ArrowLeft\":\n        case \"ArrowUp\":\n        case \"ArrowRight\":\n        case \"ArrowDown\":\n          e.preventDefault();\n          direction = key.replace(\"Arrow\", \"\");\n          currentItem = activeItem();\n          if (currentItem) {\n            return currentItem.cursor(direction);\n          }\n          break;\n        case \"Escape\":\n          return activeItem(null);\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/menu-bar": {
          "path": "views/menu-bar",
          "content": "(function() {\n  var MenuView, Observable, advance, isDescendant, _ref;\n\n  Observable = require(\"observable\");\n\n  MenuView = require(\"./menu\");\n\n  _ref = require(\"../util\"), isDescendant = _ref.isDescendant, advance = _ref.advance;\n\n  module.exports = function(_arg) {\n    var accelerateIfActive, acceleratorActive, activeItem, contextRoot, deactivate, element, handlers, items, previouslyFocusedElement, self;\n    items = _arg.items, handlers = _arg.handlers;\n    acceleratorActive = Observable(false);\n    activeItem = Observable(null);\n    previouslyFocusedElement = null;\n    contextRoot = {\n      activeItem: activeItem,\n      handlers: handlers\n    };\n    self = MenuView({\n      classes: function() {\n        return [\"bar\", acceleratorActive() ? \"accelerator-active\" : void 0];\n      },\n      items: items,\n      contextRoot: contextRoot\n    });\n    element = self.element;\n    self.cursor = function(direction) {\n      switch (direction) {\n        case \"Right\":\n          return self.advance(1);\n        case \"Left\":\n          return self.advance(-1);\n      }\n    };\n    self.items.forEach(function(item) {\n      item.horizontal = true;\n      return item.cursor = function(direction) {\n        var _ref1, _ref2;\n        console.log(\"Item\", direction);\n        if (direction === \"Down\") {\n          return (_ref1 = item.submenu) != null ? _ref1.advance(1) : void 0;\n        } else if (direction === \"Up\") {\n          return (_ref2 = item.submenu) != null ? _ref2.advance(-1) : void 0;\n        } else {\n          return item.parent.cursor(direction);\n        }\n      };\n    });\n    deactivate = function() {\n      activeItem(null);\n      acceleratorActive(false);\n      return previouslyFocusedElement != null ? previouslyFocusedElement.focus() : void 0;\n    };\n    document.addEventListener(\"mousedown\", function(e) {\n      if (!isDescendant(e.target, element)) {\n        acceleratorActive(false);\n        return activeItem(null);\n      }\n    });\n    document.addEventListener(\"keydown\", function(e) {\n      var key, menuIsActive, _ref1;\n      key = e.key;\n      switch (key) {\n        case \"Enter\":\n          return (_ref1 = activeItem()) != null ? _ref1.click() : void 0;\n        case \"Alt\":\n          menuIsActive = false;\n          if (acceleratorActive() || menuIsActive) {\n            return deactivate();\n          } else {\n            previouslyFocusedElement = document.activeElement;\n            element.focus();\n            if (!activeItem()) {\n              activeItem(self);\n            }\n            return acceleratorActive(true);\n          }\n      }\n    });\n    accelerateIfActive = function(key) {\n      var _ref1;\n      if (acceleratorActive()) {\n        return (_ref1 = activeItem()) != null ? _ref1.accelerate(key) : void 0;\n      }\n    };\n    element.setAttribute(\"tabindex\", \"-1\");\n    element.addEventListener(\"keydown\", function(e) {\n      var accelerated, currentItem, direction, key;\n      key = e.key;\n      switch (key) {\n        case \"ArrowLeft\":\n        case \"ArrowUp\":\n        case \"ArrowRight\":\n        case \"ArrowDown\":\n          e.preventDefault();\n          direction = key.replace(\"Arrow\", \"\");\n          currentItem = activeItem();\n          if (currentItem) {\n            return currentItem.cursor(direction);\n          }\n          break;\n        case \"Escape\":\n          return deactivate();\n        default:\n          accelerated = accelerateIfActive(key.toLowerCase());\n          if (accelerated != null) {\n            return e.preventDefault();\n          }\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/menu-item": {
          "path": "views/menu-item",
          "content": "(function() {\n  var F, MenuItemTemplate, S, accelerateItem, advance, asElement, formatAction, formatLabel, handle, htmlEscape, isDescendant, _ref;\n\n  _ref = require(\"../util\"), advance = _ref.advance, htmlEscape = _ref.htmlEscape, asElement = _ref.asElement, F = _ref.F, S = _ref.S, isDescendant = _ref.isDescendant, accelerateItem = _ref.accelerateItem, handle = _ref.handle;\n\n  MenuItemTemplate = require(\"../templates/menu-item\");\n\n  module.exports = function(_arg) {\n    var MenuView, accelerator, action, actionName, active, activeItem, click, content, contextRoot, disabled, element, handlers, hotkey, items, label, labelText, parent, self, submenu, title, _ref1, _ref2;\n    label = _arg.label, MenuView = _arg.MenuView, items = _arg.items, contextRoot = _arg.contextRoot, parent = _arg.parent;\n    self = {};\n    activeItem = contextRoot.activeItem, handlers = contextRoot.handlers;\n    active = function() {\n      var _ref1;\n      return isDescendant((_ref1 = activeItem()) != null ? _ref1.element : void 0, element);\n    };\n    self.active = active;\n    if (items) {\n      submenu = MenuView({\n        items: items,\n        contextRoot: contextRoot,\n        parent: self\n      });\n      content = submenu.element;\n    }\n    _ref1 = formatAction(label), labelText = _ref1[0], actionName = _ref1[1];\n    _ref2 = formatLabel(labelText), title = _ref2[0], accelerator = _ref2[1];\n    action = handlers[actionName];\n    disabled = S(action, \"disabled\", false);\n    hotkey = S(action, \"hotkey\", \"\");\n    click = function(e) {\n      if (disabled()) {\n        return;\n      }\n      if (e != null ? e.defaultPrevented : void 0) {\n        return;\n      }\n      if (e != null) {\n        e.preventDefault();\n      }\n      if (submenu) {\n        activeItem(submenu);\n        return;\n      }\n      if (action != null) {\n        if (typeof action.call === \"function\") {\n          action.call(handlers);\n        }\n      }\n      return activeItem(null);\n    };\n    element = MenuItemTemplate({\n      \"class\": function() {\n        return [items ? \"menu\" : void 0, active() ? \"active\" : void 0];\n      },\n      click: click,\n      mousemove: function(e) {\n        if (!activeItem()) {\n          return;\n        }\n        if (!e.defaultPrevented && isDescendant(e.target, element)) {\n          e.preventDefault();\n          return activeItem(self);\n        }\n      },\n      title: title,\n      content: content,\n      decoration: items ? \"▸\" : void 0,\n      hotkey: hotkey,\n      disabled: disabled\n    });\n    Object.assign(self, {\n      accelerator: accelerator,\n      accelerate: function(key) {\n        if (submenu) {\n          return submenu.accelerate(key);\n        } else {\n          return parent.accelerate(key);\n        }\n      },\n      click: click,\n      parent: parent,\n      element: element,\n      submenu: submenu,\n      cursor: function(direction) {\n        console.log(\"Item Cursor\", direction);\n        if (submenu && direction === \"Right\") {\n          return activeItem(submenu.navigableItems[0]);\n        } else if (parent.parent && direction === \"Left\") {\n          if (parent.parent.horizontal) {\n            return parent.parent.cursor(direction);\n          } else {\n            return activeItem(parent.parent);\n          }\n        } else {\n          return parent.cursor(direction);\n        }\n      }\n    });\n    return self;\n  };\n\n  formatAction = function(labelText) {\n    var action, title, _ref1;\n    _ref1 = labelText.split(\"->\").map(F(\"trim\")), title = _ref1[0], action = _ref1[1];\n    if (!action) {\n      action = title.replace(/[^A-Za-z0-9]/g, \"\");\n      action = action.charAt(0).toLowerCase() + action.substring(1);\n    }\n    return [title, action];\n  };\n\n  formatLabel = function(labelText) {\n    var accelerator, span, titleHTML;\n    accelerator = void 0;\n    titleHTML = htmlEscape(labelText).replace(/\\[([^\\]]+)\\]/, function(match, $1) {\n      accelerator = $1.toLowerCase();\n      return \"<span class=\\\"accelerator\\\">\" + $1 + \"</span>\";\n    });\n    span = document.createElement(\"span\");\n    span.innerHTML = titleHTML;\n    return [span, accelerator];\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/menu-separator": {
          "path": "views/menu-separator",
          "content": "(function() {\n  var MenuSeparatorTemplate;\n\n  MenuSeparatorTemplate = require(\"../templates/menu-separator\");\n\n  module.exports = function() {\n    return {\n      element: MenuSeparatorTemplate(),\n      separator: true\n    };\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/menu": {
          "path": "views/menu",
          "content": "(function() {\n  var F, MenuItemTemplate, MenuItemView, MenuTemplate, MenuView, Observable, S, SeparatorView, accelerateItem, advance, asElement, assert, get, handle, htmlEscape, isDescendant, _ref;\n\n  Observable = require(\"observable\");\n\n  assert = require(\"../lib/assert\");\n\n  _ref = require(\"../util\"), advance = _ref.advance, accelerateItem = _ref.accelerateItem, asElement = _ref.asElement, get = _ref.get, F = _ref.F, S = _ref.S, htmlEscape = _ref.htmlEscape, handle = _ref.handle, isDescendant = _ref.isDescendant;\n\n  MenuTemplate = require(\"../templates/menu\");\n\n  MenuItemTemplate = require(\"../templates/menu-item\");\n\n  SeparatorView = require(\"./menu-separator\");\n\n  MenuItemView = require(\"./menu-item\");\n\n  module.exports = MenuView = function(_arg) {\n    var active, activeItem, classes, contextRoot, getItems, items, navigableItems, parent, self, style;\n    items = _arg.items, classes = _arg.classes, style = _arg.style, contextRoot = _arg.contextRoot, parent = _arg.parent;\n    self = {};\n    if (classes == null) {\n      classes = function() {\n        return [\"options\"];\n      };\n    }\n    activeItem = contextRoot.activeItem;\n    getItems = Observable(function() {\n      return items.map(function(item) {\n        var label, submenuItems;\n        switch (false) {\n          case !(typeof item === \"string\" && item.match(/^[=-]+$/)):\n            return SeparatorView();\n          case !Array.isArray(item):\n            assert(item.length === 2);\n            label = item[0], submenuItems = item[1];\n            return MenuItemView({\n              label: label,\n              items: submenuItems,\n              MenuView: MenuView,\n              contextRoot: contextRoot,\n              parent: self\n            });\n          default:\n            return MenuItemView({\n              label: item,\n              contextRoot: contextRoot,\n              parent: self\n            });\n        }\n      });\n    });\n    navigableItems = Observable(function() {\n      return getItems().filter(function(item) {\n        return !item.separator;\n      });\n    });\n    active = function() {\n      var _ref1;\n      return isDescendant((_ref1 = activeItem()) != null ? _ref1.element : void 0, self.element);\n    };\n    Object.assign(self, {\n      accelerate: function(key) {\n        return accelerateItem(getItems(), key);\n      },\n      cursor: function(direction) {\n        var _ref1;\n        switch (direction) {\n          case \"Up\":\n            return self.advance(-1);\n          case \"Down\":\n            return self.advance(1);\n          default:\n            return (_ref1 = parent.parent) != null ? _ref1.cursor(direction) : void 0;\n        }\n      },\n      parent: parent,\n      items: getItems,\n      advance: function(n) {\n        return activeItem(advance(navigableItems(), n));\n      },\n      navigableItems: navigableItems,\n      element: MenuTemplate({\n        style: style,\n        \"class\": function() {\n          return [active() ? \"active\" : void 0].concat(classes());\n        },\n        click: handle(function(e) {\n          return activeItem(self);\n        }),\n        items: function() {\n          return getItems().map(asElement);\n        }\n      })\n    });\n    return self;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/progress": {
          "path": "views/progress",
          "content": "(function() {\n  var Observable, Template;\n\n  Template = require(\"../templates/progress\");\n\n  Observable = require(\"observable\");\n\n  module.exports = function(params) {\n    var element, max, message, value;\n    if (params == null) {\n      params = {};\n    }\n    value = params.value, max = params.max, message = params.message;\n    value = Observable(value || 0);\n    max = Observable(max);\n    message = Observable(message);\n    element = Template({\n      value: value,\n      max: max,\n      message: message\n    });\n    return {\n      element: element,\n      value: value,\n      message: message,\n      max: max\n    };\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/table": {
          "path": "views/table",
          "content": "(function() {\n  var TableTemplate, TableView, advanceRow, empty;\n\n  empty = require(\"../util\").empty;\n\n  TableTemplate = require(\"../templates/table\");\n\n  advanceRow = function(path, prev) {\n    var cellIndex, input, nextRowElement, td, tr;\n    td = path.filter(function(element) {\n      return element.tagName === \"TD\";\n    })[0];\n    if (!td) {\n      return;\n    }\n    tr = td.parentElement;\n    cellIndex = Array.prototype.indexOf.call(tr.children, td);\n    if (prev) {\n      nextRowElement = tr.previousSibling;\n    } else {\n      nextRowElement = tr.nextSibling;\n    }\n    if (nextRowElement) {\n      input = nextRowElement.children[cellIndex].querySelector('input');\n      return input != null ? input.focus() : void 0;\n    }\n  };\n\n  TableView = function(_arg) {\n    var RowElement, containerElement, data, filterAndSort, filterFn, headers, rowElements, tableBody, update;\n    data = _arg.data, headers = _arg.headers, RowElement = _arg.RowElement;\n    if (headers == null) {\n      headers = Object.keys(data[0]);\n    }\n    containerElement = TableTemplate({\n      headers: headers,\n      keydown: function(event) {\n        var key, path;\n        key = event.key, path = event.path;\n        switch (key) {\n          case \"Enter\":\n          case \"ArrowDown\":\n            event.preventDefault();\n            return advanceRow(path);\n          case \"ArrowUp\":\n            event.preventDefault();\n            return advanceRow(path, true);\n        }\n      }\n    });\n    tableBody = containerElement.querySelector('tbody');\n    filterFn = function(datum) {\n      return true;\n    };\n    filterAndSort = function(data, filterFn, sortFn) {\n      var filteredData;\n      if (filterFn == null) {\n        filterFn = function() {\n          return true;\n        };\n      }\n      filteredData = data.filter(filterFn);\n      if (sortFn) {\n        return filteredData.sort(sortFn);\n      } else {\n        return filteredData;\n      }\n    };\n    rowElements = function() {\n      return filterAndSort(data, filterFn, null).map(RowElement);\n    };\n    update = function() {\n      empty(tableBody);\n      return rowElements().forEach(function(element) {\n        return tableBody.appendChild(element);\n      });\n    };\n    update();\n    return {\n      element: containerElement,\n      render: update\n    };\n  };\n\n  module.exports = TableView;\n\n}).call(this);\n",
          "type": "blob"
        },
        "views/window": {
          "path": "views/window",
          "content": "(function() {\n  var Bindable, Observable, WindowTemplate, activeDrag, activeResize, dragStart, elementView, frameGuard, raiseToTop, resizeInitial, resizeStart, styleBind, topIndex;\n\n  WindowTemplate = require(\"../templates/window\");\n\n  elementView = require(\"../util\").elementView;\n\n  frameGuard = document.createElement(\"frame-guard\");\n\n  document.body.appendChild(frameGuard);\n\n  topIndex = 0;\n\n  raiseToTop = function(view) {\n    var zIndex;\n    if (typeof view.zIndex !== 'function') {\n      return;\n    }\n    zIndex = view.zIndex();\n    if (zIndex === topIndex) {\n      return;\n    }\n    topIndex += 1;\n    return view.zIndex(topIndex);\n  };\n\n  activeDrag = null;\n\n  dragStart = null;\n\n  document.addEventListener(\"mousedown\", function(e) {\n    var target, view;\n    target = e.target;\n    view = elementView(target);\n    if (view) {\n      raiseToTop(view);\n    }\n    if (target.tagName === \"TITLE-BAR\") {\n      frameGuard.classList.add(\"active\");\n      dragStart = e;\n      return activeDrag = view;\n    }\n  });\n\n  document.addEventListener(\"mousemove\", function(e) {\n    var dx, dy, maximizedX, maximizedY, prevX, prevY, x, y;\n    if (activeDrag) {\n      prevX = dragStart.clientX, prevY = dragStart.clientY;\n      x = e.clientX, y = e.clientY;\n      if (activeDrag.maximized()) {\n        maximizedX = activeDrag.x();\n        maximizedY = activeDrag.y();\n        activeDrag.restore();\n        activeDrag.x(x - activeDrag.width() / 2);\n        activeDrag.y(maximizedY);\n      }\n      dx = x - prevX;\n      dy = y - prevY;\n      activeDrag.x(activeDrag.x() + dx);\n      activeDrag.y(activeDrag.y() + dy);\n      return dragStart = e;\n    }\n  });\n\n  activeResize = null;\n\n  resizeStart = null;\n\n  resizeInitial = null;\n\n  document.addEventListener(\"mousedown\", function(e) {\n    var height, target, width, x, y, _ref;\n    target = e.target;\n    if (target.tagName === \"RESIZE\") {\n      frameGuard.classList.add(\"active\");\n      resizeStart = e;\n      activeResize = target;\n      _ref = elementView(activeResize), width = _ref.width, height = _ref.height, x = _ref.x, y = _ref.y;\n      return resizeInitial = {\n        width: width(),\n        height: height(),\n        x: x(),\n        y: y()\n      };\n    }\n  });\n\n  document.addEventListener(\"mousemove\", function(e) {\n    var actualDeltaX, actualDeltaY, dx, dy, height, startX, startY, view, width, x, y;\n    if (activeResize) {\n      startX = resizeStart.clientX, startY = resizeStart.clientY;\n      x = e.clientX, y = e.clientY;\n      dx = x - startX;\n      dy = y - startY;\n      width = resizeInitial.width;\n      height = resizeInitial.height;\n      if (activeResize.classList.contains(\"e\")) {\n        width += dx;\n      }\n      if (activeResize.classList.contains(\"w\")) {\n        width -= dx;\n      }\n      if (activeResize.classList.contains(\"s\")) {\n        height += dy;\n      }\n      if (activeResize.classList.contains(\"n\")) {\n        height -= dy;\n      }\n      width = Math.max(width, 200);\n      height = Math.max(height, 50);\n      actualDeltaX = width - resizeInitial.width;\n      actualDeltaY = height - resizeInitial.height;\n      view = elementView(activeResize);\n      if (activeResize.classList.contains(\"n\")) {\n        view.y(resizeInitial.y - actualDeltaY);\n      }\n      if (activeResize.classList.contains(\"w\")) {\n        view.x(resizeInitial.x - actualDeltaX);\n      }\n      view.width(width);\n      view.height(height);\n      return view.trigger(\"resize\");\n    }\n  });\n\n  document.addEventListener(\"mouseup\", function() {\n    activeDrag = null;\n    activeResize = null;\n    return frameGuard.classList.remove(\"active\");\n  });\n\n  Bindable = require(\"bindable\");\n\n  Observable = require(\"observable\");\n\n  module.exports = function(params) {\n    var element, height, iconEmoji, iconStyle, iconURL, maximized, minimized, prevHeight, prevWidth, prevX, prevY, restore, self, title, width, x, y, zIndex, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;\n    self = Bindable();\n    x = Observable((_ref = params.x) != null ? _ref : 50);\n    y = Observable((_ref1 = params.y) != null ? _ref1 : 50);\n    width = Observable((_ref2 = params.width) != null ? _ref2 : 400);\n    height = Observable((_ref3 = params.height) != null ? _ref3 : 300);\n    title = Observable((_ref4 = params.title) != null ? _ref4 : \"Untitled\");\n    minimized = Observable(false);\n    maximized = Observable(false);\n    prevWidth = Observable(null);\n    prevHeight = Observable(null);\n    prevX = Observable(null);\n    prevY = Observable(null);\n    iconURL = Observable(params.iconURL || \"data:image/x-icon;base64,AAABAAIAICAQAAEABADoAgAAJgAAABAQEAABAAQAKAEAAA4DAAAoAAAAIAAAAEAAAAABAAQAAAAAAIACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAvwAAAL+/AL8AAAC/AL8Av78AAMDAwACAgIAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AAAAAAAAAAAAAAAAAAAAAAAACHd3d3d3d3d3d3d3dwAAAAj///////////////cAAAAI///////////////3AAAACP///////3d///d39wAAAAj/zMzM//mZ//+Zn/cAAAAI////////l///+X/3AAAACP/MzMzM//l3d3l/9wAAAAj/////////mZmZf/cAAAAI/8zMzMzM//l/+X/3AAAACP//////////l/l/9wAAAAj/zMzMzMzM//l5f/cAAAAI////////////mX/3AAAACP/MzMzMzMzM//n/9wAAAAj///////////////cAAAAI/8zMzMzMzMzMzP/3AAAACP//////////////9wAAAAj/zMzMzMzMzMzM//cAAAAI///////////////3AAAACP8AAAAA/8zMzMz/9wAAAAj/iZD/8P////////cAAAAI/4AAAAD/zMzMzP/3AAAACP+P8Luw////////9wAAAAj/gAC7sP/MzMzM//cAAAAI/4/wu7D////////3AAAACP+P8Luw/////4AAAAAAAAj/j/AAAP////+P94AAAAAI/4/wzMD/////j3gAAAAACP+IiIiA/////4eAAAAAAAj///////////+IAAAAAAAI////////////gAAAAAAACIiIiIiIiIiIiIAAAAAA4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAH4AAAB+AAAAfgAAAP4AAAH+AAAD/gAAB/4AAA/+AAAf8oAAAAEAAAACAAAAABAAQAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAvwAAAL+/AL8AAAC/AL8Av78AAMDAwACAgIAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AAAAAAAAAAAACHd3d3d3cAAI//////9wAAj8z5//n3AACP//+ZmfcAAI/MzPn59wAAj////5n3AACPzMzM+fcAAI//////9wAAjwAPzMz3AACPmY////cAAI/Pj8zM9wAAj8+P//AAAACPiI//9/gAAI/////3gAAAiIiIiIgAAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIADAACAAwAAgAMAAIAHAACADwAAgB8AAA==\");\n    iconEmoji = Observable(params.iconEmoji || null);\n    iconStyle = Observable(function() {\n      if (iconEmoji()) {\n        return \"width: 18px;\";\n      } else {\n        return \"background-image: url(\" + (iconURL()) + \");\\nwidth: 18px;\";\n      }\n    });\n    topIndex += 1;\n    zIndex = Observable((_ref5 = params.zIndex) != null ? _ref5 : topIndex);\n    element = WindowTemplate({\n      iconStyle: iconStyle,\n      iconEmoji: iconEmoji,\n      title: title,\n      menuBar: params.menuBar,\n      content: params.content,\n      \"class\": function() {\n        return [minimized() ? \"minimized\" : void 0, maximized() ? \"maximized\" : void 0];\n      },\n      close: function() {\n        return self.close();\n      },\n      minimize: function() {\n        return self.minimize();\n      },\n      maximize: function() {\n        return self.maximize();\n      },\n      restore: function() {\n        return self.restore();\n      }\n    });\n    styleBind(y, element, \"top\", \"px\");\n    styleBind(x, element, \"left\", \"px\");\n    styleBind(height, element, \"height\", \"px\");\n    styleBind(width, element, \"width\", \"px\");\n    styleBind(zIndex, element, \"zIndex\");\n    restore = function() {\n      if (prevX() != null) {\n        x(prevX());\n      }\n      if (prevY() != null) {\n        y(prevY());\n      }\n      width(prevWidth());\n      height(prevHeight());\n      minimized(false);\n      maximized(false);\n      return self.trigger(\"resize\");\n    };\n    Object.assign(self, {\n      element: element,\n      iconEmoji: iconEmoji,\n      iconURL: iconURL,\n      title: title,\n      x: x,\n      y: y,\n      width: width,\n      height: height,\n      zIndex: zIndex,\n      close: function() {\n        return element.remove();\n      },\n      maximized: maximized,\n      maximize: function() {\n        maximized.toggle();\n        if (maximized()) {\n          prevWidth(width());\n          prevHeight(height());\n          prevX(x());\n          prevY(y());\n          width(null);\n          height(null);\n          x(0);\n          y(0);\n          self.trigger(\"resize\");\n          return self.trigger(\"maximize\");\n        } else {\n          return restore();\n        }\n      },\n      minimized: minimized,\n      minimize: function() {\n        minimized.toggle();\n        if (minimized()) {\n          prevWidth(width());\n          prevHeight(height());\n          width(null);\n          height(null);\n          self.trigger(\"resize\");\n          return self.trigger(\"minimize\");\n        } else {\n          return restore();\n        }\n      },\n      restore: function() {\n        return restore();\n      },\n      raiseToTop: function() {\n        return raiseToTop(self);\n      }\n    });\n    element.view = self;\n    return self;\n  };\n\n  styleBind = function(observable, element, attr, suffix) {\n    var update;\n    if (suffix == null) {\n      suffix = \"\";\n    }\n    update = function(newValue) {\n      if ((newValue != null) && ((newValue = parseInt(newValue)) != null)) {\n        return element.style[attr] = \"\" + newValue + suffix;\n      } else {\n        return element.style[attr] = null;\n      }\n    };\n    observable.observe(update);\n    return update(observable());\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "lib/jadelet-runtime": {
          "path": "lib/jadelet-runtime",
          "content": "!function(n){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=n();else if(\"function\"==typeof define&&define.amd)define([],n);else{(\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this).JadeletRuntime=n()}}(function(){return function n(e,t,r){function o(i,c){if(!t[i]){if(!e[i]){var f=\"function\"==typeof require&&require;if(!c&&f)return f(i,!0);if(u)return u(i,!0);var l=new Error(\"Cannot find module '\"+i+\"'\");throw l.code=\"MODULE_NOT_FOUND\",l}var a=t[i]={exports:{}};e[i][0].call(a.exports,function(n){var t=e[i][1][n];return o(t||n)},a,a.exports,n,e,t,r)}return t[i].exports}for(var u=\"function\"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(n,e,t){(function(){\"use strict\";var t,r,o,u,i,c,f,l,a,s,d,p,v,h,g,y,b,m,E,O,_,x,w,A,C;t=n(\"o_0\"),a=new WeakMap,s=new WeakMap,_=function(n){var e;e=s.get(n)||0,s.set(n,e+1)},O=function(n){var e;e=s.get(n)||0,--e>0?s.set(n,e):(s.delete(n),l(n))},l=function(n){var e,t;null!=(e=n.children)&&Array.prototype.forEach.call(e,l),null!=(t=a.get(n))&&t.forEach(function(e){e(),a.delete(n)})},o=function(n,e){var t;(t=a.get(n))?t.push(e):a.set(n,[e])},p=/^on(touch|animation|transition)(start|iteration|move|end|cancel)$/,h=function(n,e){return n.match(p)||n in e},A=function(n,e,t){switch(n.nodeName){case\"SELECT\":n.oninput=n.onchange=function(){var n,t,r;n=(t=this.children[this.selectedIndex]).value,r=t._value,\"function\"==typeof e&&e(r||n)},i(n,e,t,function(e){var t;n._value=e,(t=n._options)?null!=e.value?n.value=(\"function\"==typeof e.value?e.value():void 0)||e.value:n.selectedIndex=C(t,e):n.value=e});break;default:n.oninput=n.onchange=function(){\"function\"==typeof e&&e(n.value)},i(n,e,t,function(e){n.value!==e&&(n.value=e)})}},x={INPUT:{checked:function(n,e,t){return n.onchange=function(){\"function\"==typeof e&&e(n.checked)},i(n,e,t,function(e){n.checked=e})}},SELECT:{options:function(n,e,t){i(n,e,t,function(e){d(n),n._options=e,e.map(function(e,t){var r,o,u;return r=f(\"option\"),r._value=e,u=g(e)?(null!=e?e.value:void 0)||t:e.toString(),i(r,u,e,function(n){r.value=n}),o=(null!=e?e.name:void 0)||e,i(r,o,e,function(n){r.textContent=n}),n.appendChild(r),e===n._value&&(n.selectedIndex=t),r})})}}},b=function(n,e,t,r){var o,c,f;c=n.nodeName,\"value\"===t?A(n,r):(o=null!=(f=x[c])?f[t]:void 0)?o(n,r,e):t.match(/^on/)&&h(t,n)?u(n,t.substr(2),r,e):h(\"on\"+t,n)?u(n,t,r,e):i(n,r,e,function(e){null!=e&&!1!==e?n.setAttribute(t,e):n.removeAttribute(t)})},m=function(n,e,t){c(n,e,t,\"id\",function(e){var t;t=e[e.length-1],e.length?n.id=t:n.removeAttribute(\"id\")}),c(n,e,t,\"class\",function(e){n.className=e.join(\" \")}),c(n,e,t,\"style\",function(e){n.removeAttribute(\"style\"),e.forEach(function(e){return g(e)?Object.assign(n.style,e):n.setAttribute(\"style\",e)})}),Object.keys(t).forEach(function(r){b(n,e,r,t[r])})},i=function(n,e,r,u){var i;i=t(function(){u(v(e,r))}),o(n,i.releaseDependencies)},u=function(n,e,t,r){\"function\"==typeof t&&n.addEventListener(e,t.bind(r))},c=function(n,e,t,r,o){var u;null!=(u=t[r])&&(delete t[r],i(n,function(){return w(u,e)},e,o))},E=function(n,e,t){var r;r=function(e){null==e||(\"function\"==typeof e.forEach?e.forEach(r):e instanceof Node?(_(e),n.appendChild(e)):n.appendChild(document.createTextNode(e)))},i(n,function(){var n;return n=[],t.call(e,{buffer:function(t){n.push(v(t,e))},element:y}),n},e,function(e){d(n),e.forEach(r)})},y=function(n,e,t,r){var o;return o=f(n),m(o,e,t),\"SELECT\"!==o.nodeName&&E(o,e,r),o},(r=function(n){var e;return e={buffer:function(n){if(e.root)throw new Error(\"Cannot have multiple root elements\");e.root=n},element:y}}).Observable=t,r._elementCleaners=a,r._dispose=l,r.retain=_,r.release=O,e.exports=r,f=function(n){return document.createElement(n)},d=function(n){for(var e;e=n.firstChild;)n.removeChild(e),O(e)},g=function(n){return\"object\"==typeof n},C=function(n,e){return g(e)?n.indexOf(e):n.map(function(n){return n.toString()}).indexOf(e.toString())},w=function(n,e){return n.map(function(n){return v(n,e)}).reduce(function(n,e){return n.concat(v(e))},[]).filter(function(n){return null!=n})},v=function(n,e){return\"function\"==typeof n?n.call(e):n}}).call(this)},{o_0:2}],2:[function(n,e,t){(function(n){(function(){\"use strict\";var t,r,o,u,i,c,f,l,a=[].slice;e.exports=function(n,e){var u,s,d,p,v;return\"function\"==typeof(null!=n?n.observe:void 0)?n:(d=[],p=function(n){return r(d).forEach(function(e){return e(n)})},\"function\"==typeof n?(s=n,(v=function(){return i(v),n}).releaseDependencies=function(){var n;return null!=(n=v._observableDependencies)?n.forEach(function(n){return n.stopObserving(u)}):void 0},(u=function(){var t;return t=new Set,n=l(t,s,e),v.releaseDependencies(),v._observableDependencies=t,t.forEach(function(n){return n.observe(u)}),p(n)})()):(v=function(e){return arguments.length>0?n!==e&&(n=e,p(e)):i(v),n}).releaseDependencies=c,Array.isArray(n)&&([\"concat\",\"every\",\"filter\",\"forEach\",\"indexOf\",\"join\",\"lastIndexOf\",\"map\",\"reduce\",\"reduceRight\",\"slice\",\"some\"].forEach(function(e){return v[e]=function(){var t;return t=1<=arguments.length?a.call(arguments,0):[],i(v),n[e].apply(n,t)}}),[\"pop\",\"push\",\"reverse\",\"shift\",\"splice\",\"sort\",\"unshift\"].forEach(function(e){return v[e]=function(){var t,r;return t=1<=arguments.length?a.call(arguments,0):[],r=n[e].apply(n,t),p(n),r}}),t&&Object.defineProperty(v,\"length\",{get:function(){return i(v),n.length},set:function(e){var t;return t=n.length=e,p(n),t}}),o(v,{remove:function(e){var t,r;if((t=n.indexOf(e))>=0)return r=n.splice(t,1)[0],p(n),r},get:function(e){return i(v),n[e]},first:function(){return i(v),n[0]},last:function(){return i(v),n[n.length-1]},size:function(){return i(v),n.length}})),o(v,{listeners:d,observe:function(n){return d.push(n)},stopObserving:function(n){return f(d,n)},toggle:function(){return v(!n)},increment:function(e){return null==e&&(e=1),v(n+e)},decrement:function(e){return null==e&&(e=1),v(n-e)},toString:function(){return\"Observable(\"+n+\")\"}}),v)},o=Object.assign,n.OBSERVABLE_ROOT_HACK=[],i=function(e){var t;if(t=u(n.OBSERVABLE_ROOT_HACK))return t.add(e)},l=function(e,t,r){n.OBSERVABLE_ROOT_HACK.push(e);try{return t.call(r)}finally{n.OBSERVABLE_ROOT_HACK.pop()}},f=function(n,e){var t;if((t=n.indexOf(e))>=0)return n.splice(t,1)[0]},r=function(n){return n.concat([])},u=function(n){return n[n.length-1]},c=function(){};try{Object.defineProperty(function(){},\"length\",{get:c,set:c}),t=!0}catch(n){t=!1}}).call(this)}).call(this,\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:\"undefined\"!=typeof window?window:{})},{}]},{},[1])(1)});\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "config": {
        "version": "0.1.9",
        "entryPoint": "main",
        "remoteDependencies": [],
        "dependencies": {
          "observable": "distri/observable:master",
          "bindable": "distri/bindable:master"
        }
      },
      "version": "0.1.9",
      "entryPoint": "main",
      "remoteDependencies": [],
      "repository": {
        "branch": "master",
        "default_branch": "master",
        "full_name": "STRd6/ui",
        "homepage": null,
        "description": "Classic User Interface",
        "html_url": "https://github.com/STRd6/ui",
        "url": "https://api.github.com/repos/STRd6/ui",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
        "observable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "content": "[![Build Status](https://travis-ci.org/distri/observable.svg?branch=npm)](https://travis-ci.org/distri/observable)\n\nObservable\n==========\n\nInstallation\n------------\n\nNode\n\n    npm install o_0\n\nUsage\n-----\n\n    Observable = require \"o_0\"\n\nGet notified when the value changes.\n\n    observable = Observable 5\n\n    observable() # 5\n\n    observable.observe (newValue) ->\n      console.log newValue\n\n    observable 10 # logs 10 to console\n\nArrays\n------\n\nProxy array methods.\n\n    observable = Observable [1, 2, 3]\n\n    observable.forEach (value) ->\n      # 1, 2, 3\n\nFunctions\n---------\n\nAutomagically compute dependencies for observable functions.\n\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n    lastName \"Bro\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    module.exports = Observable = (value, context) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        copy(listeners).forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n\nOur return function is a function that holds only a cached value which is updated\nwhen it's dependencies change.\n\nThe `magicDependency` call is so other functions can depend on this computed function the\nsame way we depend on other types of observables.\n\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        changed = ->\n          value = computeDependencies(self, fn, changed, context)\n          notify(value)\n\n        changed()\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (callback) ->\n        magicDependency(self)\n\n        if value?\n          [value].forEach (item) ->\n            callback.call(item, item)\n\n        return self\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            magicDependency(self)\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        # Provide length on a best effort basis because older browsers choke\n        if PROXY_LENGTH\n          Object.defineProperty self, 'length',\n            get: ->\n              magicDependency(self)\n              value.length\n            set: (length) ->\n              value.length = length\n              notifyReturning(value.length)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (callback) ->\n            self.forEach (item, index) ->\n              callback.call(item, item, index, self)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            magicDependency(self)\n            value[index]\n\n          first: ->\n            magicDependency(self)\n            value[0]\n\n          last: ->\n            magicDependency(self)\n            value[value.length-1]\n\n          size: ->\n            magicDependency(self)\n            value.length\n\n      extend self,\n        listeners: listeners\n\n        observe: (listener) ->\n          listeners.push listener\n\n        stopObserving: (fn) ->\n          remove listeners, fn\n\n        toggle: ->\n          self !value\n\n        increment: (n) ->\n          self value + n\n\n        decrement: (n) ->\n          self value - n\n\n        toString: ->\n          \"Observable(#{value})\"\n\n      return self\n\n    Observable.concat = ->\n      # Optimization: Manually copy arguments to an array\n      args = new Array(arguments.length)\n      for arg, i in arguments\n        args[i] = arguments[i]\n\n      collection = Observable(args)\n\n      o = Observable ->\n        flatten collection.map(splat)\n\n      o.push = collection.push\n\n      return o\n\nAppendix\n--------\n\nThe extend method adds one object's properties to another.\n\n    extend = (target) ->\n      # Optimization: iterate through arguments manually rather than pass to slice to create an array\n      for source, i in arguments\n        # The first argument is target, so skip it\n        if i > 0\n          for name of source\n            target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = []\n\n    magicDependency = (self) ->\n      observerSet = last(global.OBSERVABLE_ROOT_HACK)\n      if observerSet\n        observerSet.add self\n\nOptimization: Keep the function containing the try-catch as small as possible.\n\n    tryCallWithFinallyPop = (fn, context) ->\n      try\n        fn.call(context)\n      finally\n        global.OBSERVABLE_ROOT_HACK.pop()\n\nAutomagically compute dependencies.\n\n    computeDependencies = (self, fn, update, context) ->\n      deps = new Set\n\n      global.OBSERVABLE_ROOT_HACK.push(deps)\n\n      value = tryCallWithFinallyPop fn, context\n\n      self._deps?.forEach (observable) ->\n        observable.stopObserving update\n\n      self._deps = deps\n\n      deps.forEach (observable) ->\n        observable.observe update\n\n      return value\n\nCheck if we can proxy function length property.\n\n    try\n      Object.defineProperty (->), 'length',\n        get: ->\n        set: ->\n\n      PROXY_LENGTH = true\n    catch\n      PROXY_LENGTH = false\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n\n    copy = (array) ->\n      array.concat([])\n\n    get = (arg) ->\n      if typeof arg is \"function\"\n        arg()\n      else\n        arg\n\n    splat = (item) ->\n      results = []\n\n      return results unless item?\n\n      if typeof item.forEach is \"function\"\n        item.forEach (i) ->\n          results.push i\n      else\n        result = get item\n\n        results.push result if result?\n\n      results\n\n    last = (array) ->\n      array[array.length - 1]\n\n    flatten = (array) ->\n      array.reduce (a, b) ->\n        a.concat(b)\n      , []\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "version: \"0.3.8\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/observable.coffee": {
              "path": "test/observable.coffee",
              "content": "global.Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it \"should not fire when setting to the same value\", ->\n    o = Observable 5\n\n    o.observe ->\n      assert false\n\n    o(5)\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n    it \"should have the correct `this` scope for items\", (done) ->\n      o = Observable 5\n\n      o.each ->\n        assert.equal this, 5\n        done()\n\n    it \"should have the correct `this` scope for items in observable arrays\", ->\n      scopes = []\n\n      o = Observable [\"I'm\", \"an\", \"array\"]\n\n      o.each ->\n        scopes.push this\n\n      assert.equal scopes[0], \"I'm\"\n      assert.equal scopes[1], \"an\"\n      assert.equal scopes[2], \"array\"\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\n  it \"should increment\", ->\n    observable = Observable 1\n\n    observable.increment(5)\n\n    assert.equal observable(), 6\n\n  it \"should decremnet\", ->\n    observable = Observable 1\n\n    observable.decrement 5\n\n    assert.equal observable(), -4\n\n  it \"should toggle\", ->\n    observable = Observable false\n\n    observable.toggle()\n    assert.equal observable(), true\n\n    observable.toggle()\n    assert.equal observable(), false\n\n  it \"should trigger when toggling\", (done) ->\n    observable = Observable true\n    observable.observe (v) ->\n      assert.equal v, false\n      done()\n\n    observable.toggle()\n\n  it \"should have a nice toString\", ->\n    observable = Observable 5\n\n    assert.equal observable.toString(), \"Observable(5)\"\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  it \"#remove non-existent element\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.remove(0), undefined\n\n  it \"should proxy the length property\", ->\n    o = Observable [1, 2, 3]\n\n    assert.equal o.length, 3\n\n    called = false\n    o.observe (value) ->\n      assert.equal value[0], 1\n      assert.equal value[1], undefined\n      called = true\n\n    o.length = 1\n    assert.equal o.length, 1\n    assert.equal called, true\n\n  it \"should auto detect conditionals of length as a dependency\", ->\n    observableArray = Observable [1, 2, 3]\n\n    o = Observable ->\n      if observableArray.length > 5\n        true\n      else\n        false\n\n    assert.equal o(), false\n\n    called = 0\n    o.observe ->\n      called += 1\n\n    observableArray.push 4, 5, 6\n\n    assert.equal called, 1\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should compute array#get as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.get(0)\n\n    assert.equal observableFn(), 0\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#first as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.first() + 1\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 6\n\n  it \"should compute array#last as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.last()\n\n    assert.equal observableFn(), 2\n\n    observableArray.pop()\n\n    assert.equal observableFn(), 1\n\n    observableArray([5])\n\n    assert.equal observableFn(), 5\n\n  it \"should compute array#size as a dependency\", ->\n    observableArray = Observable [0, 1, 2]\n\n    observableFn = Observable ->\n      observableArray.size() * 2\n\n    assert.equal observableFn(), 6\n\n    observableArray.pop()\n    assert.equal observableFn(), 4\n    observableArray.shift()\n    assert.equal observableFn(), 2\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should work with dynamic dependencies\", ->\n    observableArray = Observable []\n\n    dynamicObservable = Observable ->\n      observableArray.filter (item) ->\n        item.age() > 3\n\n    assert.equal dynamicObservable().length, 0\n\n    observableArray.push\n      age: Observable 1\n\n    observableArray()[0].age 5\n    assert.equal dynamicObservable().length, 1\n\n  it \"should work with context\", ->\n    model =\n      a: Observable \"Hello\"\n      b: Observable \"there\"\n\n    model.c = Observable ->\n      \"#{@a()} #{@b()}\"\n    , model\n\n    assert.equal model.c(), \"Hello there\"\n\n    model.b \"world\"\n\n    assert.equal model.c(), \"Hello world\"\n\n  it \"should be ok even if the function throws an exception\", ->\n    assert.throws ->\n      t = Observable ->\n        throw \"wat\"\n\n    # TODO: Should be able to find a test case that is affected by this rather that\n    # checking it directly\n    assert.equal global.OBSERVABLE_ROOT_HACK.length, 0\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each()\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n\n  it \"should work with multiple dependencies\", ->\n    letter = Observable \"A\"\n    checked = ->\n      l = letter()\n      @name().indexOf(l) is 0\n\n    first = {name: Observable(\"Andrew\")}\n    first.checked = Observable checked, first\n\n    second = {name: Observable(\"Benjamin\")}\n    second.checked = Observable checked, second\n\n    assert.equal first.checked(), true\n    assert.equal second.checked(), false\n\n    assert.equal letter.listeners.length, 2\n\n    letter \"B\"\n\n    assert.equal first.checked(), false\n    assert.equal second.checked(), true\n\n  it \"shouldn't double count dependencies\", ->\n    dep = Observable \"yo\"\n\n    o = Observable ->\n      dep()\n      dep()\n      dep()\n\n    count = 0\n    o.observe ->\n      count += 1\n\n    dep('heyy')\n\n    assert.equal count, 1\n\n  it \"should work with nested observable construction\", ->\n    gen = Observable ->\n      Observable \"Duder\"\n\n    o = gen()\n\n    assert.equal o(), \"Duder\"\n\n    o(\"wat\")\n\n    assert.equal o(), \"wat\"\n\n  describe \"Scoping\", ->\n    it \"should be scoped to optional context\", (done) ->\n      model =\n        firstName: Observable \"Duder\"\n        lastName: Observable \"Man\"\n\n      model.name = Observable ->\n        \"#{@firstName()} #{@lastName()}\"\n      , model\n\n      model.name.observe (newValue) ->\n        assert.equal newValue, \"Duder Bro\"\n\n        done()\n\n      model.lastName \"Bro\"\n\n  describe \"concat\", ->\n    it \"should work with a single observable\", ->\n      observable = Observable \"something\"\n      observableArray = Observable.concat observable\n      assert.equal observableArray.last(), \"something\"\n\n      observable \"something else\"\n      assert.equal observableArray.last(), \"something else\"\n\n    it \"should work with an undefined observable\", ->\n      observable = Observable undefined\n      observableArray = Observable.concat observable\n      assert.equal observableArray.size(), 0\n\n      observable \"defined\"\n      assert.equal observableArray.size(), 1\n\n    it \"should work with undefined\", ->\n      observableArray = Observable.concat undefined\n      assert.equal observableArray.size(), 0\n\n    it \"should work with []\", ->\n      observableArray = Observable.concat []\n      assert.equal observableArray.size(), 0\n\n    it \"should return an observable array that changes based on changes in inputs\", ->\n      numbers = Observable [1, 2, 3]\n      letters = Observable [\"a\", \"b\", \"c\"]\n      item = Observable({})\n      nullable = Observable null\n\n      observableArray = Observable.concat numbers, \"literal\", letters, item, nullable\n\n      assert.equal observableArray().length, 3 + 1 + 3 + 1\n\n      assert.equal observableArray()[0], 1\n      assert.equal observableArray()[3], \"literal\"\n      assert.equal observableArray()[4], \"a\"\n      assert.equal observableArray()[7], item()\n\n      numbers.push 4\n\n      assert.equal observableArray().length, 9\n\n      nullable \"cool\"\n\n      assert.equal observableArray().length, 10\n\n    it \"should work with observable functions that return arrays\", ->\n      item = Observable(\"wat\")\n\n      computedArray = Observable ->\n        [item()]\n\n      observableArray = Observable.concat computedArray, computedArray\n\n      assert.equal observableArray().length, 2\n\n      assert.equal observableArray()[1], \"wat\"\n\n      item \"yolo\"\n\n      assert.equal observableArray()[1], \"yolo\"\n\n    it \"should have a push method\", ->\n      observableArray = Observable.concat()\n\n      observable = Observable \"hey\"\n\n      observableArray.push observable\n\n      assert.equal observableArray()[0], \"hey\"\n\n      observable \"wat\"\n\n      assert.equal observableArray()[0], \"wat\"\n\n      observableArray.push \"cool\"\n      observableArray.push \"radical\"\n\n      assert.equal observableArray().length, 3\n\n    it \"should be observable\", (done) ->\n      observableArray = Observable.concat()\n\n      observableArray.observe (items) ->\n        assert.equal items.length, 3\n        done()\n\n      observableArray.push [\"A\", \"B\", \"C\"]\n\n    it \"should have an each method\", ->\n      observableArray = Observable.concat([\"A\", \"B\", \"C\"])\n\n      n = 0\n      observableArray.each () ->\n        n += 1\n\n      assert.equal n, 3\n\n  describe \"nesting dependencies\", ->\n    it \"should update the correct observable\", ->\n      a = Observable \"a\"\n      b = Observable \"b\"\n\n      results = Observable ->\n        r = Observable.concat()\n\n        r.push a\n        r.push b\n\n        r\n\n      # TODO: Should this just be\n      #     results.first()\n      assert.equal results().first(), \"a\"\n\n      a(\"newA\")\n\n      assert.equal results().first(), \"newA\"\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var Observable, PROXY_LENGTH, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat, tryCallWithFinallyPop,\n    __slice = [].slice;\n\n  module.exports = Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      changed();\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function(callback) {\n      magicDependency(self);\n      if (value != null) {\n        [value].forEach(function(item) {\n          return callback.call(item, item);\n        });\n      }\n      return self;\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      if (PROXY_LENGTH) {\n        Object.defineProperty(self, 'length', {\n          get: function() {\n            magicDependency(self);\n            return value.length;\n          },\n          set: function(length) {\n            value.length = length;\n            return notifyReturning(value.length);\n          }\n        });\n      }\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function(callback) {\n          self.forEach(function(item, index) {\n            return callback.call(item, item, index, self);\n          });\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          magicDependency(self);\n          return value[index];\n        },\n        first: function() {\n          magicDependency(self);\n          return value[0];\n        },\n        last: function() {\n          magicDependency(self);\n          return value[value.length - 1];\n        },\n        size: function() {\n          magicDependency(self);\n          return value.length;\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var arg, args, collection, i, o, _i, _len;\n    args = new Array(arguments.length);\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      arg = arguments[i];\n      args[i] = arguments[i];\n    }\n    collection = Observable(args);\n    o = Observable(function() {\n      return flatten(collection.map(splat));\n    });\n    o.push = collection.push;\n    return o;\n  };\n\n  extend = function(target) {\n    var i, name, source, _i, _len;\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      source = arguments[i];\n      if (i > 0) {\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  magicDependency = function(self) {\n    var observerSet;\n    observerSet = last(global.OBSERVABLE_ROOT_HACK);\n    if (observerSet) {\n      return observerSet.add(self);\n    }\n  };\n\n  tryCallWithFinallyPop = function(fn, context) {\n    try {\n      return fn.call(context);\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    var deps, value, _ref;\n    deps = new Set;\n    global.OBSERVABLE_ROOT_HACK.push(deps);\n    value = tryCallWithFinallyPop(fn, context);\n    if ((_ref = self._deps) != null) {\n      _ref.forEach(function(observable) {\n        return observable.stopObserving(update);\n      });\n    }\n    self._deps = deps;\n    deps.forEach(function(observable) {\n      return observable.observe(update);\n    });\n    return value;\n  };\n\n  try {\n    Object.defineProperty((function() {}), 'length', {\n      get: function() {},\n      set: function() {}\n    });\n    PROXY_LENGTH = true;\n  } catch (_error) {\n    PROXY_LENGTH = false;\n  }\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (item == null) {\n      return results;\n    }\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.3.8\"};",
              "type": "blob"
            },
            "test/observable": {
              "path": "test/observable",
              "content": "(function() {\n  global.Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it(\"should not fire when setting to the same value\", function() {\n      var o;\n      o = Observable(5);\n      o.observe(function() {\n        return assert(false);\n      });\n      return o(5);\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n      it(\"should have the correct `this` scope for items\", function(done) {\n        var o;\n        o = Observable(5);\n        return o.each(function() {\n          assert.equal(this, 5);\n          return done();\n        });\n      });\n      return it(\"should have the correct `this` scope for items in observable arrays\", function() {\n        var o, scopes;\n        scopes = [];\n        o = Observable([\"I'm\", \"an\", \"array\"]);\n        o.each(function() {\n          return scopes.push(this);\n        });\n        assert.equal(scopes[0], \"I'm\");\n        assert.equal(scopes[1], \"an\");\n        return assert.equal(scopes[2], \"array\");\n      });\n    });\n    it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n    it(\"should increment\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.increment(5);\n      return assert.equal(observable(), 6);\n    });\n    it(\"should decremnet\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.decrement(5);\n      return assert.equal(observable(), -4);\n    });\n    it(\"should toggle\", function() {\n      var observable;\n      observable = Observable(false);\n      observable.toggle();\n      assert.equal(observable(), true);\n      observable.toggle();\n      return assert.equal(observable(), false);\n    });\n    it(\"should trigger when toggling\", function(done) {\n      var observable;\n      observable = Observable(true);\n      observable.observe(function(v) {\n        assert.equal(v, false);\n        return done();\n      });\n      return observable.toggle();\n    });\n    return it(\"should have a nice toString\", function() {\n      var observable;\n      observable = Observable(5);\n      return assert.equal(observable.toString(), \"Observable(5)\");\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    it(\"#remove non-existent element\", function() {\n      var o;\n      o = Observable([1, 2, 3]);\n      return assert.equal(o.remove(0), void 0);\n    });\n    it(\"should proxy the length property\", function() {\n      var called, o;\n      o = Observable([1, 2, 3]);\n      assert.equal(o.length, 3);\n      called = false;\n      o.observe(function(value) {\n        assert.equal(value[0], 1);\n        assert.equal(value[1], void 0);\n        return called = true;\n      });\n      o.length = 1;\n      assert.equal(o.length, 1);\n      return assert.equal(called, true);\n    });\n    return it(\"should auto detect conditionals of length as a dependency\", function() {\n      var called, o, observableArray;\n      observableArray = Observable([1, 2, 3]);\n      o = Observable(function() {\n        if (observableArray.length > 5) {\n          return true;\n        } else {\n          return false;\n        }\n      });\n      assert.equal(o(), false);\n      called = 0;\n      o.observe(function() {\n        return called += 1;\n      });\n      observableArray.push(4, 5, 6);\n      return assert.equal(called, 1);\n    });\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should compute array#get as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.get(0);\n      });\n      assert.equal(observableFn(), 0);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#first as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.first() + 1;\n      });\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 6);\n    });\n    it(\"should compute array#last as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.last();\n      });\n      assert.equal(observableFn(), 2);\n      observableArray.pop();\n      assert.equal(observableFn(), 1);\n      observableArray([5]);\n      return assert.equal(observableFn(), 5);\n    });\n    it(\"should compute array#size as a dependency\", function() {\n      var observableArray, observableFn;\n      observableArray = Observable([0, 1, 2]);\n      observableFn = Observable(function() {\n        return observableArray.size() * 2;\n      });\n      assert.equal(observableFn(), 6);\n      observableArray.pop();\n      assert.equal(observableFn(), 4);\n      observableArray.shift();\n      return assert.equal(observableFn(), 2);\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should work with dynamic dependencies\", function() {\n      var dynamicObservable, observableArray;\n      observableArray = Observable([]);\n      dynamicObservable = Observable(function() {\n        return observableArray.filter(function(item) {\n          return item.age() > 3;\n        });\n      });\n      assert.equal(dynamicObservable().length, 0);\n      observableArray.push({\n        age: Observable(1)\n      });\n      observableArray()[0].age(5);\n      return assert.equal(dynamicObservable().length, 1);\n    });\n    it(\"should work with context\", function() {\n      var model;\n      model = {\n        a: Observable(\"Hello\"),\n        b: Observable(\"there\")\n      };\n      model.c = Observable(function() {\n        return \"\" + (this.a()) + \" \" + (this.b());\n      }, model);\n      assert.equal(model.c(), \"Hello there\");\n      model.b(\"world\");\n      return assert.equal(model.c(), \"Hello world\");\n    });\n    it(\"should be ok even if the function throws an exception\", function() {\n      assert.throws(function() {\n        var t;\n        return t = Observable(function() {\n          throw \"wat\";\n        });\n      });\n      return assert.equal(global.OBSERVABLE_ROOT_HACK.length, 0);\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each());\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n    it(\"should work with multiple dependencies\", function() {\n      var checked, first, letter, second;\n      letter = Observable(\"A\");\n      checked = function() {\n        var l;\n        l = letter();\n        return this.name().indexOf(l) === 0;\n      };\n      first = {\n        name: Observable(\"Andrew\")\n      };\n      first.checked = Observable(checked, first);\n      second = {\n        name: Observable(\"Benjamin\")\n      };\n      second.checked = Observable(checked, second);\n      assert.equal(first.checked(), true);\n      assert.equal(second.checked(), false);\n      assert.equal(letter.listeners.length, 2);\n      letter(\"B\");\n      assert.equal(first.checked(), false);\n      return assert.equal(second.checked(), true);\n    });\n    it(\"shouldn't double count dependencies\", function() {\n      var count, dep, o;\n      dep = Observable(\"yo\");\n      o = Observable(function() {\n        dep();\n        dep();\n        return dep();\n      });\n      count = 0;\n      o.observe(function() {\n        return count += 1;\n      });\n      dep('heyy');\n      return assert.equal(count, 1);\n    });\n    it(\"should work with nested observable construction\", function() {\n      var gen, o;\n      gen = Observable(function() {\n        return Observable(\"Duder\");\n      });\n      o = gen();\n      assert.equal(o(), \"Duder\");\n      o(\"wat\");\n      return assert.equal(o(), \"wat\");\n    });\n    describe(\"Scoping\", function() {\n      return it(\"should be scoped to optional context\", function(done) {\n        var model;\n        model = {\n          firstName: Observable(\"Duder\"),\n          lastName: Observable(\"Man\")\n        };\n        model.name = Observable(function() {\n          return \"\" + (this.firstName()) + \" \" + (this.lastName());\n        }, model);\n        model.name.observe(function(newValue) {\n          assert.equal(newValue, \"Duder Bro\");\n          return done();\n        });\n        return model.lastName(\"Bro\");\n      });\n    });\n    describe(\"concat\", function() {\n      it(\"should work with a single observable\", function() {\n        var observable, observableArray;\n        observable = Observable(\"something\");\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.last(), \"something\");\n        observable(\"something else\");\n        return assert.equal(observableArray.last(), \"something else\");\n      });\n      it(\"should work with an undefined observable\", function() {\n        var observable, observableArray;\n        observable = Observable(void 0);\n        observableArray = Observable.concat(observable);\n        assert.equal(observableArray.size(), 0);\n        observable(\"defined\");\n        return assert.equal(observableArray.size(), 1);\n      });\n      it(\"should work with undefined\", function() {\n        var observableArray;\n        observableArray = Observable.concat(void 0);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should work with []\", function() {\n        var observableArray;\n        observableArray = Observable.concat([]);\n        return assert.equal(observableArray.size(), 0);\n      });\n      it(\"should return an observable array that changes based on changes in inputs\", function() {\n        var item, letters, nullable, numbers, observableArray;\n        numbers = Observable([1, 2, 3]);\n        letters = Observable([\"a\", \"b\", \"c\"]);\n        item = Observable({});\n        nullable = Observable(null);\n        observableArray = Observable.concat(numbers, \"literal\", letters, item, nullable);\n        assert.equal(observableArray().length, 3 + 1 + 3 + 1);\n        assert.equal(observableArray()[0], 1);\n        assert.equal(observableArray()[3], \"literal\");\n        assert.equal(observableArray()[4], \"a\");\n        assert.equal(observableArray()[7], item());\n        numbers.push(4);\n        assert.equal(observableArray().length, 9);\n        nullable(\"cool\");\n        return assert.equal(observableArray().length, 10);\n      });\n      it(\"should work with observable functions that return arrays\", function() {\n        var computedArray, item, observableArray;\n        item = Observable(\"wat\");\n        computedArray = Observable(function() {\n          return [item()];\n        });\n        observableArray = Observable.concat(computedArray, computedArray);\n        assert.equal(observableArray().length, 2);\n        assert.equal(observableArray()[1], \"wat\");\n        item(\"yolo\");\n        return assert.equal(observableArray()[1], \"yolo\");\n      });\n      it(\"should have a push method\", function() {\n        var observable, observableArray;\n        observableArray = Observable.concat();\n        observable = Observable(\"hey\");\n        observableArray.push(observable);\n        assert.equal(observableArray()[0], \"hey\");\n        observable(\"wat\");\n        assert.equal(observableArray()[0], \"wat\");\n        observableArray.push(\"cool\");\n        observableArray.push(\"radical\");\n        return assert.equal(observableArray().length, 3);\n      });\n      it(\"should be observable\", function(done) {\n        var observableArray;\n        observableArray = Observable.concat();\n        observableArray.observe(function(items) {\n          assert.equal(items.length, 3);\n          return done();\n        });\n        return observableArray.push([\"A\", \"B\", \"C\"]);\n      });\n      return it(\"should have an each method\", function() {\n        var n, observableArray;\n        observableArray = Observable.concat([\"A\", \"B\", \"C\"]);\n        n = 0;\n        observableArray.each(function() {\n          return n += 1;\n        });\n        return assert.equal(n, 3);\n      });\n    });\n    return describe(\"nesting dependencies\", function() {\n      return it(\"should update the correct observable\", function() {\n        var a, b, results;\n        a = Observable(\"a\");\n        b = Observable(\"b\");\n        results = Observable(function() {\n          var r;\n          r = Observable.concat();\n          r.push(a);\n          r.push(b);\n          return r;\n        });\n        assert.equal(results().first(), \"a\");\n        a(\"newA\");\n        return assert.equal(results().first(), \"newA\");\n      });\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "https://danielx.net/editor/"
          },
          "config": {
            "version": "0.3.8"
          },
          "version": "0.3.8",
          "entryPoint": "main",
          "repository": {
            "branch": "master",
            "default_branch": "master",
            "full_name": "distri/observable",
            "homepage": "http://observable.us",
            "description": null,
            "html_url": "https://github.com/distri/observable",
            "url": "https://api.github.com/repos/distri/observable",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        },
        "bindable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "mode": "100644",
              "type": "blob"
            },
            "README.coffee.md": {
              "path": "README.coffee.md",
              "content": "Bindable\n========\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self={}) ->\n      eventCallbacks = {}\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n      self.on = (namespacedEvent, callback) ->\n        [event, namespace] = namespacedEvent.split(\".\")\n\n        # HACK: Here we annotate the callback function with namespace metadata\n        # This will probably lead to some strange edge cases, but should work fine\n        # for simple cases.\n        if namespace\n          callback.__PIXIE ||= {}\n          callback.__PIXIE[namespace] = true\n\n        eventCallbacks[event] ||= []\n        eventCallbacks[event].push(callback)\n\n        return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n      self.off = (namespacedEvent, callback) ->\n        [event, namespace] = namespacedEvent.split(\".\")\n\n        if event\n          eventCallbacks[event] ||= []\n\n          if namespace\n            # Select only the callbacks that do not have this namespace metadata\n            eventCallbacks[event] = eventCallbacks.filter (callback) ->\n              !callback.__PIXIE?[namespace]?\n\n          else\n            if callback\n              remove eventCallbacks[event], callback\n            else\n              eventCallbacks[event] = []\n        else if namespace\n          # No event given\n          # Select only the callbacks that do not have this namespace metadata\n          # for any events bound\n          for key, callbacks of eventCallbacks\n            eventCallbacks[key] = callbacks.filter (callback) ->\n              !callback.__PIXIE?[namespace]?\n\n        return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n      self.trigger = (event, parameters...) ->\n        callbacks = eventCallbacks[event]\n\n        if callbacks\n          callbacks.forEach (callback) ->\n            callback.apply(self, parameters)\n\n        return self\n\n      return self\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
              "mode": "100644",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "content": "entryPoint: \"README\"\nversion: \"0.2.0\"\n",
              "mode": "100644",
              "type": "blob"
            },
            "test/bindable.coffee": {
              "path": "test/bindable.coffee",
              "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#bind and #trigger\", ->\n    o = Bindable()\n\n    o.on(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.on(\"test\", -> ok true)\n    o.on(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.on \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#unbind\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.on \"test\", callback\n    # Unbind specific event\n    o.off \"test\", callback\n    o.trigger \"test\"\n\n    o.on \"test\", callback\n    # Unbind all events\n    o.off \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.on \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.off \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#unbind namespaced\", ->\n    o = Bindable()\n\n    o.on \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.off \".TestNamespace\", ->\n    o.trigger \"test\"\n",
              "mode": "100644",
              "type": "blob"
            }
          },
          "distribution": {
            "README": {
              "path": "README",
              "content": "(function() {\n  var remove,\n    __slice = [].slice;\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    eventCallbacks = {};\n    self.on = function(namespacedEvent, callback) {\n      var event, namespace, _ref;\n      _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n      if (namespace) {\n        callback.__PIXIE || (callback.__PIXIE = {});\n        callback.__PIXIE[namespace] = true;\n      }\n      eventCallbacks[event] || (eventCallbacks[event] = []);\n      eventCallbacks[event].push(callback);\n      return self;\n    };\n    self.off = function(namespacedEvent, callback) {\n      var callbacks, event, key, namespace, _ref;\n      _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n      if (event) {\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        if (namespace) {\n          eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n            var _ref1;\n            return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n          });\n        } else {\n          if (callback) {\n            remove(eventCallbacks[event], callback);\n          } else {\n            eventCallbacks[event] = [];\n          }\n        }\n      } else if (namespace) {\n        for (key in eventCallbacks) {\n          callbacks = eventCallbacks[key];\n          eventCallbacks[key] = callbacks.filter(function(callback) {\n            var _ref1;\n            return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n          });\n        }\n      }\n      return self;\n    };\n    self.trigger = function() {\n      var callbacks, event, parameters;\n      event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      callbacks = eventCallbacks[event];\n      if (callbacks) {\n        callbacks.forEach(function(callback) {\n          return callback.apply(self, parameters);\n        });\n      }\n      return self;\n    };\n    return self;\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.2.0\"};",
              "type": "blob"
            },
            "test/bindable": {
              "path": "test/bindable",
              "content": "(function() {\n  var Bindable, equal, ok, test;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#bind and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.on(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#unbind\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.on(\"test\", callback);\n      o.off(\"test\", callback);\n      o.trigger(\"test\");\n      o.on(\"test\", callback);\n      o.off(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.off(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    return test(\"#unbind namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.off(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "https://danielx.net/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "README",
          "repository": {
            "branch": "master",
            "default_branch": "master",
            "full_name": "distri/bindable",
            "homepage": null,
            "description": "Event binding",
            "html_url": "https://github.com/distri/bindable",
            "url": "https://api.github.com/repos/distri/bindable",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    }
  }
});