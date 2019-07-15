/**
 * Created by admin on 2017/6/1.
 */

var gl;
var shaderProgram;

var fsProgram;
var vsProgram;
var objData;


var vertexBuffer;
var normalBuffer;
var indexBuffer;

var texture;


var mvMatrix;
var mvMatrixStack = [];
var pMatrix ;

var lastTime = 0;
var yRot = 0;

var FPS=0;
var t=0;




window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            window.setTimeout(callback, 1000/60);
        };
})();



window.onload = window.onresize = function() {
    var e = document.getElementById("canvas");

    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var canvasWidth = viewportWidth;
    var canvasHeight = viewportHeight;
    e.style.position = "fixed";
    e.setAttribute("width", canvasWidth);
    e.setAttribute("height", canvasHeight);
    e.style.top = (viewportHeight - canvasHeight) / 2;
    e.style.left = (viewportWidth - canvasWidth) / 2;
    getData();
};

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {

    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}




function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        yRot += (90 * elapsed) / 1000.0;
        t++;
        if(elapsed!=0)
        FPS+=1000/elapsed;
        if(t==5) {
            FPS=Math.floor(FPS/5.0);
            document.getElementById("frameStats").innerHTML = FPS.toString() + '&nbsp&nbsp&nbsp&nbspFPS';
            t=0;FPS=0;
        }
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function initGL() {
    try {
        var canvas=document.getElementById("canvas");
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {

    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(source, type) {

    var shader;
    if (type == "x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}


function initShaders() {

    var  vertexSource=vsProgram;
    var  fragmentSource=fsProgram;
    var  fragmentShader = getShader(fragmentSource, "x-fragment");
    var  vertexShader = getShader(vertexSource, "x-vertex");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);

    shaderProgram.vertexAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexAttribute);

    // 法线
    shaderProgram.normalAttribute=gl.getAttribLocation(shaderProgram,"aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.normalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    // 法线矩阵
    shaderProgram.nMatrixUniform=gl.getUniformLocation(shaderProgram,"uNMatrix");

}



function initBuffers(){


    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objData.vertexPositions), gl.STATIC_DRAW);
    vertexBuffer.numItems = objData.vertexPositions.length;


    normalBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objData.vertexNormals), gl.STATIC_DRAW);

    indexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objData.indices), gl.STATIC_DRAW);
    indexBuffer.numItems=objData.indices.length;

}



function initTextures() {
    texture = gl.createTexture();
    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

    }
    image.src = "resources/matcap/matcap.jpg";
}


function drawScene() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mvMatrix = mat4.create();
    pMatrix = mat4.create();

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0.0, 0.0, -40.0]);
    mvPushMatrix();

    mat4.rotate(mvMatrix, yRot*Math.PI/180.0, [0, 1, 0]);


    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAttribute,3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.vertexAttribPointer(shaderProgram.normalAttribute,3,gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    setMatrixUniforms();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();

}


function webGLStart() {

    initGL();
    initShaders();
    initBuffers();
    initTextures();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();

}



function getOBJAndSrc(url) {

    var promise = new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("POST", url);
        request.onreadystatechange = function () {

            if (request.readyState !== 4) {
                return ;
            }
            if(request.status===200){
                resolve(request.responseText);
            }
            else{
                reject(new Error(request.statusText));
            }
        }
        request.send();
    });

    return promise;
};


function getData(){

    var vsPromise = getOBJAndSrc("glsl/matcap_vs.glsl");
    var fsPromise = getOBJAndSrc("glsl/matcap_fs.glsl");
    var objPromise = getOBJAndSrc("resources/obj/teapot.json");


    // 获取顶点着色器代码
    vsPromise .then(function (data) {
        vsProgram=data;
    },function error(error) {
        alert(error);
    });

    // 获取片元着色器代码
    fsPromise .then(function (data) {
        fsProgram=data;
    },function error(error) {
        alert(error);
    });

    // 获取 obj 对象
    objPromise.then(function (data) {
        objData=JSON.parse(data);

    },function error(error) {
        alert(error);
    });
    Promise.all([vsPromise,fsPromise,objPromise]).then(values => {
        console.log(values);
        webGLStart();
    });
}



$('#selectMatCap').on('change', function(data) {
    var fileName = $("#selectMatCap option:selected").attr('value');
    var image = new Image();
    image.onload = function() {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    image.src = 'resources/matcap/' + fileName + '.jpg';
});

matcaps = ['matcap', 'matcap1','matcap2', 'matcap3','matcap4','matcap5','matcap6','matcap7','matcap8'];
$.each(matcaps, function(key, value) {
    $('#selectMatCap').append('<option value="' + value + '">' + value + '</option>');
});
