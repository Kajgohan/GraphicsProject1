function main()
{
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    //retrieving the button element
    var fileButton = document.getElementById("fileButton");
    var label = document.getElementById("ModeLabel");

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

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

    function colorSwap(e){
        var colorArray = [];
        if(e.key == "c"){
            rotator = (rotator + 1)%4;
            for(i =0;i<points.length;i++){
                colorArray.push(colorCycleArray[rotator])
            }
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.DYNAMIC_DRAW);

            // Clear <canvas> by clearing the color buffer
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Draw a point
            gl.drawArrays(gl.TRIANGLES, 0, points.length);

            }
        if(e.key == "f"){
            label.innerHTML = "File Mode";
            fileButton.style.visibility = "visible";
        }
        if(e.key == "d"){
            label.innerHTML = "Draw Mode";
            fileButton.style.visibility = "hidden";
        }
        }

    /////////////////////
    //This is where we are going to open the files and parse em.
    /////////////////////
    fileButton.onclick = function(){keyPressSwitch()}

    document.onkeypress = function(event){colorSwap(event)}


    //Define the positions of our points
    var points = [];
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    //Define the colors of our points
    var colors = [];
    colors.push(vec4(1.0, 0.0, 0.0, 1.0));
    colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 1.0, 1.0));
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);
    
    var vColor = gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
	// Set clear color
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	// Clear <canvas> by clearing the color buffer
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Draw a point
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
