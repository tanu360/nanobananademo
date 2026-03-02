// Cloudflare Worker - OpenAI Compatible Image API

const PAGES_URL = "https://nanobananademo.pages.dev";
const API_KEY = "AIzaSyBoAjfnKgIPYoO71kSUmTLLTaWGAsOr8NI";
const BASE_URL = "https://us-central1-nano-banana-editor.cloudfunctions.net";
const IDENTITY_URL = "https://identitytoolkit.googleapis.com/v1";
// const HOMEPAGE_URL = "https://nano-banana-editor.vercel.app";

const IMAGEN_API_KEY = "AIzaSyAxof8_SbpDcww38NEQRhNh0Pzvbphh-IQ";
const FIREBASE_VERTEX_URL = "https://firebasevertexai.googleapis.com/v1beta/projects/gemmy-ai-bdc03/models";

const WORKER_BASE_URL = "https://nanobanana.aikit.club";

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

const IMAGEN_MODELS = [
   "imagen-4.0-generate-001",
   "imagen-4.0-fast-generate-001"
];

const UPSCALE_MODEL = "imagen-4.0-upscale-preview";

export default {
   async fetch(request, env, ctx) {
      const url = new URL(request.url);

      const corsHeaders = {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      if (request.method === 'OPTIONS') {
         return new Response(null, { headers: corsHeaders });
      }

      try {
         const path = url.pathname.replace(/^\/v1/, '');

         // Serve images from R2
         if (path.startsWith('/images/') && !path.includes('/generations') && !path.includes('/edits') && !path.includes('/upscale')) {
            return await handleServeImage(path, env, corsHeaders);
         }

         if (path === '/models') {
            return handleModels(corsHeaders);
         }

         if (path === '/images/generations') {
            return await handleGenerations(request, env, corsHeaders);
         }

         if (path === '/images/edits') {
            return await handleEdits(request, env, corsHeaders);
         }

         if (path === '/images/upscale') {
            return await handleUpscale(request, env, corsHeaders);
         }
         return await proxyPages(url.pathname, corsHeaders);
         // return redirectToHomepage(corsHeaders);
      } catch (error) {
         console.error('Worker error:', error);
         return openAIError('api_error', error.message || 'Internal server error', 500, corsHeaders);
      }
   }
};

// Serve image from R2
async function handleServeImage(path, env, corsHeaders) {
   const filename = path.replace('/images/', '');

   if (!filename) {
      return openAIError('invalid_request_error', 'Missing image filename', 400, corsHeaders);
   }

   try {
      const object = await env.IMAGES_BUCKET.get(filename);

      if (!object) {
         return openAIError('invalid_request_error', 'Image not found or expired', 404, corsHeaders);
      }

      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=3600');

      return new Response(object.body, { headers });
   } catch (error) {
      console.error('Serve image error:', error);
      return openAIError('api_error', 'Failed to retrieve image', 500, corsHeaders);
   }
}

// Generate filename: 130708_24112025_generate.png
function generateFilename(type, format) {
   const now = new Date();

   const hours = String(now.getUTCHours()).padStart(2, '0');
   const minutes = String(now.getUTCMinutes()).padStart(2, '0');
   const seconds = String(now.getUTCSeconds()).padStart(2, '0');
   const day = String(now.getUTCDate()).padStart(2, '0');
   const month = String(now.getUTCMonth() + 1).padStart(2, '0');
   const year = now.getUTCFullYear();
   const randomId = Math.random().toString(36).slice(-4);

   const timestamp = `${hours}${minutes}${seconds}-${day}${month}${year}_${randomId}`;
   const extension = format === 'jpeg' ? 'jpg' : 'png';

   return `${timestamp}_${type}.${extension}`;
}

// Save image to R2 and return URL
async function saveImageToR2(base64Data, format, type, env) {
   const filename = generateFilename(type, format);
   const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

   const binaryString = atob(base64Data);
   const bytes = new Uint8Array(binaryString.length);
   for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
   }

   await env.IMAGES_BUCKET.put(filename, bytes, {
      httpMetadata: {
         contentType: mimeType
      }
   });

   return `${WORKER_BASE_URL}/images/${filename}`;
}

