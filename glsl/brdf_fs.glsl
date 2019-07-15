
/*
        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            vec3 base = texture2D( uSampler, vTextureCoord).rgb;
            gl_FragColor = vec4( base, 1.0 );
            //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        }

*/


        precision highp float;

        #define RGBE_FORMAT
        #define QUADRILINEAR_INTERPOLATION


         varying vec3 vLightDir;
         varying vec3 vViewDir;

         uniform sampler2D BRDFMap;


         uniform vec3 DiffuseColor;
         uniform float SpecularIntensity;
         uniform float Exposure;


         uniform float TexWidth;
         uniform float TexHeight;
         uniform float SegTheta; // Resolution of theta
         const float PI = 3.1415926535897932384626433832795028841971694;
         const float PI_DIV_2 = PI * 0.5;
         float SegPhi = SegTheta * 4.0; // Number of segments per longitude angle



         vec2 toSphericalCoords(vec3 v)
         {
             vec3 p = normalize(v);
             float f = atan(p.y, p.x) / PI ;
             float phi = (step(0.0, -f) * 2.0 + f) * (SegPhi - 1.0) * 0.5;
             float theta = max(acos(p.z) / (PI / 2.0) * (SegTheta - 1.0), 0.0);
             return vec2(phi, theta);
         }

         vec3 sampleBRDF(vec2 angle_i, vec2 angle_r)
         {
             vec2 coord = vec2(
                       (mod(angle_r.x - angle_i.x + SegPhi, SegPhi) + 0.5) / TexWidth,
                 1.0 - (angle_i.y * SegTheta + angle_r.y + 0.5) / (TexHeight));
         	#ifdef RGBE_FORMAT
             vec4 rgbe = texture2D(BRDFMap, coord);
         	float e = ((rgbe.a * 255.0) - 128.0);
             float ran = pow(2.0, e);
             return rgbe.rgb * ran;
         	#else
         	//return texture2D(BRDFMap, coord).xyz;
         	#endif
         }

         void main(void)
         {
             vec3 normal = vec3(0.0, 0.0, 1.0);

             // Convert light vector to spherical coordinates::
             vec2 angle_i = (toSphericalCoords(vLightDir));
             vec2 angle_r = (toSphericalCoords(vViewDir));

             // Get texture coordinates:
         	#ifdef QUADRILINEAR_INTERPOLATION
             vec2 angle_i_min = floor(angle_i);
             vec2 weights_i = angle_i - angle_i_min;

         	vec2 angle_r_min = floor(angle_r);
         	vec2 weights_r = angle_r - angle_r_min;
             vec3 s00 = sampleBRDF(angle_i_min + vec2(0.0, 0.0), angle_r_min + vec2(0.0, 0.0));
             vec3 s01 = sampleBRDF(angle_i_min + vec2(1.0, 0.0), angle_r_min + vec2(0.0, 0.0));
             vec3 s02 = sampleBRDF(angle_i_min + vec2(0.0, 1.0), angle_r_min + vec2(0.0, 0.0));
             vec3 s03 = sampleBRDF(angle_i_min + vec2(1.0, 1.0), angle_r_min + vec2(0.0, 0.0));
             vec3 s04 = sampleBRDF(angle_i_min + vec2(0.0, 0.0), angle_r_min + vec2(1.0, 0.0));
             vec3 s05 = sampleBRDF(angle_i_min + vec2(1.0, 0.0), angle_r_min + vec2(1.0, 0.0));
             vec3 s06 = sampleBRDF(angle_i_min + vec2(0.0, 1.0), angle_r_min + vec2(1.0, 0.0));
             vec3 s07 = sampleBRDF(angle_i_min + vec2(1.0, 1.0), angle_r_min + vec2(1.0, 0.0));
             vec3 s08 = sampleBRDF(angle_i_min + vec2(0.0, 0.0), angle_r_min + vec2(0.0, 1.0));
             vec3 s09 = sampleBRDF(angle_i_min + vec2(1.0, 0.0), angle_r_min + vec2(0.0, 1.0));
             vec3 s10 = sampleBRDF(angle_i_min + vec2(0.0, 1.0), angle_r_min + vec2(0.0, 1.0));
             vec3 s11 = sampleBRDF(angle_i_min + vec2(1.0, 1.0), angle_r_min + vec2(0.0, 1.0));
             vec3 s12 = sampleBRDF(angle_i_min + vec2(0.0, 0.0), angle_r_min + vec2(1.0, 1.0));
             vec3 s13 = sampleBRDF(angle_i_min + vec2(1.0, 0.0), angle_r_min + vec2(1.0, 1.0));
             vec3 s14 = sampleBRDF(angle_i_min + vec2(0.0, 1.0), angle_r_min + vec2(1.0, 1.0));
             vec3 s15 = sampleBRDF(angle_i_min + vec2(1.0, 1.0), angle_r_min + vec2(1.0, 1.0));

             vec3 refl0 = mix(mix(s00, s01, weights_i.x), mix(s02, s03, weights_i.x), weights_i.y);
         	vec3 refl1 = mix(mix(s04, s05, weights_i.x), mix(s06, s07, weights_i.x), weights_i.y);
         	vec3 refl2 = mix(mix(s08, s09, weights_i.x), mix(s10, s11, weights_i.x), weights_i.y);
         	vec3 refl3 = mix(mix(s12, s13, weights_i.x), mix(s14, s15, weights_i.x), weights_i.y);
         	vec3 refl = mix(mix(refl0, refl1, weights_r.x), mix(refl2, refl3, weights_r.x), weights_r.y);
         	#else
             // Nearest Neighbor sampling:
             vec3 refl = sampleBRDF(floor(angle_i + 0.5), floor(angle_r + 0.5));
         	#endif

             // Farbwert berechnen:
             gl_FragColor = vec4(Exposure * dot(normal, vLightDir) * (DiffuseColor + SpecularIntensity * refl), 1.0);
         }

