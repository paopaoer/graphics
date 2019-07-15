/*

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

*/

        attribute vec3 aVertexPosition;

        attribute vec3  aVertexNormal;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        uniform vec3 uLightDir;



        varying vec3 vLightDir;
        varying vec3 vViewDir;






        void main(void) {

                vec4 position =vec4(aVertexPosition,1.0);
                vec3 normal=normalize((uMVMatrix*vec4(aVertexNormal,0.0)).xyz);
                vec3 tangent=normalize((uMVMatrix*vec4(cross(aVertexNormal, vec3(0, 1, 0)), 0.0)).xyz);
                mat3 tangentSpace=mat3(tangent, normalize(cross(normal, tangent)), normal); // Transforms from world to tangent space
                vLightDir=normalize(tangentSpace*uLightDir);
                vec3 viewDir=-(uMVMatrix*position).xyz;
                vViewDir=normalize(tangentSpace*viewDir);

                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

            }

