
/*  precision mediump float;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }

    */



        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            vec3 base = texture2D( uSampler, vTextureCoord).rgb;
            gl_FragColor = vec4( base, 1.0 );
            //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        }




/*

         precision highp float;

         varying vec3 e;
         varying vec3 n;

         uniform sampler2D uSampler;

          void main(void) {

                 vec3 ee=normalize(e);
                 vec3 nn=normalize(n);


                 vec3 r = reflect( ee, nn );
                 float m = 2.0 * sqrt( pow( r.x, 2.0 ) + pow( r.y, 2.0 ) + pow( r.z +1.0, 2.0) );
                 vec2 vN = r.xy / m + 0.5;

                 vec3 base = texture2D(uSampler , vN ).rgb;

                 gl_FragColor = vec4( base, 1.0 );
          }


*/

