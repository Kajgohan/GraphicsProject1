function main()
{

    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    var filename;
    //retrieving the button element
    var label = document.getElementById("ModeLabel");
    var ratio = [];
    var points = [];
    var lastDraw = [];
    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);
    var bBool = false;
    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;

    }


    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );

    //defining the color vectors to switch between when hitting the 'c' key in file mode
    var colorCycleArray = [];
    colorCycleArray.push(vec4(0.0, 0.0, 0.0, 1.0));
    colorCycleArray.push(vec4(1.0, 0.0, 0.0, 1.0));
    colorCycleArray.push(vec4(0.0, 1.0, 0.0, 1.0));
    colorCycleArray.push(vec4(0.0, 0.0, 1.0, 1.0));

    var rotator = 0;

    function colorSwap(event){
        var e = event;
        var colorArray = [];
        if(e.key == "c"){
            rotator = (rotator + 1)%4;
            var colorVec = colorCycleArray[rotator];

            //setting the color
            var vColor = gl.getUniformLocation(program,  "vColor");
            gl.uniform4fv(vColor, colorVec);
            var fColor = gl.getUniformLocation(program,  "fColor");
            gl.uniform4fv(fColor, colorVec);

            // Clear <canvas> by clearing the color buffer
            gl.clear(gl.COLOR_BUFFER_BIT);

            //this draws all of the line bits that were drawn last
            for(var i=0;i<lastDraw.length;i++){
                gl.bufferData(gl.ARRAY_BUFFER, flatten(lastDraw[i]), gl.DYNAMIC_DRAW);
                gl.drawArrays(gl.LINE_STRIP, 0, lastDraw[i].length);

            }
            gl.drawArrays(gl.LINE_STRIP, 0, points.length);

            }
        if(e.key == "f"){
            label.innerHTML = "File Mode";
            file.style.visibility = "visible";
            canvas.onclick = null;
            document.onkeydown = null;
            document.onkeyup = null;
            gl.clear(gl.COLOR_BUFFER_BIT);

        }
        if(e.key == "d"){
            label.innerHTML = "Draw Mode";
            file.style.visibility = "hidden";
            gl.clear(gl.COLOR_BUFFER_BIT);
            canvas.onclick = paint;
            document.onkeydown = btrue;
            document.onkeyup = bfalse;

            var translation = vec2(0, 0);
            var translationLocation = gl.getUniformLocation(
                program, "translation");
            gl.uniform2fv(translationLocation, translation);

            //scales it to a one by one
            var resolution=1;
            var resolutionLocation = gl.getUniformLocation(program, "resolution");
            gl.uniform1f(resolutionLocation, resolution);

        }
    }

    function btrue(event){
        if(event.key == 'b'){
            bBool = true;
        }
    }

    function bfalse(event){
        if(event.key == 'b'){
            bBool = false;
        }
    }

    function paint(event){
        var clickedPoint = [event.offsetX/canvas.width, (canvas.height - event.offsetY)/canvas.height];
        console.log(clickedPoint);
        console.log(bBool);
        if(bBool){
            console.log("b is pressed and paint is running");

            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINE_STRIP, 0, points.length);
            points = [];
            points.push(clickedPoint);
        }
        else{
            console.log("b is not pressed and paint is running");
            points.push(clickedPoint);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINE_STRIP, 0, points.length);
            console.log(points);

        }




    }



//this is the first function to be called when a file is selected
    function checkers(event){
        lastDraw = [];
        //parsing out the information
        var rawData = event.target.result;
        let re2 = new RegExp('dino');
        if(re2.test(filename)){
            //do stuff here for dino
            var dinoLines = rawData.split('\n');
            var dinoTotalPLines = dinoLines.shift();


            //translation
            var dinotranslation = vec2(2, 0);
            var translationLocation = gl.getUniformLocation(
                program, "translation");
            gl.uniform2fv(translationLocation, dinotranslation);

            //scales it to a one by one
            var dinoresolution = 633;

            var resolutionLocation = gl.getUniformLocation(program, "resolution");
            gl.uniform1f(resolutionLocation, dinoresolution);


            for(var i = 0;i<dinoTotalPLines;i++){
                var dinonumOfNextVertex = parseInt(dinoLines.shift());
                var dinopLine = dinoLines.splice(0,dinonumOfNextVertex);
                writeToBuffer(dinonumOfNextVertex, dinopLine);
            }





            console.log("regex works for dino");
        }
        else {
        var lines = rawData.split('\n');
        let re = new RegExp('[0-9]');
        let re1 = new RegExp('\\*');


        for(var i = 0;i < lines.length;i++){
            if(lines[i] == ""){
                lines.splice(i, 1);
                i -=1;
            }
            else if(re1.test(lines[i])){
                lines.splice(i,1);
                i-=1;
            }
            else if (!(re.test(lines[i]))){
                lines.splice(i, 1);
                i-=1;
            }
        }
        //formatting the dimentions line
            ratio = lines.shift().split(' ');
            for (var i = 0; i < ratio.length; i++) {
                if (ratio[i] == '') {
                    ratio.splice(i, 1);
                    i-=1;
                }
                else{
                    ratio[i] = parseFloat(ratio[i]);
                }
            }
            //translation
            var translation = vec2(ratio[0], ratio[3]);
            var translationLocation = gl.getUniformLocation(
                program, "translation");
            gl.uniform2fv(translationLocation, translation);

            //scales it to a one by one
            var resolution;
            if( (ratio[2]-ratio[0]) >  (ratio[1] - ratio[3])){
                resolution = ratio[2]-ratio[0];
            }
            else {
                resolution = ratio[1] - ratio[3];
            }
            var resolutionLocation = gl.getUniformLocation(program, "resolution");
            gl.uniform1f(resolutionLocation, resolution);
            var totalPolyLines = parseInt(lines.shift());
            gl.clear(gl.COLOR_BUFFER_BIT);
            //write to the screen for every pline you want to draw
            for(var i = 0;i<totalPolyLines;i++){
                var numOfNextVertex = parseInt(lines.shift());
                var pLine = lines.splice(0,numOfNextVertex);
                writeToBuffer(numOfNextVertex, pLine);
            }


        }
    }

    function writeToBuffer(numVertexes, pLine){
        //console.log(pLine);
        for(var i = 0;i<pLine.length;i++){
            var entry = pLine[i].split(' ');
            //parse out the empty elements
            for(var e  = 0;e<entry.length;e++){
                entry[e].replace('\r', "");
                if(entry[e] == ""){
                    entry.splice(e, 1);
                    e-=1;
                }
            }
            //add coordinates as vec2 to the points array
            points.push(vec2(entry[0], entry[1]));

        }
        lastDraw.push(points);

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.LINE_STRIP, 0, points.length);
        points = [];

    }



    function keyPressSwitch(event){
        var theFile = file.files[0];
        filename = file.value;
        console.log(filename);
        var reader = new FileReader();
        reader.readAsText(theFile);
        reader.onload = checkers;
        //clear screen
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    //adding on clicks to all of the files in the drop down
    var file = document.getElementById("file");
    file.onchange = keyPressSwitch;



    document.onkeypress = colorSwap;
    var colorVec = vec4(1.0,0.0,1.0,1.0);


    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    //set default color to black
    var vColor = gl.getUniformLocation(program,  "vColor");
    gl.uniform4fv(vColor, colorVec);

    var fColor = gl.getUniformLocation(program,  "fColor");
    gl.uniform4fv(fColor, colorVec);

	// Set clear color
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
}