// Parse boolean from various input types
function parseBoolean(value, defaultValue = true) {
   if (value === undefined || value === null || value === '') {
      return defaultValue;
   }
   if (typeof value === 'boolean') {
      return value;
   }
   if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off') {
         return false;
      }
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on') {
         return true;
      }
   }
   if (typeof value === 'number') {
      return value !== 0;
   }
   return defaultValue;
}

// Handle /v1/models
function handleModels(corsHeaders) {
   const models = [];

   // Add Nano Banana model
   models.push({
      "id": "nano-banana",
      "object": "model",
      "created": 1764671202,
      "owned_by": "nano-banana-editor"
   });

   // Add Imagen models
   IMAGEN_MODELS.forEach(modelId => {
      models.push({
         "id": modelId,
         "object": "model",
         "created": 1764671202,
         "owned_by": "google"
      });
   });

   // Add upscale model
   models.push({
      "id": UPSCALE_MODEL,
      "object": "model",
      "created": 1764671202,
      "owned_by": "google"
   });

   return jsonResponse({
      "object": "list",
      "data": models
   }, 200, corsHeaders);
}

// Handle /v1/images/generations (GET and POST)
async function handleGenerations(request, env, corsHeaders) {
   let requestBody;

   if (request.method === 'GET') {
      const url = new URL(request.url);
      requestBody = {
         prompt: url.searchParams.get('prompt'),
         model: url.searchParams.get('model') || 'nano-banana',
         n: parseInt(url.searchParams.get('n')) || 1,
         size: url.searchParams.get('size') || '1024x1024',
         quality: url.searchParams.get('quality') || 'auto',
         response_format: url.searchParams.get('response_format') || 'url'
      };
   } else if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
         const body = await request.json();
         requestBody = {
            prompt: body.prompt,
            model: body.model || 'nano-banana',
            n: body.n || 1,
            size: body.size || '1024x1024',
            quality: body.quality || 'auto',
            response_format: body.response_format || 'url'
         };
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
         const formData = await request.formData();
         requestBody = {
            prompt: formData.get('prompt'),
            model: formData.get('model') || 'nano-banana',
            n: parseInt(formData.get('n')) || 1,
            size: formData.get('size') || '1024x1024',
            quality: formData.get('quality') || 'auto',
            response_format: formData.get('response_format') || 'url'
         };
      } else {
         return openAIError('invalid_request_error', 'Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded', 400, corsHeaders);
      }
   } else {
      return openAIError('invalid_request_error', 'Method not allowed', 405, corsHeaders);
   }

   if (!requestBody.prompt || typeof requestBody.prompt !== 'string' || requestBody.prompt.trim().length === 0) {
      return openAIError('invalid_request_error', 'Missing or invalid required parameter: prompt', 400, corsHeaders);
   }

   // Validate response_format
   if (!['url', 'b64_json'].includes(requestBody.response_format)) {
      return openAIError('invalid_request_error', 'response_format must be "url" or "b64_json"', 400, corsHeaders);
   }

   // Check if it's an Imagen model
   if (IMAGEN_MODELS.includes(requestBody.model)) {
      return await generateWithImagen(requestBody, env, corsHeaders);
   }

   // Default: Nano Banana
   return await generateWithNanoBanana(requestBody, env, corsHeaders);
}

