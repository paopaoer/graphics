
/*attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    varying vec2 vTextureCoord;


    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }
    */



        attribute vec3 aVertexPosition;

        attribute vec3  aVertexNormal;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        varying vec2 vTextureCoord;


        void main(void) {

                vec4 p=vec4(aVertexPosition,1.0);
                vec3 e=normalize(vec3(uMVMatrix*p));

                vec3 n=normalize(uNMatrix*aVertexNormal);
                vec3 r = reflect( e, n );
                  float m = 2.0 * sqrt(
                    pow( r.x, 2.0 ) +
                    pow( r.y, 2.0 ) +
                    pow( r.z + 1.0, 2.0 )
                  );

                vTextureCoord=r.xy / m + 0.5;

                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

            }

/*

        attribute vec3 aVertexPosition;

        attribute vec3  aVertexNormal;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        varying vec3 e;
        varying vec3 n;

        void main(void) {


              vec3 e=vec3(uMVMatrix*vec4(aVertexPosition,1.0));

              vec3 n=uNMatrix*aVertexNormal;

              gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

            }

*/