// Generate with Imagen models
async function generateWithImagen(requestBody, env, corsHeaders) {
   const {
      prompt,
      model,
      n,
      size,
      quality,
      response_format
   } = requestBody;

   if (n < 1 || n > 4) {
      return openAIError('invalid_request_error', 'Parameter n must be between 1 and 4', 400, corsHeaders);
   }

   const aspectRatio = parseSizeToAspectRatio(size);
   const imageSize = parseSizeToImageSize(size, quality);

   // Build parameters object
   const parameters = {
      sampleCount: n,
      aspectRatio: aspectRatio,
      imageSize: imageSize
   };

   try {
      const response = await fetch(
         `${FIREBASE_VERTEX_URL}/${model}:predict`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-firebase-appid': '1:652803432695:android:c4341db6033e62814f33f2',
               'x-goog-api-client': 'gl-kotlin/2.2.21-ai fire/17.7.0',
               'x-goog-api-key': IMAGEN_API_KEY
            },
            body: JSON.stringify({
               instances: [{ prompt: prompt.trim() }],
               parameters: parameters
            })
         }
      );

      if (!response.ok) {
         const errorText = await response.text();
         return openAIError('api_error', `Imagen API error: ${errorText}`, response.status, corsHeaders);
      }

      const result = await response.json();
      const predictions = result.predictions || [];

      if (predictions.length === 0) {
         return openAIError('api_error', 'No images generated', 500, corsHeaders);
      }

      const data = await Promise.all(predictions.map(async pred => {
         const responseMimeType = pred.mimeType || 'image/png';
         const responseFormat = responseMimeType === 'image/jpeg' ? 'jpeg' : 'png';
         const revisedPrompt = pred.prompt || prompt.trim();
         if (response_format === 'b64_json') {
            return {
               b64_json: `data:${responseMimeType};base64,${pred.bytesBase64Encoded}`,
               revised_prompt: revisedPrompt
            };
         } else {
            const imageUrl = await saveImageToR2(pred.bytesBase64Encoded, responseFormat, 'generate', env);
            return {
               url: imageUrl,
               revised_prompt: revisedPrompt
            };
         }
      }));

      return jsonResponse({
         created: Math.floor(Date.now() / 1000),
         data: data
      }, 200, corsHeaders);

   } catch (error) {
      console.error('Imagen generation error:', error);
      return openAIError('api_error', error.message, 500, corsHeaders);
   }
}

// Generate with Nano Banana
async function generateWithNanoBanana(requestBody, env, corsHeaders) {
   const { prompt, response_format } = requestBody;

   const idToken = await getNanoBananaAuthToken();

   const response = await fetch(`${BASE_URL}/generateImage`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${idToken}`,
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt.trim() })
   });

   if (!response.ok) {
      return await handleUpstreamError(response, corsHeaders);
   }

   const result = await response.json();

   if (!result.success || !result.image) {
      return openAIError('api_error', 'No image data in response', 500, corsHeaders);
   }

   let imageData;
   if (response_format === 'b64_json') {
      imageData = {
         b64_json: result.image,
         revised_prompt: prompt.trim()
      };
   } else {
      const imageUrl = await saveImageToR2(result.image, 'png', 'generate', env);
      imageData = {
         url: imageUrl,
         revised_prompt: prompt.trim()
      };
   }

   return jsonResponse({
      created: Math.floor(Date.now() / 1000),
      data: [imageData]
   }, 200, corsHeaders);
}

// Handle /v1/images/edits (GET and POST)
async function handleEdits(request, env, corsHeaders) {
   let prompt, imageInput, response_format;

   if (request.method === 'GET') {
      const url = new URL(request.url);
      prompt = url.searchParams.get('prompt');
      imageInput = url.searchParams.get('image') || url.searchParams.get('url');
      response_format = url.searchParams.get('response_format') || 'url';
   } else if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
         const body = await request.json();
         prompt = body.prompt;
         imageInput = body.image || body.imageUrl;
         response_format = body.response_format || 'url';
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
         const formData = await request.formData();
         prompt = formData.get('prompt');
         imageInput = formData.get('image') || formData.get('url') || formData.get('image[]');
         response_format = formData.get('response_format') || 'url';
      } else {
         return openAIError('invalid_request_error', 'Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded', 400, corsHeaders);
      }
   } else {
      return openAIError('invalid_request_error', 'Method not allowed', 405, corsHeaders);
   }

   if (!prompt) {
      return openAIError('invalid_request_error', 'Missing required parameter: prompt', 400, corsHeaders);
   }

   if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return openAIError('invalid_request_error', 'Invalid prompt: must be a non-empty string', 400, corsHeaders);
   }

   if (!imageInput) {
      return openAIError('invalid_request_error', 'Missing required parameter: image', 400, corsHeaders);
   }

   // Validate response_format
   if (!['url', 'b64_json'].includes(response_format)) {
      return openAIError('invalid_request_error', 'response_format must be "url" or "b64_json"', 400, corsHeaders);
   }

   const processedImage = await processImageInput(imageInput);

   if (!processedImage) {
      return openAIError('invalid_request_error', 'Invalid image format', 400, corsHeaders);
   }

   const idToken = await getNanoBananaAuthToken();

   const apiFormData = new FormData();
   apiFormData.append('prompt', prompt.trim());
   apiFormData.append('image', processedImage.blob, 'image.png');

   const response = await fetch(`${BASE_URL}/editImage`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${idToken}`
      },
      body: apiFormData
   });

   if (!response.ok) {
      return await handleUpstreamError(response, corsHeaders);
   }

   const result = await response.json();

   if (!result.success || !result.image) {
      return openAIError('api_error', 'No image data in response', 500, corsHeaders);
   }

   let imageData;
   if (response_format === 'b64_json') {
      imageData = {
         b64_json: result.image,
         revised_prompt: prompt.trim()
      };
   } else {
      const imageUrl = await saveImageToR2(result.image, 'png', 'edit', env);
      imageData = {
         url: imageUrl,
         revised_prompt: prompt.trim()
      };
   }

   return jsonResponse({
      created: Math.floor(Date.now() / 1000),
      data: [imageData]
   }, 200, corsHeaders);
}

// Handle /v1/images/upscale (Separate endpoint for upscaling)
async function handleUpscale(request, env, corsHeaders) {
   let imageInput, upscaleFactor, response_format;

   if (request.method === 'GET') {
      const url = new URL(request.url);
      imageInput = url.searchParams.get('image') || url.searchParams.get('url');
      upscaleFactor = url.searchParams.get('upscale_factor') || 'x2';
      response_format = url.searchParams.get('response_format') || 'url';
   } else if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
         const body = await request.json();
         imageInput = body.image || body.imageUrl;
         upscaleFactor = body.upscale_factor || 'x2';
         response_format = body.response_format || 'url';
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
         const formData = await request.formData();
         imageInput = formData.get('image') || formData.get('url') || formData.get('image[]');
         upscaleFactor = formData.get('upscale_factor') || 'x2';
         response_format = formData.get('response_format') || 'url';
      } else {
         return openAIError('invalid_request_error', 'Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded', 400, corsHeaders);
      }
   } else {
      return openAIError('invalid_request_error', 'Method not allowed', 405, corsHeaders);
   }

   if (!imageInput) {
      return openAIError('invalid_request_error', 'Missing required parameter: image', 400, corsHeaders);
   }

   // Map upscale factors to imglarger scaleRadio (supports 2 and 4)
   const scaleRadioMap = {
      'x2': 2,
      'x4': 4
   };

   const scaleRadio = scaleRadioMap[upscaleFactor];
   if (!scaleRadio) {
      return openAIError('invalid_request_error', 'Invalid upscale_factor: must be one of x2, x4', 400, corsHeaders);
   }

   // Validate response_format
   if (!['url', 'b64_json'].includes(response_format)) {
      return openAIError('invalid_request_error', 'response_format must be "url" or "b64_json"', 400, corsHeaders);
   }

   try {
      const processedImage = await processImageInput(imageInput);
      if (!processedImage) {
         return openAIError('invalid_request_error', 'Invalid image format', 400, corsHeaders);
      }

      // Step 1: Upload image to imglarger
      const uploadFormData = new FormData();
      uploadFormData.append('myfile', processedImage.blob, 'image.png');
      uploadFormData.append('scaleRadio', scaleRadio.toString());

      const uploadResponse = await fetch(
         'https://get1.imglarger.com/api/UpscalerNew/UploadNew',
         {
            method: 'POST',
            headers: {
               'accept': 'application/json, text/plain, */*',
               'origin': 'https://imgupscaler.com',
               'referer': 'https://imgupscaler.com/',
               'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36'
            },
            body: uploadFormData
         }
      );

      if (!uploadResponse.ok) {
         const errorText = await uploadResponse.text();
         return openAIError('api_error', `Upload error: ${errorText}`, uploadResponse.status, corsHeaders);
      }

      const uploadResult = await uploadResponse.json();
      if (uploadResult.code !== 200 || !uploadResult.data?.code) {
         return openAIError('api_error', uploadResult.msg || 'Upload failed', 500, corsHeaders);
      }

      const jobCode = uploadResult.data.code;

      // Step 2: Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // Max 60 attempts (about 5 minutes with 5s intervals)
      let statusResult;

      while (attempts < maxAttempts) {
         attempts++;
         await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls

         const statusResponse = await fetch(
            'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
            {
               method: 'POST',
               headers: {
                  'accept': 'application/json, text/plain, */*',
                  'content-type': 'application/json',
                  'origin': 'https://imgupscaler.com',
                  'referer': 'https://imgupscaler.com/',
                  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36'
               },
               body: JSON.stringify({
                  code: jobCode,
                  scaleRadio: scaleRadio
               })
            }
         );

         if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            return openAIError('api_error', `Status check error: ${errorText}`, statusResponse.status, corsHeaders);
         }

         statusResult = await statusResponse.json();

         if (statusResult.code !== 200) {
            return openAIError('api_error', statusResult.msg || 'Status check failed', 500, corsHeaders);
         }

         const status = statusResult.data?.status;

         if (status === 'success') {
            break;
         } else if (status === 'waiting') {
            continue;
         } else {
            return openAIError('api_error', 'Upscaling failed', 500, corsHeaders);
         }
      }

      if (attempts >= maxAttempts) {
         return openAIError('api_error', 'Upscaling timeout', 504, corsHeaders);
      }

      // Step 3: Get the upscaled image URL
      const downloadUrls = statusResult.data?.downloadUrls;
      if (!downloadUrls || downloadUrls.length === 0) {
         return openAIError('api_error', 'No download URL in response', 500, corsHeaders);
      }

      const upscaledImageUrl = downloadUrls[0];

      // Download the upscaled image and convert to base64 if needed
      const imageResponse = await fetch(upscaledImageUrl);
      if (!imageResponse.ok) {
         return openAIError('api_error', 'Failed to download upscaled image', 500, corsHeaders);
      }

      const imageBlob = await imageResponse.blob();
      const imageBase64 = await blobToBase64(imageBlob);

      let imageData;
      if (response_format === 'b64_json') {
         imageData = {
            b64_json: `data:image/jpeg;base64,${imageBase64}`,
            revised_prompt: "Upscaled image"
         };
      } else {
         // Save to R2 and return URL
         const imageUrl = await saveImageToR2(imageBase64, 'jpeg', 'upscale', env);
         imageData = {
            url: imageUrl,
            revised_prompt: "Upscaled image"
         };
      }

      return jsonResponse({
         created: Math.floor(Date.now() / 1000),
         data: [imageData]
      }, 200, corsHeaders);

   } catch (error) {
      console.error('Upscale error:', error);
      return openAIError('api_error', error.message, 500, corsHeaders);
   }
}

// Parse size to image size (supports both dimension format and direct size values)
function parseSizeToImageSize(size, quality) {
   if (size === '1K' || size === '2K') {
      return size;
   }

   if (size.includes('x')) {
      const [width, height] = size.split('x').map(Number);
      if (width >= 1536 || height >= 1536) {
         return '2K';
      }
   }

   const qualityMap = {
      'auto': '1K',
      'standard': '1K',
      'low': '1K',
      'medium': '1K',
      'high': '2K',
      'hd': '2K'
   };

   return qualityMap[quality] || '1K';
}

// Parse size to aspect ratio (supports both dimension and aspect ratio formats)
function parseSizeToAspectRatio(size) {
   if (size.includes(':')) {
      const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      if (validRatios.includes(size)) {
         return size;
      }
      const ratioMap = {
         '2:3': '3:4',
         '3:2': '4:3',
      };
      return ratioMap[size] || '1:1';
   }

   if (size === '1K' || size === '2K') {
      return '1:1';
   }

   // Map dimensions to supported aspect ratios only
   const sizeMap = {
      '256x256': '1:1',
      '512x512': '1:1',
      '1024x1024': '1:1',
      '1024x768': '4:3',
      '768x1024': '3:4',
      '1536x1024': '16:9',
      '1024x1536': '9:16',
      '1792x1024': '16:9',
      '1024x1792': '9:16'
   };

   return sizeMap[size] || '1:1';
}

// Parse size to Infip format
function parseSizeToInfipFormat(size) {
   const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
   if (validSizes.includes(size)) {
      return size;
   }
   const ratioMap = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3': '1024x1024',
      '3:4': '1024x1024',
   };
   if (ratioMap[size]) {
      return ratioMap[size];
   }

   return '1024x1024';
}

// Convert blob to base64
async function blobToBase64(blob) {
   const arrayBuffer = await blob.arrayBuffer();
   const bytes = new Uint8Array(arrayBuffer);
   let binary = '';
   for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
   }
   return btoa(binary);
}

// Process image input (URL, base64, or File)
async function processImageInput(input) {
   if (input instanceof File) {
      if (!VALID_IMAGE_TYPES.includes(input.type)) {
         throw new Error(`Invalid image type: ${input.type}`);
      }
      const arrayBuffer = await input.arrayBuffer();
      return {
         blob: new Blob([arrayBuffer], { type: input.type })
      };
   }

   if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
         const response = await fetch(input, {
            headers: {
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
               'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
               'Accept-Language': 'en-US,en;q=0.9',
               'Referer': 'https://www.google.com/',
               'Sec-Fetch-Dest': 'image',
               'Sec-Fetch-Mode': 'no-cors',
               'Sec-Fetch-Site': 'cross-site'
            }
         });

         if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
         }

         const contentType = response.headers.get('content-type');
         if (!contentType || !VALID_IMAGE_TYPES.some(type => contentType.includes(type.split('/')[1]))) {
            throw new Error(`Invalid content type: ${contentType}`);
         }

         const arrayBuffer = await response.arrayBuffer();
         return {
            blob: new Blob([arrayBuffer], { type: contentType })
         };
      }

      if (input.startsWith('data:image/')) {
         const matches = input.match(/^data:(image\/\w+);base64,(.+)$/);
         if (!matches) {
            throw new Error('Invalid base64 image format');
         }

         const mimeType = matches[1];
         const base64Data = matches[2];

         if (!VALID_IMAGE_TYPES.includes(mimeType)) {
            throw new Error(`Unsupported image type: ${mimeType}`);
         }

         const binaryString = atob(base64Data);
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
         }

         return {
            blob: new Blob([bytes], { type: mimeType })
         };
      }

      try {
         const binaryString = atob(input);
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
         }
         return {
            blob: new Blob([bytes], { type: 'image/png' })
         };
      } catch (e) {
         throw new Error('Invalid base64 data');
      }
   }

   return null;
}

// Redirect to homepage for unknown routes
// function redirectToHomepage(corsHeaders) {
//   return Response.redirect(HOMEPAGE_URL, 302);
// }

// Proxy helper 
async function proxyPages(pagePath, corsHeaders) {
   try {
      const response = await fetch(`${PAGES_URL}${pagePath}`);

      if (!response.ok) {
         return openAIError('not_found', 'Page not found', 404, corsHeaders);
      }

      return new Response(response.body, {
         headers: {
            'Content-Type': response.headers.get('Content-Type') || 'text/html',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
         }
      });
   } catch (error) {
      console.error('Proxy error:', error);
      return openAIError('api_error', 'Failed to load page', 500, corsHeaders);
   }
}

// Get auth token for Nano Banana
async function getNanoBananaAuthToken() {
   const response = await fetch(
      `${IDENTITY_URL}/accounts:signUp?key=${API_KEY}`,
      {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ returnSecureToken: true })
      }
   );

   if (!response.ok) {
      throw new Error('Authentication failed');
   }

   const data = await response.json();
   return data.idToken;
}

// OpenAI-style error response
function openAIError(type, message, status = 400, corsHeaders = {}) {
   return jsonResponse({
      error: {
         message: message,
         type: type,
         param: null,
         code: null
      }
   }, status, corsHeaders);
}

// Handle upstream API errors
async function handleUpstreamError(response, corsHeaders) {
   const contentType = response.headers.get('content-type') || '';
   let errorMessage = '';

   if (contentType.includes('application/json')) {
      try {
         const errorData = await response.json();
         errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch (e) {
         errorMessage = 'Failed to parse error response';
      }
   } else {
      errorMessage = await response.text().catch(() => 'Unknown error');
   }

   return openAIError('api_error', `Upstream API error: ${response.status} - ${errorMessage}`, response.status, corsHeaders);
}

// JSON response helper
function jsonResponse(data, status = 200, corsHeaders = {}) {
   return new Response(JSON.stringify(data), {
      status,
      headers: {
         'Content-Type': 'application/json',
         ...corsHeaders
      }
   });
}