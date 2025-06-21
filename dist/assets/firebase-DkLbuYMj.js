const rd=()=>{};var Ca={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eu=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},id=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const o=n[t++];e[r++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){const o=n[t++],a=n[t++],u=n[t++],h=((i&7)<<18|(o&63)<<12|(a&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(h>>10)),e[r++]=String.fromCharCode(56320+(h&1023))}else{const o=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(o&63)<<6|a&63)}}return e.join("")},tu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const o=n[i],a=i+1<n.length,u=a?n[i+1]:0,h=i+2<n.length,d=h?n[i+2]:0,p=o>>2,y=(o&3)<<4|u>>4;let E=(u&15)<<2|d>>6,S=d&63;h||(S=64,a||(E=64)),r.push(t[p],t[y],t[E],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(eu(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):id(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const o=t[n.charAt(i++)],u=i<n.length?t[n.charAt(i)]:0;++i;const d=i<n.length?t[n.charAt(i)]:64;++i;const y=i<n.length?t[n.charAt(i)]:64;if(++i,o==null||u==null||d==null||y==null)throw new sd;const E=o<<2|u>>4;if(r.push(E),d!==64){const S=u<<4&240|d>>2;if(r.push(S),y!==64){const b=d<<6&192|y;r.push(b)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class sd extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const od=function(n){const e=eu(n);return tu.encodeByteArray(e,!0)},qr=function(n){return od(n).replace(/\./g,"")},nu=function(n){try{return tu.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ad(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cd=()=>ad().__FIREBASE_DEFAULTS__,ud=()=>{if(typeof process>"u"||typeof Ca>"u")return;const n=Ca.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ld=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&nu(n[1]);return e&&JSON.parse(e)},ui=()=>{try{return rd()||cd()||ud()||ld()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},ru=n=>{var e,t;return(t=(e=ui())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},hd=n=>{const e=ru(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},iu=()=>{var n;return(n=ui())===null||n===void 0?void 0:n.config},su=n=>{var e;return(e=ui())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dd{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yn(n){return n.endsWith(".cloudworkstations.dev")}async function ou(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fd(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},n);return[qr(JSON.stringify(t)),qr(JSON.stringify(a)),""].join(".")}const Mn={};function pd(){const n={prod:[],emulator:[]};for(const e of Object.keys(Mn))Mn[e]?n.emulator.push(e):n.prod.push(e);return n}function md(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let ba=!1;function au(n,e){if(typeof window>"u"||typeof document>"u"||!Yn(window.location.host)||Mn[n]===e||Mn[n]||ba)return;Mn[n]=e;function t(E){return`__firebase__banner__${E}`}const r="__firebase__banner",o=pd().prod.length>0;function a(){const E=document.getElementById(r);E&&E.remove()}function u(E){E.style.display="flex",E.style.background="#7faaf0",E.style.position="fixed",E.style.bottom="5px",E.style.left="5px",E.style.padding=".5em",E.style.borderRadius="5px",E.style.alignItems="center"}function h(E,S){E.setAttribute("width","24"),E.setAttribute("id",S),E.setAttribute("height","24"),E.setAttribute("viewBox","0 0 24 24"),E.setAttribute("fill","none"),E.style.marginLeft="-6px"}function d(){const E=document.createElement("span");return E.style.cursor="pointer",E.style.marginLeft="16px",E.style.fontSize="24px",E.innerHTML=" &times;",E.onclick=()=>{ba=!0,a()},E}function p(E,S){E.setAttribute("id",S),E.innerText="Learn more",E.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",E.setAttribute("target","__blank"),E.style.paddingLeft="5px",E.style.textDecoration="underline"}function y(){const E=md(r),S=t("text"),b=document.getElementById(S)||document.createElement("span"),N=t("learnmore"),V=document.getElementById(N)||document.createElement("a"),W=t("preprendIcon"),B=document.getElementById(W)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(E.created){const $=E.element;u($),p(V,N);const Y=d();h(B,W),$.append(B,b,V,Y),document.body.appendChild($)}o?(b.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,b.innerText="Preview backend running in this workspace."),b.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",y):y()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function gd(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ve())}function _d(){var n;const e=(n=ui())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function yd(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function vd(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Ed(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Td(){const n=ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Id(){return!_d()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function wd(){try{return typeof indexedDB=="object"}catch{return!1}}function Ad(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var o;e(((o=i.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rd="FirebaseError";class Ye extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Rd,Object.setPrototypeOf(this,Ye.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Xn.prototype.create)}}class Xn{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,o=this.errors[e],a=o?Pd(o,r):"Error",u=`${this.serviceName}: ${a} (${i}).`;return new Ye(i,u,r)}}function Pd(n,e){return n.replace(Sd,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Sd=/\{\$([^}]+)}/g;function Cd(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ft(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const o=n[i],a=e[i];if(ka(o)&&ka(a)){if(!ft(o,a))return!1}else if(o!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function ka(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zn(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Vn(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,o]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(o)}}),e}function Dn(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function bd(n,e){const t=new kd(n,e);return t.subscribe.bind(t)}class kd{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Vd(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=es),i.error===void 0&&(i.error=es),i.complete===void 0&&(i.complete=es);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Vd(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function es(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(n){return n&&n._delegate?n._delegate:n}class kt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ct="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dd{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new dd;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(i)return null;throw o}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Od(e))try{this.getOrInitializeService({instanceIdentifier:Ct})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:i});r.resolve(o)}catch{}}}}clearInstance(e=Ct){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ct){return this.instances.has(e)}getOptions(e=Ct){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[o,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(o);r===u&&a.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),o=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;o.add(e),this.onInitCallbacks.set(i,o);const a=this.instances.get(i);return a&&e(a,i),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Nd(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Ct){return this.component?this.component.multipleInstances?e:Ct:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Nd(n){return n===Ct?void 0:n}function Od(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Dd(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var q;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(q||(q={}));const Md={debug:q.DEBUG,verbose:q.VERBOSE,info:q.INFO,warn:q.WARN,error:q.ERROR,silent:q.SILENT},xd=q.INFO,Ud={[q.DEBUG]:"log",[q.VERBOSE]:"log",[q.INFO]:"info",[q.WARN]:"warn",[q.ERROR]:"error"},Fd=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Ud[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class xs{constructor(e){this.name=e,this._logLevel=xd,this._logHandler=Fd,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in q))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Md[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,q.DEBUG,...e),this._logHandler(this,q.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,q.VERBOSE,...e),this._logHandler(this,q.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,q.INFO,...e),this._logHandler(this,q.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,q.WARN,...e),this._logHandler(this,q.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,q.ERROR,...e),this._logHandler(this,q.ERROR,...e)}}const Bd=(n,e)=>e.some(t=>n instanceof t);let Va,Da;function jd(){return Va||(Va=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function $d(){return Da||(Da=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const cu=new WeakMap,hs=new WeakMap,uu=new WeakMap,ts=new WeakMap,Us=new WeakMap;function qd(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{t(ct(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",o),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&cu.set(t,n)}).catch(()=>{}),Us.set(e,n),e}function zd(n){if(hs.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});hs.set(n,e)}let ds={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return hs.get(n);if(e==="objectStoreNames")return n.objectStoreNames||uu.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return ct(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Hd(n){ds=n(ds)}function Wd(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ns(this),e,...t);return uu.set(r,e.sort?e.sort():[e]),ct(r)}:$d().includes(n)?function(...e){return n.apply(ns(this),e),ct(cu.get(this))}:function(...e){return ct(n.apply(ns(this),e))}}function Gd(n){return typeof n=="function"?Wd(n):(n instanceof IDBTransaction&&zd(n),Bd(n,jd())?new Proxy(n,ds):n)}function ct(n){if(n instanceof IDBRequest)return qd(n);if(ts.has(n))return ts.get(n);const e=Gd(n);return e!==n&&(ts.set(n,e),Us.set(e,n)),e}const ns=n=>Us.get(n);function Kd(n,e,{blocked:t,upgrade:r,blocking:i,terminated:o}={}){const a=indexedDB.open(n,e),u=ct(a);return r&&a.addEventListener("upgradeneeded",h=>{r(ct(a.result),h.oldVersion,h.newVersion,ct(a.transaction),h)}),t&&a.addEventListener("blocked",h=>t(h.oldVersion,h.newVersion,h)),u.then(h=>{o&&h.addEventListener("close",()=>o()),i&&h.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}const Qd=["get","getKey","getAll","getAllKeys","count"],Jd=["put","add","delete","clear"],rs=new Map;function Na(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(rs.get(e))return rs.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=Jd.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Qd.includes(t)))return;const o=async function(a,...u){const h=this.transaction(a,i?"readwrite":"readonly");let d=h.store;return r&&(d=d.index(u.shift())),(await Promise.all([d[t](...u),i&&h.done]))[0]};return rs.set(e,o),o}Hd(n=>({...n,get:(e,t,r)=>Na(e,t)||n.get(e,t,r),has:(e,t)=>!!Na(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yd{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Xd(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Xd(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const fs="@firebase/app",Oa="0.13.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ge=new xs("@firebase/app"),Zd="@firebase/app-compat",ef="@firebase/analytics-compat",tf="@firebase/analytics",nf="@firebase/app-check-compat",rf="@firebase/app-check",sf="@firebase/auth",of="@firebase/auth-compat",af="@firebase/database",cf="@firebase/data-connect",uf="@firebase/database-compat",lf="@firebase/functions",hf="@firebase/functions-compat",df="@firebase/installations",ff="@firebase/installations-compat",pf="@firebase/messaging",mf="@firebase/messaging-compat",gf="@firebase/performance",_f="@firebase/performance-compat",yf="@firebase/remote-config",vf="@firebase/remote-config-compat",Ef="@firebase/storage",Tf="@firebase/storage-compat",If="@firebase/firestore",wf="@firebase/ai",Af="@firebase/firestore-compat",Rf="firebase",Pf="11.8.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ps="[DEFAULT]",Sf={[fs]:"fire-core",[Zd]:"fire-core-compat",[tf]:"fire-analytics",[ef]:"fire-analytics-compat",[rf]:"fire-app-check",[nf]:"fire-app-check-compat",[sf]:"fire-auth",[of]:"fire-auth-compat",[af]:"fire-rtdb",[cf]:"fire-data-connect",[uf]:"fire-rtdb-compat",[lf]:"fire-fn",[hf]:"fire-fn-compat",[df]:"fire-iid",[ff]:"fire-iid-compat",[pf]:"fire-fcm",[mf]:"fire-fcm-compat",[gf]:"fire-perf",[_f]:"fire-perf-compat",[yf]:"fire-rc",[vf]:"fire-rc-compat",[Ef]:"fire-gcs",[Tf]:"fire-gcs-compat",[If]:"fire-fst",[Af]:"fire-fst-compat",[wf]:"fire-vertex","fire-js":"fire-js",[Rf]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zr=new Map,Cf=new Map,ms=new Map;function La(n,e){try{n.container.addComponent(e)}catch(t){Ge.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Xt(n){const e=n.name;if(ms.has(e))return Ge.debug(`There were multiple attempts to register component ${e}.`),!1;ms.set(e,n);for(const t of zr.values())La(t,n);for(const t of Cf.values())La(t,n);return!0}function Fs(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function be(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bf={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ut=new Xn("app","Firebase",bf);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new kt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ut.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cn=Pf;function Vf(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ps,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw ut.create("bad-app-name",{appName:String(i)});if(t||(t=iu()),!t)throw ut.create("no-options");const o=zr.get(i);if(o){if(ft(t,o.options)&&ft(r,o.config))return o;throw ut.create("duplicate-app",{appName:i})}const a=new Ld(i);for(const h of ms.values())a.addComponent(h);const u=new kf(t,r,a);return zr.set(i,u),u}function lu(n=ps){const e=zr.get(n);if(!e&&n===ps&&iu())return Vf();if(!e)throw ut.create("no-app",{appName:n});return e}function lt(n,e,t){var r;let i=(r=Sf[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const o=i.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const u=[`Unable to register library "${i}" with version "${e}":`];o&&u.push(`library name "${i}" contains illegal characters (whitespace or "/")`),o&&a&&u.push("and"),a&&u.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ge.warn(u.join(" "));return}Xt(new kt(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Df="firebase-heartbeat-database",Nf=1,$n="firebase-heartbeat-store";let is=null;function hu(){return is||(is=Kd(Df,Nf,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore($n)}catch(t){console.warn(t)}}}}).catch(n=>{throw ut.create("idb-open",{originalErrorMessage:n.message})})),is}async function Of(n){try{const t=(await hu()).transaction($n),r=await t.objectStore($n).get(du(n));return await t.done,r}catch(e){if(e instanceof Ye)Ge.warn(e.message);else{const t=ut.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ge.warn(t.message)}}}async function Ma(n,e){try{const r=(await hu()).transaction($n,"readwrite");await r.objectStore($n).put(e,du(n)),await r.done}catch(t){if(t instanceof Ye)Ge.warn(t.message);else{const r=ut.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ge.warn(r.message)}}}function du(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lf=1024,Mf=30;class xf{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Ff(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=xa();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:i}),this._heartbeatsCache.heartbeats.length>Mf){const a=Bf(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Ge.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=xa(),{heartbeatsToSend:r,unsentEntries:i}=Uf(this._heartbeatsCache.heartbeats),o=qr(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return Ge.warn(t),""}}}function xa(){return new Date().toISOString().substring(0,10)}function Uf(n,e=Lf){const t=[];let r=n.slice();for(const i of n){const o=t.find(a=>a.agent===i.agent);if(o){if(o.dates.push(i.date),Ua(t)>e){o.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Ua(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Ff{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return wd()?Ad().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Of(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Ma(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Ma(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Ua(n){return qr(JSON.stringify({version:2,heartbeats:n})).length}function Bf(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jf(n){Xt(new kt("platform-logger",e=>new Yd(e),"PRIVATE")),Xt(new kt("heartbeat",e=>new xf(e),"PRIVATE")),lt(fs,Oa,n),lt(fs,Oa,"esm2017"),lt("fire-js","")}jf("");var Fa=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ht,fu;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,m){function _(){}_.prototype=m.prototype,T.D=m.prototype,T.prototype=new _,T.prototype.constructor=T,T.C=function(v,I,A){for(var g=Array(arguments.length-2),je=2;je<arguments.length;je++)g[je-2]=arguments[je];return m.prototype[I].apply(v,g)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(T,m,_){_||(_=0);var v=Array(16);if(typeof m=="string")for(var I=0;16>I;++I)v[I]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(I=0;16>I;++I)v[I]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=T.g[0],_=T.g[1],I=T.g[2];var A=T.g[3],g=m+(A^_&(I^A))+v[0]+3614090360&4294967295;m=_+(g<<7&4294967295|g>>>25),g=A+(I^m&(_^I))+v[1]+3905402710&4294967295,A=m+(g<<12&4294967295|g>>>20),g=I+(_^A&(m^_))+v[2]+606105819&4294967295,I=A+(g<<17&4294967295|g>>>15),g=_+(m^I&(A^m))+v[3]+3250441966&4294967295,_=I+(g<<22&4294967295|g>>>10),g=m+(A^_&(I^A))+v[4]+4118548399&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(I^m&(_^I))+v[5]+1200080426&4294967295,A=m+(g<<12&4294967295|g>>>20),g=I+(_^A&(m^_))+v[6]+2821735955&4294967295,I=A+(g<<17&4294967295|g>>>15),g=_+(m^I&(A^m))+v[7]+4249261313&4294967295,_=I+(g<<22&4294967295|g>>>10),g=m+(A^_&(I^A))+v[8]+1770035416&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(I^m&(_^I))+v[9]+2336552879&4294967295,A=m+(g<<12&4294967295|g>>>20),g=I+(_^A&(m^_))+v[10]+4294925233&4294967295,I=A+(g<<17&4294967295|g>>>15),g=_+(m^I&(A^m))+v[11]+2304563134&4294967295,_=I+(g<<22&4294967295|g>>>10),g=m+(A^_&(I^A))+v[12]+1804603682&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(I^m&(_^I))+v[13]+4254626195&4294967295,A=m+(g<<12&4294967295|g>>>20),g=I+(_^A&(m^_))+v[14]+2792965006&4294967295,I=A+(g<<17&4294967295|g>>>15),g=_+(m^I&(A^m))+v[15]+1236535329&4294967295,_=I+(g<<22&4294967295|g>>>10),g=m+(I^A&(_^I))+v[1]+4129170786&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^I&(m^_))+v[6]+3225465664&4294967295,A=m+(g<<9&4294967295|g>>>23),g=I+(m^_&(A^m))+v[11]+643717713&4294967295,I=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(I^A))+v[0]+3921069994&4294967295,_=I+(g<<20&4294967295|g>>>12),g=m+(I^A&(_^I))+v[5]+3593408605&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^I&(m^_))+v[10]+38016083&4294967295,A=m+(g<<9&4294967295|g>>>23),g=I+(m^_&(A^m))+v[15]+3634488961&4294967295,I=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(I^A))+v[4]+3889429448&4294967295,_=I+(g<<20&4294967295|g>>>12),g=m+(I^A&(_^I))+v[9]+568446438&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^I&(m^_))+v[14]+3275163606&4294967295,A=m+(g<<9&4294967295|g>>>23),g=I+(m^_&(A^m))+v[3]+4107603335&4294967295,I=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(I^A))+v[8]+1163531501&4294967295,_=I+(g<<20&4294967295|g>>>12),g=m+(I^A&(_^I))+v[13]+2850285829&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^I&(m^_))+v[2]+4243563512&4294967295,A=m+(g<<9&4294967295|g>>>23),g=I+(m^_&(A^m))+v[7]+1735328473&4294967295,I=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(I^A))+v[12]+2368359562&4294967295,_=I+(g<<20&4294967295|g>>>12),g=m+(_^I^A)+v[5]+4294588738&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^I)+v[8]+2272392833&4294967295,A=m+(g<<11&4294967295|g>>>21),g=I+(A^m^_)+v[11]+1839030562&4294967295,I=A+(g<<16&4294967295|g>>>16),g=_+(I^A^m)+v[14]+4259657740&4294967295,_=I+(g<<23&4294967295|g>>>9),g=m+(_^I^A)+v[1]+2763975236&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^I)+v[4]+1272893353&4294967295,A=m+(g<<11&4294967295|g>>>21),g=I+(A^m^_)+v[7]+4139469664&4294967295,I=A+(g<<16&4294967295|g>>>16),g=_+(I^A^m)+v[10]+3200236656&4294967295,_=I+(g<<23&4294967295|g>>>9),g=m+(_^I^A)+v[13]+681279174&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^I)+v[0]+3936430074&4294967295,A=m+(g<<11&4294967295|g>>>21),g=I+(A^m^_)+v[3]+3572445317&4294967295,I=A+(g<<16&4294967295|g>>>16),g=_+(I^A^m)+v[6]+76029189&4294967295,_=I+(g<<23&4294967295|g>>>9),g=m+(_^I^A)+v[9]+3654602809&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^I)+v[12]+3873151461&4294967295,A=m+(g<<11&4294967295|g>>>21),g=I+(A^m^_)+v[15]+530742520&4294967295,I=A+(g<<16&4294967295|g>>>16),g=_+(I^A^m)+v[2]+3299628645&4294967295,_=I+(g<<23&4294967295|g>>>9),g=m+(I^(_|~A))+v[0]+4096336452&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~I))+v[7]+1126891415&4294967295,A=m+(g<<10&4294967295|g>>>22),g=I+(m^(A|~_))+v[14]+2878612391&4294967295,I=A+(g<<15&4294967295|g>>>17),g=_+(A^(I|~m))+v[5]+4237533241&4294967295,_=I+(g<<21&4294967295|g>>>11),g=m+(I^(_|~A))+v[12]+1700485571&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~I))+v[3]+2399980690&4294967295,A=m+(g<<10&4294967295|g>>>22),g=I+(m^(A|~_))+v[10]+4293915773&4294967295,I=A+(g<<15&4294967295|g>>>17),g=_+(A^(I|~m))+v[1]+2240044497&4294967295,_=I+(g<<21&4294967295|g>>>11),g=m+(I^(_|~A))+v[8]+1873313359&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~I))+v[15]+4264355552&4294967295,A=m+(g<<10&4294967295|g>>>22),g=I+(m^(A|~_))+v[6]+2734768916&4294967295,I=A+(g<<15&4294967295|g>>>17),g=_+(A^(I|~m))+v[13]+1309151649&4294967295,_=I+(g<<21&4294967295|g>>>11),g=m+(I^(_|~A))+v[4]+4149444226&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~I))+v[11]+3174756917&4294967295,A=m+(g<<10&4294967295|g>>>22),g=I+(m^(A|~_))+v[2]+718787259&4294967295,I=A+(g<<15&4294967295|g>>>17),g=_+(A^(I|~m))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+m&4294967295,T.g[1]=T.g[1]+(I+(g<<21&4294967295|g>>>11))&4294967295,T.g[2]=T.g[2]+I&4294967295,T.g[3]=T.g[3]+A&4294967295}r.prototype.u=function(T,m){m===void 0&&(m=T.length);for(var _=m-this.blockSize,v=this.B,I=this.h,A=0;A<m;){if(I==0)for(;A<=_;)i(this,T,A),A+=this.blockSize;if(typeof T=="string"){for(;A<m;)if(v[I++]=T.charCodeAt(A++),I==this.blockSize){i(this,v),I=0;break}}else for(;A<m;)if(v[I++]=T[A++],I==this.blockSize){i(this,v),I=0;break}}this.h=I,this.o+=m},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var m=1;m<T.length-8;++m)T[m]=0;var _=8*this.o;for(m=T.length-8;m<T.length;++m)T[m]=_&255,_/=256;for(this.u(T),T=Array(16),m=_=0;4>m;++m)for(var v=0;32>v;v+=8)T[_++]=this.g[m]>>>v&255;return T};function o(T,m){var _=u;return Object.prototype.hasOwnProperty.call(_,T)?_[T]:_[T]=m(T)}function a(T,m){this.h=m;for(var _=[],v=!0,I=T.length-1;0<=I;I--){var A=T[I]|0;v&&A==m||(_[I]=A,v=!1)}this.g=_}var u={};function h(T){return-128<=T&&128>T?o(T,function(m){return new a([m|0],0>m?-1:0)}):new a([T|0],0>T?-1:0)}function d(T){if(isNaN(T)||!isFinite(T))return y;if(0>T)return V(d(-T));for(var m=[],_=1,v=0;T>=_;v++)m[v]=T/_|0,_*=4294967296;return new a(m,0)}function p(T,m){if(T.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(T.charAt(0)=="-")return V(p(T.substring(1),m));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),v=y,I=0;I<T.length;I+=8){var A=Math.min(8,T.length-I),g=parseInt(T.substring(I,I+A),m);8>A?(A=d(Math.pow(m,A)),v=v.j(A).add(d(g))):(v=v.j(_),v=v.add(d(g)))}return v}var y=h(0),E=h(1),S=h(16777216);n=a.prototype,n.m=function(){if(N(this))return-V(this).m();for(var T=0,m=1,_=0;_<this.g.length;_++){var v=this.i(_);T+=(0<=v?v:4294967296+v)*m,m*=4294967296}return T},n.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(b(this))return"0";if(N(this))return"-"+V(this).toString(T);for(var m=d(Math.pow(T,6)),_=this,v="";;){var I=Y(_,m).g;_=W(_,I.j(m));var A=((0<_.g.length?_.g[0]:_.h)>>>0).toString(T);if(_=I,b(_))return A+v;for(;6>A.length;)A="0"+A;v=A+v}},n.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function b(T){if(T.h!=0)return!1;for(var m=0;m<T.g.length;m++)if(T.g[m]!=0)return!1;return!0}function N(T){return T.h==-1}n.l=function(T){return T=W(this,T),N(T)?-1:b(T)?0:1};function V(T){for(var m=T.g.length,_=[],v=0;v<m;v++)_[v]=~T.g[v];return new a(_,~T.h).add(E)}n.abs=function(){return N(this)?V(this):this},n.add=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],v=0,I=0;I<=m;I++){var A=v+(this.i(I)&65535)+(T.i(I)&65535),g=(A>>>16)+(this.i(I)>>>16)+(T.i(I)>>>16);v=g>>>16,A&=65535,g&=65535,_[I]=g<<16|A}return new a(_,_[_.length-1]&-2147483648?-1:0)};function W(T,m){return T.add(V(m))}n.j=function(T){if(b(this)||b(T))return y;if(N(this))return N(T)?V(this).j(V(T)):V(V(this).j(T));if(N(T))return V(this.j(V(T)));if(0>this.l(S)&&0>T.l(S))return d(this.m()*T.m());for(var m=this.g.length+T.g.length,_=[],v=0;v<2*m;v++)_[v]=0;for(v=0;v<this.g.length;v++)for(var I=0;I<T.g.length;I++){var A=this.i(v)>>>16,g=this.i(v)&65535,je=T.i(I)>>>16,pn=T.i(I)&65535;_[2*v+2*I]+=g*pn,B(_,2*v+2*I),_[2*v+2*I+1]+=A*pn,B(_,2*v+2*I+1),_[2*v+2*I+1]+=g*je,B(_,2*v+2*I+1),_[2*v+2*I+2]+=A*je,B(_,2*v+2*I+2)}for(v=0;v<m;v++)_[v]=_[2*v+1]<<16|_[2*v];for(v=m;v<2*m;v++)_[v]=0;return new a(_,0)};function B(T,m){for(;(T[m]&65535)!=T[m];)T[m+1]+=T[m]>>>16,T[m]&=65535,m++}function $(T,m){this.g=T,this.h=m}function Y(T,m){if(b(m))throw Error("division by zero");if(b(T))return new $(y,y);if(N(T))return m=Y(V(T),m),new $(V(m.g),V(m.h));if(N(m))return m=Y(T,V(m)),new $(V(m.g),m.h);if(30<T.g.length){if(N(T)||N(m))throw Error("slowDivide_ only works with positive integers.");for(var _=E,v=m;0>=v.l(T);)_=Ce(_),v=Ce(v);var I=te(_,1),A=te(v,1);for(v=te(v,2),_=te(_,2);!b(v);){var g=A.add(v);0>=g.l(T)&&(I=I.add(_),A=g),v=te(v,1),_=te(_,1)}return m=W(T,I.j(m)),new $(I,m)}for(I=y;0<=T.l(m);){for(_=Math.max(1,Math.floor(T.m()/m.m())),v=Math.ceil(Math.log(_)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),A=d(_),g=A.j(m);N(g)||0<g.l(T);)_-=v,A=d(_),g=A.j(m);b(A)&&(A=E),I=I.add(A),T=W(T,g)}return new $(I,T)}n.A=function(T){return Y(this,T).h},n.and=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)&T.i(v);return new a(_,this.h&T.h)},n.or=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)|T.i(v);return new a(_,this.h|T.h)},n.xor=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)^T.i(v);return new a(_,this.h^T.h)};function Ce(T){for(var m=T.g.length+1,_=[],v=0;v<m;v++)_[v]=T.i(v)<<1|T.i(v-1)>>>31;return new a(_,T.h)}function te(T,m){var _=m>>5;m%=32;for(var v=T.g.length-_,I=[],A=0;A<v;A++)I[A]=0<m?T.i(A+_)>>>m|T.i(A+_+1)<<32-m:T.i(A+_);return new a(I,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,fu=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,ht=a}).apply(typeof Fa<"u"?Fa:typeof self<"u"?self:typeof window<"u"?window:{});var Cr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pu,Nn,mu,Or,gs,gu,_u,yu;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(s,c,l){return s==Array.prototype||s==Object.prototype||(s[c]=l.value),s};function t(s){s=[typeof globalThis=="object"&&globalThis,s,typeof window=="object"&&window,typeof self=="object"&&self,typeof Cr=="object"&&Cr];for(var c=0;c<s.length;++c){var l=s[c];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=t(this);function i(s,c){if(c)e:{var l=r;s=s.split(".");for(var f=0;f<s.length-1;f++){var w=s[f];if(!(w in l))break e;l=l[w]}s=s[s.length-1],f=l[s],c=c(f),c!=f&&c!=null&&e(l,s,{configurable:!0,writable:!0,value:c})}}function o(s,c){s instanceof String&&(s+="");var l=0,f=!1,w={next:function(){if(!f&&l<s.length){var R=l++;return{value:c(R,s[R]),done:!1}}return f=!0,{done:!0,value:void 0}}};return w[Symbol.iterator]=function(){return w},w}i("Array.prototype.values",function(s){return s||function(){return o(this,function(c,l){return l})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function h(s){var c=typeof s;return c=c!="object"?c:s?Array.isArray(s)?"array":c:"null",c=="array"||c=="object"&&typeof s.length=="number"}function d(s){var c=typeof s;return c=="object"&&s!=null||c=="function"}function p(s,c,l){return s.call.apply(s.bind,arguments)}function y(s,c,l){if(!s)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var w=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(w,f),s.apply(c,w)}}return function(){return s.apply(c,arguments)}}function E(s,c,l){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:y,E.apply(null,arguments)}function S(s,c){var l=Array.prototype.slice.call(arguments,1);return function(){var f=l.slice();return f.push.apply(f,arguments),s.apply(this,f)}}function b(s,c){function l(){}l.prototype=c.prototype,s.aa=c.prototype,s.prototype=new l,s.prototype.constructor=s,s.Qb=function(f,w,R){for(var k=Array(arguments.length-2),Q=2;Q<arguments.length;Q++)k[Q-2]=arguments[Q];return c.prototype[w].apply(f,k)}}function N(s){const c=s.length;if(0<c){const l=Array(c);for(let f=0;f<c;f++)l[f]=s[f];return l}return[]}function V(s,c){for(let l=1;l<arguments.length;l++){const f=arguments[l];if(h(f)){const w=s.length||0,R=f.length||0;s.length=w+R;for(let k=0;k<R;k++)s[w+k]=f[k]}else s.push(f)}}class W{constructor(c,l){this.i=c,this.j=l,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function B(s){return/^[\s\xa0]*$/.test(s)}function $(){var s=u.navigator;return s&&(s=s.userAgent)?s:""}function Y(s){return Y[" "](s),s}Y[" "]=function(){};var Ce=$().indexOf("Gecko")!=-1&&!($().toLowerCase().indexOf("webkit")!=-1&&$().indexOf("Edge")==-1)&&!($().indexOf("Trident")!=-1||$().indexOf("MSIE")!=-1)&&$().indexOf("Edge")==-1;function te(s,c,l){for(const f in s)c.call(l,s[f],f,s)}function T(s,c){for(const l in s)c.call(void 0,s[l],l,s)}function m(s){const c={};for(const l in s)c[l]=s[l];return c}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(s,c){let l,f;for(let w=1;w<arguments.length;w++){f=arguments[w];for(l in f)s[l]=f[l];for(let R=0;R<_.length;R++)l=_[R],Object.prototype.hasOwnProperty.call(f,l)&&(s[l]=f[l])}}function I(s){var c=1;s=s.split(":");const l=[];for(;0<c&&s.length;)l.push(s.shift()),c--;return s.length&&l.push(s.join(":")),l}function A(s){u.setTimeout(()=>{throw s},0)}function g(){var s=ki;let c=null;return s.g&&(c=s.g,s.g=s.g.next,s.g||(s.h=null),c.next=null),c}class je{constructor(){this.h=this.g=null}add(c,l){const f=pn.get();f.set(c,l),this.h?this.h.next=f:this.g=f,this.h=f}}var pn=new W(()=>new Ih,s=>s.reset());class Ih{constructor(){this.next=this.g=this.h=null}set(c,l){this.h=c,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let mn,gn=!1,ki=new je,Co=()=>{const s=u.Promise.resolve(void 0);mn=()=>{s.then(wh)}};var wh=()=>{for(var s;s=g();){try{s.h.call(s.g)}catch(l){A(l)}var c=pn;c.j(s),100>c.h&&(c.h++,s.next=c.g,c.g=s)}gn=!1};function Xe(){this.s=this.s,this.C=this.C}Xe.prototype.s=!1,Xe.prototype.ma=function(){this.s||(this.s=!0,this.N())},Xe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function de(s,c){this.type=s,this.g=this.target=c,this.defaultPrevented=!1}de.prototype.h=function(){this.defaultPrevented=!0};var Ah=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var s=!1,c=Object.defineProperty({},"passive",{get:function(){s=!0}});try{const l=()=>{};u.addEventListener("test",l,c),u.removeEventListener("test",l,c)}catch{}return s}();function _n(s,c){if(de.call(this,s?s.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,s){var l=this.type=s.type,f=s.changedTouches&&s.changedTouches.length?s.changedTouches[0]:null;if(this.target=s.target||s.srcElement,this.g=c,c=s.relatedTarget){if(Ce){e:{try{Y(c.nodeName);var w=!0;break e}catch{}w=!1}w||(c=null)}}else l=="mouseover"?c=s.fromElement:l=="mouseout"&&(c=s.toElement);this.relatedTarget=c,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0),this.button=s.button,this.key=s.key||"",this.ctrlKey=s.ctrlKey,this.altKey=s.altKey,this.shiftKey=s.shiftKey,this.metaKey=s.metaKey,this.pointerId=s.pointerId||0,this.pointerType=typeof s.pointerType=="string"?s.pointerType:Rh[s.pointerType]||"",this.state=s.state,this.i=s,s.defaultPrevented&&_n.aa.h.call(this)}}b(_n,de);var Rh={2:"touch",3:"pen",4:"mouse"};_n.prototype.h=function(){_n.aa.h.call(this);var s=this.i;s.preventDefault?s.preventDefault():s.returnValue=!1};var ur="closure_listenable_"+(1e6*Math.random()|0),Ph=0;function Sh(s,c,l,f,w){this.listener=s,this.proxy=null,this.src=c,this.type=l,this.capture=!!f,this.ha=w,this.key=++Ph,this.da=this.fa=!1}function lr(s){s.da=!0,s.listener=null,s.proxy=null,s.src=null,s.ha=null}function hr(s){this.src=s,this.g={},this.h=0}hr.prototype.add=function(s,c,l,f,w){var R=s.toString();s=this.g[R],s||(s=this.g[R]=[],this.h++);var k=Di(s,c,f,w);return-1<k?(c=s[k],l||(c.fa=!1)):(c=new Sh(c,this.src,R,!!f,w),c.fa=l,s.push(c)),c};function Vi(s,c){var l=c.type;if(l in s.g){var f=s.g[l],w=Array.prototype.indexOf.call(f,c,void 0),R;(R=0<=w)&&Array.prototype.splice.call(f,w,1),R&&(lr(c),s.g[l].length==0&&(delete s.g[l],s.h--))}}function Di(s,c,l,f){for(var w=0;w<s.length;++w){var R=s[w];if(!R.da&&R.listener==c&&R.capture==!!l&&R.ha==f)return w}return-1}var Ni="closure_lm_"+(1e6*Math.random()|0),Oi={};function bo(s,c,l,f,w){if(Array.isArray(c)){for(var R=0;R<c.length;R++)bo(s,c[R],l,f,w);return null}return l=Do(l),s&&s[ur]?s.K(c,l,d(f)?!!f.capture:!1,w):Ch(s,c,l,!1,f,w)}function Ch(s,c,l,f,w,R){if(!c)throw Error("Invalid event type");var k=d(w)?!!w.capture:!!w,Q=Mi(s);if(Q||(s[Ni]=Q=new hr(s)),l=Q.add(c,l,f,k,R),l.proxy)return l;if(f=bh(),l.proxy=f,f.src=s,f.listener=l,s.addEventListener)Ah||(w=k),w===void 0&&(w=!1),s.addEventListener(c.toString(),f,w);else if(s.attachEvent)s.attachEvent(Vo(c.toString()),f);else if(s.addListener&&s.removeListener)s.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return l}function bh(){function s(l){return c.call(s.src,s.listener,l)}const c=kh;return s}function ko(s,c,l,f,w){if(Array.isArray(c))for(var R=0;R<c.length;R++)ko(s,c[R],l,f,w);else f=d(f)?!!f.capture:!!f,l=Do(l),s&&s[ur]?(s=s.i,c=String(c).toString(),c in s.g&&(R=s.g[c],l=Di(R,l,f,w),-1<l&&(lr(R[l]),Array.prototype.splice.call(R,l,1),R.length==0&&(delete s.g[c],s.h--)))):s&&(s=Mi(s))&&(c=s.g[c.toString()],s=-1,c&&(s=Di(c,l,f,w)),(l=-1<s?c[s]:null)&&Li(l))}function Li(s){if(typeof s!="number"&&s&&!s.da){var c=s.src;if(c&&c[ur])Vi(c.i,s);else{var l=s.type,f=s.proxy;c.removeEventListener?c.removeEventListener(l,f,s.capture):c.detachEvent?c.detachEvent(Vo(l),f):c.addListener&&c.removeListener&&c.removeListener(f),(l=Mi(c))?(Vi(l,s),l.h==0&&(l.src=null,c[Ni]=null)):lr(s)}}}function Vo(s){return s in Oi?Oi[s]:Oi[s]="on"+s}function kh(s,c){if(s.da)s=!0;else{c=new _n(c,this);var l=s.listener,f=s.ha||s.src;s.fa&&Li(s),s=l.call(f,c)}return s}function Mi(s){return s=s[Ni],s instanceof hr?s:null}var xi="__closure_events_fn_"+(1e9*Math.random()>>>0);function Do(s){return typeof s=="function"?s:(s[xi]||(s[xi]=function(c){return s.handleEvent(c)}),s[xi])}function fe(){Xe.call(this),this.i=new hr(this),this.M=this,this.F=null}b(fe,Xe),fe.prototype[ur]=!0,fe.prototype.removeEventListener=function(s,c,l,f){ko(this,s,c,l,f)};function Ee(s,c){var l,f=s.F;if(f)for(l=[];f;f=f.F)l.push(f);if(s=s.M,f=c.type||c,typeof c=="string")c=new de(c,s);else if(c instanceof de)c.target=c.target||s;else{var w=c;c=new de(f,s),v(c,w)}if(w=!0,l)for(var R=l.length-1;0<=R;R--){var k=c.g=l[R];w=dr(k,f,!0,c)&&w}if(k=c.g=s,w=dr(k,f,!0,c)&&w,w=dr(k,f,!1,c)&&w,l)for(R=0;R<l.length;R++)k=c.g=l[R],w=dr(k,f,!1,c)&&w}fe.prototype.N=function(){if(fe.aa.N.call(this),this.i){var s=this.i,c;for(c in s.g){for(var l=s.g[c],f=0;f<l.length;f++)lr(l[f]);delete s.g[c],s.h--}}this.F=null},fe.prototype.K=function(s,c,l,f){return this.i.add(String(s),c,!1,l,f)},fe.prototype.L=function(s,c,l,f){return this.i.add(String(s),c,!0,l,f)};function dr(s,c,l,f){if(c=s.i.g[String(c)],!c)return!0;c=c.concat();for(var w=!0,R=0;R<c.length;++R){var k=c[R];if(k&&!k.da&&k.capture==l){var Q=k.listener,ce=k.ha||k.src;k.fa&&Vi(s.i,k),w=Q.call(ce,f)!==!1&&w}}return w&&!f.defaultPrevented}function No(s,c,l){if(typeof s=="function")l&&(s=E(s,l));else if(s&&typeof s.handleEvent=="function")s=E(s.handleEvent,s);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(s,c||0)}function Oo(s){s.g=No(()=>{s.g=null,s.i&&(s.i=!1,Oo(s))},s.l);const c=s.h;s.h=null,s.m.apply(null,c)}class Vh extends Xe{constructor(c,l){super(),this.m=c,this.l=l,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Oo(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function yn(s){Xe.call(this),this.h=s,this.g={}}b(yn,Xe);var Lo=[];function Mo(s){te(s.g,function(c,l){this.g.hasOwnProperty(l)&&Li(c)},s),s.g={}}yn.prototype.N=function(){yn.aa.N.call(this),Mo(this)},yn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ui=u.JSON.stringify,Dh=u.JSON.parse,Nh=class{stringify(s){return u.JSON.stringify(s,void 0)}parse(s){return u.JSON.parse(s,void 0)}};function Fi(){}Fi.prototype.h=null;function xo(s){return s.h||(s.h=s.i())}function Uo(){}var vn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Bi(){de.call(this,"d")}b(Bi,de);function ji(){de.call(this,"c")}b(ji,de);var At={},Fo=null;function fr(){return Fo=Fo||new fe}At.La="serverreachability";function Bo(s){de.call(this,At.La,s)}b(Bo,de);function En(s){const c=fr();Ee(c,new Bo(c))}At.STAT_EVENT="statevent";function jo(s,c){de.call(this,At.STAT_EVENT,s),this.stat=c}b(jo,de);function Te(s){const c=fr();Ee(c,new jo(c,s))}At.Ma="timingevent";function $o(s,c){de.call(this,At.Ma,s),this.size=c}b($o,de);function Tn(s,c){if(typeof s!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){s()},c)}function In(){this.g=!0}In.prototype.xa=function(){this.g=!1};function Oh(s,c,l,f,w,R){s.info(function(){if(s.g)if(R)for(var k="",Q=R.split("&"),ce=0;ce<Q.length;ce++){var G=Q[ce].split("=");if(1<G.length){var pe=G[0];G=G[1];var me=pe.split("_");k=2<=me.length&&me[1]=="type"?k+(pe+"="+G+"&"):k+(pe+"=redacted&")}}else k=null;else k=R;return"XMLHTTP REQ ("+f+") [attempt "+w+"]: "+c+`
`+l+`
`+k})}function Lh(s,c,l,f,w,R,k){s.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+w+"]: "+c+`
`+l+`
`+R+" "+k})}function Ft(s,c,l,f){s.info(function(){return"XMLHTTP TEXT ("+c+"): "+xh(s,l)+(f?" "+f:"")})}function Mh(s,c){s.info(function(){return"TIMEOUT: "+c})}In.prototype.info=function(){};function xh(s,c){if(!s.g)return c;if(!c)return null;try{var l=JSON.parse(c);if(l){for(s=0;s<l.length;s++)if(Array.isArray(l[s])){var f=l[s];if(!(2>f.length)){var w=f[1];if(Array.isArray(w)&&!(1>w.length)){var R=w[0];if(R!="noop"&&R!="stop"&&R!="close")for(var k=1;k<w.length;k++)w[k]=""}}}}return Ui(l)}catch{return c}}var pr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},qo={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},$i;function mr(){}b(mr,Fi),mr.prototype.g=function(){return new XMLHttpRequest},mr.prototype.i=function(){return{}},$i=new mr;function Ze(s,c,l,f){this.j=s,this.i=c,this.l=l,this.R=f||1,this.U=new yn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new zo}function zo(){this.i=null,this.g="",this.h=!1}var Ho={},qi={};function zi(s,c,l){s.L=1,s.v=vr($e(c)),s.m=l,s.P=!0,Wo(s,null)}function Wo(s,c){s.F=Date.now(),gr(s),s.A=$e(s.v);var l=s.A,f=s.R;Array.isArray(f)||(f=[String(f)]),oa(l.i,"t",f),s.C=0,l=s.j.J,s.h=new zo,s.g=Aa(s.j,l?c:null,!s.m),0<s.O&&(s.M=new Vh(E(s.Y,s,s.g),s.O)),c=s.U,l=s.g,f=s.ca;var w="readystatechange";Array.isArray(w)||(w&&(Lo[0]=w.toString()),w=Lo);for(var R=0;R<w.length;R++){var k=bo(l,w[R],f||c.handleEvent,!1,c.h||c);if(!k)break;c.g[k.key]=k}c=s.H?m(s.H):{},s.m?(s.u||(s.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",s.g.ea(s.A,s.u,s.m,c)):(s.u="GET",s.g.ea(s.A,s.u,null,c)),En(),Oh(s.i,s.u,s.A,s.l,s.R,s.m)}Ze.prototype.ca=function(s){s=s.target;const c=this.M;c&&qe(s)==3?c.j():this.Y(s)},Ze.prototype.Y=function(s){try{if(s==this.g)e:{const me=qe(this.g);var c=this.g.Ba();const $t=this.g.Z();if(!(3>me)&&(me!=3||this.g&&(this.h.h||this.g.oa()||fa(this.g)))){this.J||me!=4||c==7||(c==8||0>=$t?En(3):En(2)),Hi(this);var l=this.g.Z();this.X=l;t:if(Go(this)){var f=fa(this.g);s="";var w=f.length,R=qe(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Rt(this),wn(this);var k="";break t}this.h.i=new u.TextDecoder}for(c=0;c<w;c++)this.h.h=!0,s+=this.h.i.decode(f[c],{stream:!(R&&c==w-1)});f.length=0,this.h.g+=s,this.C=0,k=this.h.g}else k=this.g.oa();if(this.o=l==200,Lh(this.i,this.u,this.A,this.l,this.R,me,l),this.o){if(this.T&&!this.K){t:{if(this.g){var Q,ce=this.g;if((Q=ce.g?ce.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(Q)){var G=Q;break t}}G=null}if(l=G)Ft(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Wi(this,l);else{this.o=!1,this.s=3,Te(12),Rt(this),wn(this);break e}}if(this.P){l=!0;let ke;for(;!this.J&&this.C<k.length;)if(ke=Uh(this,k),ke==qi){me==4&&(this.s=4,Te(14),l=!1),Ft(this.i,this.l,null,"[Incomplete Response]");break}else if(ke==Ho){this.s=4,Te(15),Ft(this.i,this.l,k,"[Invalid Chunk]"),l=!1;break}else Ft(this.i,this.l,ke,null),Wi(this,ke);if(Go(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),me!=4||k.length!=0||this.h.h||(this.s=1,Te(16),l=!1),this.o=this.o&&l,!l)Ft(this.i,this.l,k,"[Invalid Chunked Response]"),Rt(this),wn(this);else if(0<k.length&&!this.W){this.W=!0;var pe=this.j;pe.g==this&&pe.ba&&!pe.M&&(pe.j.info("Great, no buffering proxy detected. Bytes received: "+k.length),Xi(pe),pe.M=!0,Te(11))}}else Ft(this.i,this.l,k,null),Wi(this,k);me==4&&Rt(this),this.o&&!this.J&&(me==4?Ea(this.j,this):(this.o=!1,gr(this)))}else td(this.g),l==400&&0<k.indexOf("Unknown SID")?(this.s=3,Te(12)):(this.s=0,Te(13)),Rt(this),wn(this)}}}catch{}finally{}};function Go(s){return s.g?s.u=="GET"&&s.L!=2&&s.j.Ca:!1}function Uh(s,c){var l=s.C,f=c.indexOf(`
`,l);return f==-1?qi:(l=Number(c.substring(l,f)),isNaN(l)?Ho:(f+=1,f+l>c.length?qi:(c=c.slice(f,f+l),s.C=f+l,c)))}Ze.prototype.cancel=function(){this.J=!0,Rt(this)};function gr(s){s.S=Date.now()+s.I,Ko(s,s.I)}function Ko(s,c){if(s.B!=null)throw Error("WatchDog timer not null");s.B=Tn(E(s.ba,s),c)}function Hi(s){s.B&&(u.clearTimeout(s.B),s.B=null)}Ze.prototype.ba=function(){this.B=null;const s=Date.now();0<=s-this.S?(Mh(this.i,this.A),this.L!=2&&(En(),Te(17)),Rt(this),this.s=2,wn(this)):Ko(this,this.S-s)};function wn(s){s.j.G==0||s.J||Ea(s.j,s)}function Rt(s){Hi(s);var c=s.M;c&&typeof c.ma=="function"&&c.ma(),s.M=null,Mo(s.U),s.g&&(c=s.g,s.g=null,c.abort(),c.ma())}function Wi(s,c){try{var l=s.j;if(l.G!=0&&(l.g==s||Gi(l.h,s))){if(!s.K&&Gi(l.h,s)&&l.G==3){try{var f=l.Da.g.parse(c)}catch{f=null}if(Array.isArray(f)&&f.length==3){var w=f;if(w[0]==0){e:if(!l.u){if(l.g)if(l.g.F+3e3<s.F)Rr(l),wr(l);else break e;Yi(l),Te(18)}}else l.za=w[1],0<l.za-l.T&&37500>w[2]&&l.F&&l.v==0&&!l.C&&(l.C=Tn(E(l.Za,l),6e3));if(1>=Yo(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else St(l,11)}else if((s.K||l.g==s)&&Rr(l),!B(c))for(w=l.Da.g.parse(c),c=0;c<w.length;c++){let G=w[c];if(l.T=G[0],G=G[1],l.G==2)if(G[0]=="c"){l.K=G[1],l.ia=G[2];const pe=G[3];pe!=null&&(l.la=pe,l.j.info("VER="+l.la));const me=G[4];me!=null&&(l.Aa=me,l.j.info("SVER="+l.Aa));const $t=G[5];$t!=null&&typeof $t=="number"&&0<$t&&(f=1.5*$t,l.L=f,l.j.info("backChannelRequestTimeoutMs_="+f)),f=l;const ke=s.g;if(ke){const Sr=ke.g?ke.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Sr){var R=f.h;R.g||Sr.indexOf("spdy")==-1&&Sr.indexOf("quic")==-1&&Sr.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(Ki(R,R.h),R.h=null))}if(f.D){const Zi=ke.g?ke.g.getResponseHeader("X-HTTP-Session-Id"):null;Zi&&(f.ya=Zi,J(f.I,f.D,Zi))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-s.F,l.j.info("Handshake RTT: "+l.R+"ms")),f=l;var k=s;if(f.qa=wa(f,f.J?f.ia:null,f.W),k.K){Xo(f.h,k);var Q=k,ce=f.L;ce&&(Q.I=ce),Q.B&&(Hi(Q),gr(Q)),f.g=k}else ya(f);0<l.i.length&&Ar(l)}else G[0]!="stop"&&G[0]!="close"||St(l,7);else l.G==3&&(G[0]=="stop"||G[0]=="close"?G[0]=="stop"?St(l,7):Ji(l):G[0]!="noop"&&l.l&&l.l.ta(G),l.v=0)}}En(4)}catch{}}var Fh=class{constructor(s,c){this.g=s,this.map=c}};function Qo(s){this.l=s||10,u.PerformanceNavigationTiming?(s=u.performance.getEntriesByType("navigation"),s=0<s.length&&(s[0].nextHopProtocol=="hq"||s[0].nextHopProtocol=="h2")):s=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=s?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Jo(s){return s.h?!0:s.g?s.g.size>=s.j:!1}function Yo(s){return s.h?1:s.g?s.g.size:0}function Gi(s,c){return s.h?s.h==c:s.g?s.g.has(c):!1}function Ki(s,c){s.g?s.g.add(c):s.h=c}function Xo(s,c){s.h&&s.h==c?s.h=null:s.g&&s.g.has(c)&&s.g.delete(c)}Qo.prototype.cancel=function(){if(this.i=Zo(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const s of this.g.values())s.cancel();this.g.clear()}};function Zo(s){if(s.h!=null)return s.i.concat(s.h.D);if(s.g!=null&&s.g.size!==0){let c=s.i;for(const l of s.g.values())c=c.concat(l.D);return c}return N(s.i)}function Bh(s){if(s.V&&typeof s.V=="function")return s.V();if(typeof Map<"u"&&s instanceof Map||typeof Set<"u"&&s instanceof Set)return Array.from(s.values());if(typeof s=="string")return s.split("");if(h(s)){for(var c=[],l=s.length,f=0;f<l;f++)c.push(s[f]);return c}c=[],l=0;for(f in s)c[l++]=s[f];return c}function jh(s){if(s.na&&typeof s.na=="function")return s.na();if(!s.V||typeof s.V!="function"){if(typeof Map<"u"&&s instanceof Map)return Array.from(s.keys());if(!(typeof Set<"u"&&s instanceof Set)){if(h(s)||typeof s=="string"){var c=[];s=s.length;for(var l=0;l<s;l++)c.push(l);return c}c=[],l=0;for(const f in s)c[l++]=f;return c}}}function ea(s,c){if(s.forEach&&typeof s.forEach=="function")s.forEach(c,void 0);else if(h(s)||typeof s=="string")Array.prototype.forEach.call(s,c,void 0);else for(var l=jh(s),f=Bh(s),w=f.length,R=0;R<w;R++)c.call(void 0,f[R],l&&l[R],s)}var ta=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function $h(s,c){if(s){s=s.split("&");for(var l=0;l<s.length;l++){var f=s[l].indexOf("="),w=null;if(0<=f){var R=s[l].substring(0,f);w=s[l].substring(f+1)}else R=s[l];c(R,w?decodeURIComponent(w.replace(/\+/g," ")):"")}}}function Pt(s){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,s instanceof Pt){this.h=s.h,_r(this,s.j),this.o=s.o,this.g=s.g,yr(this,s.s),this.l=s.l;var c=s.i,l=new Pn;l.i=c.i,c.g&&(l.g=new Map(c.g),l.h=c.h),na(this,l),this.m=s.m}else s&&(c=String(s).match(ta))?(this.h=!1,_r(this,c[1]||"",!0),this.o=An(c[2]||""),this.g=An(c[3]||"",!0),yr(this,c[4]),this.l=An(c[5]||"",!0),na(this,c[6]||"",!0),this.m=An(c[7]||"")):(this.h=!1,this.i=new Pn(null,this.h))}Pt.prototype.toString=function(){var s=[],c=this.j;c&&s.push(Rn(c,ra,!0),":");var l=this.g;return(l||c=="file")&&(s.push("//"),(c=this.o)&&s.push(Rn(c,ra,!0),"@"),s.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&s.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&s.push("/"),s.push(Rn(l,l.charAt(0)=="/"?Hh:zh,!0))),(l=this.i.toString())&&s.push("?",l),(l=this.m)&&s.push("#",Rn(l,Gh)),s.join("")};function $e(s){return new Pt(s)}function _r(s,c,l){s.j=l?An(c,!0):c,s.j&&(s.j=s.j.replace(/:$/,""))}function yr(s,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);s.s=c}else s.s=null}function na(s,c,l){c instanceof Pn?(s.i=c,Kh(s.i,s.h)):(l||(c=Rn(c,Wh)),s.i=new Pn(c,s.h))}function J(s,c,l){s.i.set(c,l)}function vr(s){return J(s,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),s}function An(s,c){return s?c?decodeURI(s.replace(/%25/g,"%2525")):decodeURIComponent(s):""}function Rn(s,c,l){return typeof s=="string"?(s=encodeURI(s).replace(c,qh),l&&(s=s.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s):null}function qh(s){return s=s.charCodeAt(0),"%"+(s>>4&15).toString(16)+(s&15).toString(16)}var ra=/[#\/\?@]/g,zh=/[#\?:]/g,Hh=/[#\?]/g,Wh=/[#\?@]/g,Gh=/#/g;function Pn(s,c){this.h=this.g=null,this.i=s||null,this.j=!!c}function et(s){s.g||(s.g=new Map,s.h=0,s.i&&$h(s.i,function(c,l){s.add(decodeURIComponent(c.replace(/\+/g," ")),l)}))}n=Pn.prototype,n.add=function(s,c){et(this),this.i=null,s=Bt(this,s);var l=this.g.get(s);return l||this.g.set(s,l=[]),l.push(c),this.h+=1,this};function ia(s,c){et(s),c=Bt(s,c),s.g.has(c)&&(s.i=null,s.h-=s.g.get(c).length,s.g.delete(c))}function sa(s,c){return et(s),c=Bt(s,c),s.g.has(c)}n.forEach=function(s,c){et(this),this.g.forEach(function(l,f){l.forEach(function(w){s.call(c,w,f,this)},this)},this)},n.na=function(){et(this);const s=Array.from(this.g.values()),c=Array.from(this.g.keys()),l=[];for(let f=0;f<c.length;f++){const w=s[f];for(let R=0;R<w.length;R++)l.push(c[f])}return l},n.V=function(s){et(this);let c=[];if(typeof s=="string")sa(this,s)&&(c=c.concat(this.g.get(Bt(this,s))));else{s=Array.from(this.g.values());for(let l=0;l<s.length;l++)c=c.concat(s[l])}return c},n.set=function(s,c){return et(this),this.i=null,s=Bt(this,s),sa(this,s)&&(this.h-=this.g.get(s).length),this.g.set(s,[c]),this.h+=1,this},n.get=function(s,c){return s?(s=this.V(s),0<s.length?String(s[0]):c):c};function oa(s,c,l){ia(s,c),0<l.length&&(s.i=null,s.g.set(Bt(s,c),N(l)),s.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const s=[],c=Array.from(this.g.keys());for(var l=0;l<c.length;l++){var f=c[l];const R=encodeURIComponent(String(f)),k=this.V(f);for(f=0;f<k.length;f++){var w=R;k[f]!==""&&(w+="="+encodeURIComponent(String(k[f]))),s.push(w)}}return this.i=s.join("&")};function Bt(s,c){return c=String(c),s.j&&(c=c.toLowerCase()),c}function Kh(s,c){c&&!s.j&&(et(s),s.i=null,s.g.forEach(function(l,f){var w=f.toLowerCase();f!=w&&(ia(this,f),oa(this,w,l))},s)),s.j=c}function Qh(s,c){const l=new In;if(u.Image){const f=new Image;f.onload=S(tt,l,"TestLoadImage: loaded",!0,c,f),f.onerror=S(tt,l,"TestLoadImage: error",!1,c,f),f.onabort=S(tt,l,"TestLoadImage: abort",!1,c,f),f.ontimeout=S(tt,l,"TestLoadImage: timeout",!1,c,f),u.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=s}else c(!1)}function Jh(s,c){const l=new In,f=new AbortController,w=setTimeout(()=>{f.abort(),tt(l,"TestPingServer: timeout",!1,c)},1e4);fetch(s,{signal:f.signal}).then(R=>{clearTimeout(w),R.ok?tt(l,"TestPingServer: ok",!0,c):tt(l,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(w),tt(l,"TestPingServer: error",!1,c)})}function tt(s,c,l,f,w){try{w&&(w.onload=null,w.onerror=null,w.onabort=null,w.ontimeout=null),f(l)}catch{}}function Yh(){this.g=new Nh}function Xh(s,c,l){const f=l||"";try{ea(s,function(w,R){let k=w;d(w)&&(k=Ui(w)),c.push(f+R+"="+encodeURIComponent(k))})}catch(w){throw c.push(f+"type="+encodeURIComponent("_badmap")),w}}function Er(s){this.l=s.Ub||null,this.j=s.eb||!1}b(Er,Fi),Er.prototype.g=function(){return new Tr(this.l,this.j)},Er.prototype.i=function(s){return function(){return s}}({});function Tr(s,c){fe.call(this),this.D=s,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}b(Tr,fe),n=Tr.prototype,n.open=function(s,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=s,this.A=c,this.readyState=1,Cn(this)},n.send=function(s){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};s&&(c.body=s),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Sn(this)),this.readyState=0},n.Sa=function(s){if(this.g&&(this.l=s,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=s.headers,this.readyState=2,Cn(this)),this.g&&(this.readyState=3,Cn(this),this.g)))if(this.responseType==="arraybuffer")s.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in s){if(this.j=s.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;aa(this)}else s.text().then(this.Ra.bind(this),this.ga.bind(this))};function aa(s){s.j.read().then(s.Pa.bind(s)).catch(s.ga.bind(s))}n.Pa=function(s){if(this.g){if(this.o&&s.value)this.response.push(s.value);else if(!this.o){var c=s.value?s.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!s.done}))&&(this.response=this.responseText+=c)}s.done?Sn(this):Cn(this),this.readyState==3&&aa(this)}},n.Ra=function(s){this.g&&(this.response=this.responseText=s,Sn(this))},n.Qa=function(s){this.g&&(this.response=s,Sn(this))},n.ga=function(){this.g&&Sn(this)};function Sn(s){s.readyState=4,s.l=null,s.j=null,s.v=null,Cn(s)}n.setRequestHeader=function(s,c){this.u.append(s,c)},n.getResponseHeader=function(s){return this.h&&this.h.get(s.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const s=[],c=this.h.entries();for(var l=c.next();!l.done;)l=l.value,s.push(l[0]+": "+l[1]),l=c.next();return s.join(`\r
`)};function Cn(s){s.onreadystatechange&&s.onreadystatechange.call(s)}Object.defineProperty(Tr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(s){this.m=s?"include":"same-origin"}});function ca(s){let c="";return te(s,function(l,f){c+=f,c+=":",c+=l,c+=`\r
`}),c}function Qi(s,c,l){e:{for(f in l){var f=!1;break e}f=!0}f||(l=ca(l),typeof s=="string"?l!=null&&encodeURIComponent(String(l)):J(s,c,l))}function Z(s){fe.call(this),this.headers=new Map,this.o=s||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}b(Z,fe);var Zh=/^https?$/i,ed=["POST","PUT"];n=Z.prototype,n.Ha=function(s){this.J=s},n.ea=function(s,c,l,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+s);c=c?c.toUpperCase():"GET",this.D=s,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():$i.g(),this.v=this.o?xo(this.o):xo($i),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(c,String(s),!0),this.B=!1}catch(R){ua(this,R);return}if(s=l||"",l=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var w in f)l.set(w,f[w]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const R of f.keys())l.set(R,f.get(R));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(l.keys()).find(R=>R.toLowerCase()=="content-type"),w=u.FormData&&s instanceof u.FormData,!(0<=Array.prototype.indexOf.call(ed,c,void 0))||f||w||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,k]of l)this.g.setRequestHeader(R,k);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{da(this),this.u=!0,this.g.send(s),this.u=!1}catch(R){ua(this,R)}};function ua(s,c){s.h=!1,s.g&&(s.j=!0,s.g.abort(),s.j=!1),s.l=c,s.m=5,la(s),Ir(s)}function la(s){s.A||(s.A=!0,Ee(s,"complete"),Ee(s,"error"))}n.abort=function(s){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=s||7,Ee(this,"complete"),Ee(this,"abort"),Ir(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ir(this,!0)),Z.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?ha(this):this.bb())},n.bb=function(){ha(this)};function ha(s){if(s.h&&typeof a<"u"&&(!s.v[1]||qe(s)!=4||s.Z()!=2)){if(s.u&&qe(s)==4)No(s.Ea,0,s);else if(Ee(s,"readystatechange"),qe(s)==4){s.h=!1;try{const k=s.Z();e:switch(k){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var l;if(!(l=c)){var f;if(f=k===0){var w=String(s.D).match(ta)[1]||null;!w&&u.self&&u.self.location&&(w=u.self.location.protocol.slice(0,-1)),f=!Zh.test(w?w.toLowerCase():"")}l=f}if(l)Ee(s,"complete"),Ee(s,"success");else{s.m=6;try{var R=2<qe(s)?s.g.statusText:""}catch{R=""}s.l=R+" ["+s.Z()+"]",la(s)}}finally{Ir(s)}}}}function Ir(s,c){if(s.g){da(s);const l=s.g,f=s.v[0]?()=>{}:null;s.g=null,s.v=null,c||Ee(s,"ready");try{l.onreadystatechange=f}catch{}}}function da(s){s.I&&(u.clearTimeout(s.I),s.I=null)}n.isActive=function(){return!!this.g};function qe(s){return s.g?s.g.readyState:0}n.Z=function(){try{return 2<qe(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(s){if(this.g){var c=this.g.responseText;return s&&c.indexOf(s)==0&&(c=c.substring(s.length)),Dh(c)}};function fa(s){try{if(!s.g)return null;if("response"in s.g)return s.g.response;switch(s.H){case"":case"text":return s.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in s.g)return s.g.mozResponseArrayBuffer}return null}catch{return null}}function td(s){const c={};s=(s.g&&2<=qe(s)&&s.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<s.length;f++){if(B(s[f]))continue;var l=I(s[f]);const w=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const R=c[w]||[];c[w]=R,R.push(l)}T(c,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function bn(s,c,l){return l&&l.internalChannelParams&&l.internalChannelParams[s]||c}function pa(s){this.Aa=0,this.i=[],this.j=new In,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=bn("failFast",!1,s),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=bn("baseRetryDelayMs",5e3,s),this.cb=bn("retryDelaySeedMs",1e4,s),this.Wa=bn("forwardChannelMaxRetries",2,s),this.wa=bn("forwardChannelRequestTimeoutMs",2e4,s),this.pa=s&&s.xmlHttpFactory||void 0,this.Xa=s&&s.Tb||void 0,this.Ca=s&&s.useFetchStreams||!1,this.L=void 0,this.J=s&&s.supportsCrossDomainXhr||!1,this.K="",this.h=new Qo(s&&s.concurrentRequestLimit),this.Da=new Yh,this.P=s&&s.fastHandshake||!1,this.O=s&&s.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=s&&s.Rb||!1,s&&s.xa&&this.j.xa(),s&&s.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&s&&s.detectBufferingProxy||!1,this.ja=void 0,s&&s.longPollingTimeout&&0<s.longPollingTimeout&&(this.ja=s.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=pa.prototype,n.la=8,n.G=1,n.connect=function(s,c,l,f){Te(0),this.W=s,this.H=c||{},l&&f!==void 0&&(this.H.OSID=l,this.H.OAID=f),this.F=this.X,this.I=wa(this,null,this.W),Ar(this)};function Ji(s){if(ma(s),s.G==3){var c=s.U++,l=$e(s.I);if(J(l,"SID",s.K),J(l,"RID",c),J(l,"TYPE","terminate"),kn(s,l),c=new Ze(s,s.j,c),c.L=2,c.v=vr($e(l)),l=!1,u.navigator&&u.navigator.sendBeacon)try{l=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!l&&u.Image&&(new Image().src=c.v,l=!0),l||(c.g=Aa(c.j,null),c.g.ea(c.v)),c.F=Date.now(),gr(c)}Ia(s)}function wr(s){s.g&&(Xi(s),s.g.cancel(),s.g=null)}function ma(s){wr(s),s.u&&(u.clearTimeout(s.u),s.u=null),Rr(s),s.h.cancel(),s.s&&(typeof s.s=="number"&&u.clearTimeout(s.s),s.s=null)}function Ar(s){if(!Jo(s.h)&&!s.s){s.s=!0;var c=s.Ga;mn||Co(),gn||(mn(),gn=!0),ki.add(c,s),s.B=0}}function nd(s,c){return Yo(s.h)>=s.h.j-(s.s?1:0)?!1:s.s?(s.i=c.D.concat(s.i),!0):s.G==1||s.G==2||s.B>=(s.Va?0:s.Wa)?!1:(s.s=Tn(E(s.Ga,s,c),Ta(s,s.B)),s.B++,!0)}n.Ga=function(s){if(this.s)if(this.s=null,this.G==1){if(!s){this.U=Math.floor(1e5*Math.random()),s=this.U++;const w=new Ze(this,this.j,s);let R=this.o;if(this.S&&(R?(R=m(R),v(R,this.S)):R=this.S),this.m!==null||this.O||(w.H=R,R=null),this.P)e:{for(var c=0,l=0;l<this.i.length;l++){t:{var f=this.i[l];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(c+=f,4096<c){c=l;break e}if(c===4096||l===this.i.length-1){c=l+1;break e}}c=1e3}else c=1e3;c=_a(this,w,c),l=$e(this.I),J(l,"RID",s),J(l,"CVER",22),this.D&&J(l,"X-HTTP-Session-Id",this.D),kn(this,l),R&&(this.O?c="headers="+encodeURIComponent(String(ca(R)))+"&"+c:this.m&&Qi(l,this.m,R)),Ki(this.h,w),this.Ua&&J(l,"TYPE","init"),this.P?(J(l,"$req",c),J(l,"SID","null"),w.T=!0,zi(w,l,null)):zi(w,l,c),this.G=2}}else this.G==3&&(s?ga(this,s):this.i.length==0||Jo(this.h)||ga(this))};function ga(s,c){var l;c?l=c.l:l=s.U++;const f=$e(s.I);J(f,"SID",s.K),J(f,"RID",l),J(f,"AID",s.T),kn(s,f),s.m&&s.o&&Qi(f,s.m,s.o),l=new Ze(s,s.j,l,s.B+1),s.m===null&&(l.H=s.o),c&&(s.i=c.D.concat(s.i)),c=_a(s,l,1e3),l.I=Math.round(.5*s.wa)+Math.round(.5*s.wa*Math.random()),Ki(s.h,l),zi(l,f,c)}function kn(s,c){s.H&&te(s.H,function(l,f){J(c,f,l)}),s.l&&ea({},function(l,f){J(c,f,l)})}function _a(s,c,l){l=Math.min(s.i.length,l);var f=s.l?E(s.l.Na,s.l,s):null;e:{var w=s.i;let R=-1;for(;;){const k=["count="+l];R==-1?0<l?(R=w[0].g,k.push("ofs="+R)):R=0:k.push("ofs="+R);let Q=!0;for(let ce=0;ce<l;ce++){let G=w[ce].g;const pe=w[ce].map;if(G-=R,0>G)R=Math.max(0,w[ce].g-100),Q=!1;else try{Xh(pe,k,"req"+G+"_")}catch{f&&f(pe)}}if(Q){f=k.join("&");break e}}}return s=s.i.splice(0,l),c.D=s,f}function ya(s){if(!s.g&&!s.u){s.Y=1;var c=s.Fa;mn||Co(),gn||(mn(),gn=!0),ki.add(c,s),s.v=0}}function Yi(s){return s.g||s.u||3<=s.v?!1:(s.Y++,s.u=Tn(E(s.Fa,s),Ta(s,s.v)),s.v++,!0)}n.Fa=function(){if(this.u=null,va(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var s=2*this.R;this.j.info("BP detection timer enabled: "+s),this.A=Tn(E(this.ab,this),s)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Te(10),wr(this),va(this))};function Xi(s){s.A!=null&&(u.clearTimeout(s.A),s.A=null)}function va(s){s.g=new Ze(s,s.j,"rpc",s.Y),s.m===null&&(s.g.H=s.o),s.g.O=0;var c=$e(s.qa);J(c,"RID","rpc"),J(c,"SID",s.K),J(c,"AID",s.T),J(c,"CI",s.F?"0":"1"),!s.F&&s.ja&&J(c,"TO",s.ja),J(c,"TYPE","xmlhttp"),kn(s,c),s.m&&s.o&&Qi(c,s.m,s.o),s.L&&(s.g.I=s.L);var l=s.g;s=s.ia,l.L=1,l.v=vr($e(c)),l.m=null,l.P=!0,Wo(l,s)}n.Za=function(){this.C!=null&&(this.C=null,wr(this),Yi(this),Te(19))};function Rr(s){s.C!=null&&(u.clearTimeout(s.C),s.C=null)}function Ea(s,c){var l=null;if(s.g==c){Rr(s),Xi(s),s.g=null;var f=2}else if(Gi(s.h,c))l=c.D,Xo(s.h,c),f=1;else return;if(s.G!=0){if(c.o)if(f==1){l=c.m?c.m.length:0,c=Date.now()-c.F;var w=s.B;f=fr(),Ee(f,new $o(f,l)),Ar(s)}else ya(s);else if(w=c.s,w==3||w==0&&0<c.X||!(f==1&&nd(s,c)||f==2&&Yi(s)))switch(l&&0<l.length&&(c=s.h,c.i=c.i.concat(l)),w){case 1:St(s,5);break;case 4:St(s,10);break;case 3:St(s,6);break;default:St(s,2)}}}function Ta(s,c){let l=s.Ta+Math.floor(Math.random()*s.cb);return s.isActive()||(l*=2),l*c}function St(s,c){if(s.j.info("Error code "+c),c==2){var l=E(s.fb,s),f=s.Xa;const w=!f;f=new Pt(f||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||_r(f,"https"),vr(f),w?Qh(f.toString(),l):Jh(f.toString(),l)}else Te(2);s.G=0,s.l&&s.l.sa(c),Ia(s),ma(s)}n.fb=function(s){s?(this.j.info("Successfully pinged google.com"),Te(2)):(this.j.info("Failed to ping google.com"),Te(1))};function Ia(s){if(s.G=0,s.ka=[],s.l){const c=Zo(s.h);(c.length!=0||s.i.length!=0)&&(V(s.ka,c),V(s.ka,s.i),s.h.i.length=0,N(s.i),s.i.length=0),s.l.ra()}}function wa(s,c,l){var f=l instanceof Pt?$e(l):new Pt(l);if(f.g!="")c&&(f.g=c+"."+f.g),yr(f,f.s);else{var w=u.location;f=w.protocol,c=c?c+"."+w.hostname:w.hostname,w=+w.port;var R=new Pt(null);f&&_r(R,f),c&&(R.g=c),w&&yr(R,w),l&&(R.l=l),f=R}return l=s.D,c=s.ya,l&&c&&J(f,l,c),J(f,"VER",s.la),kn(s,f),f}function Aa(s,c,l){if(c&&!s.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=s.Ca&&!s.pa?new Z(new Er({eb:l})):new Z(s.pa),c.Ha(s.J),c}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ra(){}n=Ra.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Pr(){}Pr.prototype.g=function(s,c){return new Re(s,c)};function Re(s,c){fe.call(this),this.g=new pa(c),this.l=s,this.h=c&&c.messageUrlParams||null,s=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(s?s["X-Client-Protocol"]="webchannel":s={"X-Client-Protocol":"webchannel"}),this.g.o=s,s=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(s?s["X-WebChannel-Content-Type"]=c.messageContentType:s={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(s?s["X-WebChannel-Client-Profile"]=c.va:s={"X-WebChannel-Client-Profile":c.va}),this.g.S=s,(s=c&&c.Sb)&&!B(s)&&(this.g.m=s),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!B(c)&&(this.g.D=c,s=this.h,s!==null&&c in s&&(s=this.h,c in s&&delete s[c])),this.j=new jt(this)}b(Re,fe),Re.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Re.prototype.close=function(){Ji(this.g)},Re.prototype.o=function(s){var c=this.g;if(typeof s=="string"){var l={};l.__data__=s,s=l}else this.u&&(l={},l.__data__=Ui(s),s=l);c.i.push(new Fh(c.Ya++,s)),c.G==3&&Ar(c)},Re.prototype.N=function(){this.g.l=null,delete this.j,Ji(this.g),delete this.g,Re.aa.N.call(this)};function Pa(s){Bi.call(this),s.__headers__&&(this.headers=s.__headers__,this.statusCode=s.__status__,delete s.__headers__,delete s.__status__);var c=s.__sm__;if(c){e:{for(const l in c){s=l;break e}s=void 0}(this.i=s)&&(s=this.i,c=c!==null&&s in c?c[s]:void 0),this.data=c}else this.data=s}b(Pa,Bi);function Sa(){ji.call(this),this.status=1}b(Sa,ji);function jt(s){this.g=s}b(jt,Ra),jt.prototype.ua=function(){Ee(this.g,"a")},jt.prototype.ta=function(s){Ee(this.g,new Pa(s))},jt.prototype.sa=function(s){Ee(this.g,new Sa)},jt.prototype.ra=function(){Ee(this.g,"b")},Pr.prototype.createWebChannel=Pr.prototype.g,Re.prototype.send=Re.prototype.o,Re.prototype.open=Re.prototype.m,Re.prototype.close=Re.prototype.close,yu=function(){return new Pr},_u=function(){return fr()},gu=At,gs={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},pr.NO_ERROR=0,pr.TIMEOUT=8,pr.HTTP_ERROR=6,Or=pr,qo.COMPLETE="complete",mu=qo,Uo.EventType=vn,vn.OPEN="a",vn.CLOSE="b",vn.ERROR="c",vn.MESSAGE="d",fe.prototype.listen=fe.prototype.K,Nn=Uo,Z.prototype.listenOnce=Z.prototype.L,Z.prototype.getLastError=Z.prototype.Ka,Z.prototype.getLastErrorCode=Z.prototype.Ba,Z.prototype.getStatus=Z.prototype.Z,Z.prototype.getResponseJson=Z.prototype.Oa,Z.prototype.getResponseText=Z.prototype.oa,Z.prototype.send=Z.prototype.ea,Z.prototype.setWithCredentials=Z.prototype.Ha,pu=Z}).apply(typeof Cr<"u"?Cr:typeof self<"u"?self:typeof window<"u"?window:{});const Ba="@firebase/firestore",ja="4.7.16";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}_e.UNAUTHENTICATED=new _e(null),_e.GOOGLE_CREDENTIALS=new _e("google-credentials-uid"),_e.FIRST_PARTY=new _e("first-party-uid"),_e.MOCK_USER=new _e("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let un="11.8.1";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt=new xs("@firebase/firestore");function qt(){return Vt.logLevel}function D(n,...e){if(Vt.logLevel<=q.DEBUG){const t=e.map(Bs);Vt.debug(`Firestore (${un}): ${n}`,...t)}}function Ke(n,...e){if(Vt.logLevel<=q.ERROR){const t=e.map(Bs);Vt.error(`Firestore (${un}): ${n}`,...t)}}function Zt(n,...e){if(Vt.logLevel<=q.WARN){const t=e.map(Bs);Vt.warn(`Firestore (${un}): ${n}`,...t)}}function Bs(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,vu(n,r,t)}function vu(n,e,t){let r=`FIRESTORE (${un}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ke(r),new Error(r)}function K(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||vu(e,i,r)}function F(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends Ye{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class $f{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(_e.UNAUTHENTICATED))}shutdown(){}}class qf{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class zf{constructor(e){this.t=e,this.currentUser=_e.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){K(this.o===void 0,42304);let r=this.i;const i=h=>this.i!==r?(r=this.i,t(h)):Promise.resolve();let o=new dt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new dt,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const h=o;e.enqueueRetryable(async()=>{await h.promise,await i(this.currentUser)})},u=h=>{D("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(h=>u(h)),setTimeout(()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?u(h):(D("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new dt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(D("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(K(typeof r.accessToken=="string",31837,{l:r}),new Eu(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return K(e===null||typeof e=="string",2055,{h:e}),new _e(e)}}class Hf{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=_e.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Wf{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Hf(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(_e.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class $a{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Gf{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,be(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){K(this.o===void 0,3512);const r=o=>{o.error!=null&&D("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.m;return this.m=o.token,D("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>r(o))};const i=o=>{D("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(o=>i(o)),setTimeout(()=>{if(!this.appCheck){const o=this.V.getImmediate({optional:!0});o?i(o):D("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new $a(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(K(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new $a(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kf(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tu(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iu{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=Kf(40);for(let o=0;o<i.length;++o)r.length<20&&i[o]<t&&(r+=e.charAt(i[o]%62))}return r}}function j(n,e){return n<e?-1:n>e?1:0}function _s(n,e){let t=0;for(;t<n.length&&t<e.length;){const r=n.codePointAt(t),i=e.codePointAt(t);if(r!==i){if(r<128&&i<128)return j(r,i);{const o=Tu(),a=Qf(o.encode(qa(n,t)),o.encode(qa(e,t)));return a!==0?a:j(r,i)}}t+=r>65535?2:1}return j(n.length,e.length)}function qa(n,e){return n.codePointAt(e)>65535?n.substring(e,e+2):n.substring(e,e+1)}function Qf(n,e){for(let t=0;t<n.length&&t<e.length;++t)if(n[t]!==e[t])return j(n[t],e[t]);return j(n.length,e.length)}function en(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const za=-62135596800,Ha=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Ha);return new se(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<za)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ha}_compareTo(e){return this.seconds===e.seconds?j(this.nanoseconds,e.nanoseconds):j(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds-za;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{static fromTimestamp(e){return new U(e)}static min(){return new U(new se(0,0))}static max(){return new U(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa="__name__";class Ne{constructor(e,t,r){t===void 0?t=0:t>e.length&&x(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&x(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Ne.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Ne?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const o=Ne.compareSegments(e.get(i),t.get(i));if(o!==0)return o}return j(e.length,t.length)}static compareSegments(e,t){const r=Ne.isNumericId(e),i=Ne.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?Ne.extractNumericId(e).compare(Ne.extractNumericId(t)):_s(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return ht.fromString(e.substring(4,e.length-2))}}class ee extends Ne{construct(e,t,r){return new ee(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new O(C.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new ee(t)}static emptyPath(){return new ee([])}}const Jf=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class le extends Ne{construct(e,t,r){return new le(e,t,r)}static isValidIdentifier(e){return Jf.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),le.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Wa}static keyField(){return new le([Wa])}static fromServerFormat(e){const t=[];let r="",i=0;const o=()=>{if(r.length===0)throw new O(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const u=e[i];if(u==="\\"){if(i+1===e.length)throw new O(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const h=e[i+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new O(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=h,i+=2}else u==="`"?(a=!a,i++):u!=="."||a?(r+=u,i++):(o(),i++)}if(o(),a)throw new O(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new le(t)}static emptyPath(){return new le([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.path=e}static fromPath(e){return new L(ee.fromString(e))}static fromName(e){return new L(ee.fromString(e).popFirst(5))}static empty(){return new L(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new L(new ee(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qn=-1;function Yf(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=U.fromTimestamp(r===1e9?new se(t+1,0):new se(t,r));return new pt(i,L.empty(),e)}function Xf(n){return new pt(n.readTime,n.key,qn)}class pt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new pt(U.min(),L.empty(),qn)}static max(){return new pt(U.max(),L.empty(),qn)}}function Zf(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:j(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ep="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class tp{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ln(n){if(n.code!==C.FAILED_PRECONDITION||n.message!==ep)throw n;D("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&x(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P((r,i)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(r,i)},this.catchCallback=o=>{this.wrapFailure(t,o).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):P.reject(t)}static resolve(e){return new P((t,r)=>{t(e)})}static reject(e){return new P((t,r)=>{r(e)})}static waitFor(e){return new P((t,r)=>{let i=0,o=0,a=!1;e.forEach(u=>{++i,u.next(()=>{++o,a&&o===i&&t()},h=>r(h))}),a=!0,o===i&&t()})}static or(e){let t=P.resolve(!1);for(const r of e)t=t.next(i=>i?P.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,o)=>{r.push(t.call(this,i,o))}),this.waitFor(r)}static mapArray(e,t){return new P((r,i)=>{const o=e.length,a=new Array(o);let u=0;for(let h=0;h<o;h++){const d=h;t(e[d]).next(p=>{a[d]=p,++u,u===o&&r(a)},p=>i(p))}})}static doWhile(e,t){return new P((r,i)=>{const o=()=>{e()===!0?t().next(()=>{o()},i):r()};o()})}}function np(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function hn(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ue(r),this.ce=r=>t.writeSequenceNumber(r))}ue(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ce&&this.ce(e),e}}li.le=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js=-1;function hi(n){return n==null}function Hr(n){return n===0&&1/n==-1/0}function rp(n){return typeof n=="number"&&Number.isInteger(n)&&!Hr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wu="";function ip(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Ga(e)),e=sp(n.get(t),e);return Ga(e)}function sp(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const o=n.charAt(i);switch(o){case"\0":t+="";break;case wu:t+="";break;default:t+=o}}return t}function Ga(n){return n+wu+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ka(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Et(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Au(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e,t){this.comparator=e,this.root=t||ue.EMPTY}insert(e,t){return new X(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ue.BLACK,null,null))}remove(e){return new X(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ue.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new br(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new br(this.root,e,this.comparator,!1)}getReverseIterator(){return new br(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new br(this.root,e,this.comparator,!0)}}class br{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?r(e.key,t):1,t&&i&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ue{constructor(e,t,r,i,o){this.key=e,this.value=t,this.color=r??ue.RED,this.left=i??ue.EMPTY,this.right=o??ue.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,o){return new ue(e??this.key,t??this.value,r??this.color,i??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const o=r(e,i.key);return i=o<0?i.copy(null,null,null,i.left.insert(e,t,r),null):o===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return ue.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return ue.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ue.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ue.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw x(43730,{key:this.key,value:this.value});if(this.right.isRed())throw x(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw x(27949);return e+(this.isRed()?0:1)}}ue.EMPTY=null,ue.RED=!0,ue.BLACK=!1;ue.EMPTY=new class{constructor(){this.size=0}get key(){throw x(57766)}get value(){throw x(16141)}get color(){throw x(16727)}get left(){throw x(29726)}get right(){throw x(36894)}copy(e,t,r,i,o){return this}insert(e,t,r){return new ue(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e){this.comparator=e,this.data=new X(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Qa(this.data.getIterator())}getIteratorFrom(e){return new Qa(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof oe)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,o=r.getNext().key;if(this.comparator(i,o)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new oe(this.comparator);return t.data=e,t}}class Qa{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe{constructor(e){this.fields=e,e.sort(le.comparator)}static empty(){return new Pe([])}unionWith(e){let t=new oe(le.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Pe(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return en(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ru extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new Ru("Invalid base64 string: "+o):o}}(e);return new he(t)}static fromUint8Array(e){const t=function(i){let o="";for(let a=0;a<i.length;++a)o+=String.fromCharCode(i[a]);return o}(e);return new he(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return j(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}he.EMPTY_BYTE_STRING=new he("");const op=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function mt(n){if(K(!!n,39018),typeof n=="string"){let e=0;const t=op.exec(n);if(K(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ne(n.seconds),nanos:ne(n.nanos)}}function ne(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function gt(n){return typeof n=="string"?he.fromBase64String(n):he.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pu="server_timestamp",Su="__type__",Cu="__previous_value__",bu="__local_write_time__";function $s(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[Su])===null||t===void 0?void 0:t.stringValue)===Pu}function di(n){const e=n.mapValue.fields[Cu];return $s(e)?di(e):e}function zn(n){const e=mt(n.mapValue.fields[bu].timestampValue);return new se(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ap{constructor(e,t,r,i,o,a,u,h,d,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=h,this.useFetchStreams=d,this.isUsingEmulator=p}}const Wr="(default)";class Hn{constructor(e,t){this.projectId=e,this.database=t||Wr}static empty(){return new Hn("","")}get isDefaultDatabase(){return this.database===Wr}isEqual(e){return e instanceof Hn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ku="__type__",cp="__max__",kr={mapValue:{}},Vu="__vector__",Gr="value";function _t(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?$s(n)?4:lp(n)?9007199254740991:up(n)?10:11:x(28295,{value:n})}function Fe(n,e){if(n===e)return!0;const t=_t(n);if(t!==_t(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return zn(n).isEqual(zn(e));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const a=mt(i.timestampValue),u=mt(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,o){return gt(i.bytesValue).isEqual(gt(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,o){return ne(i.geoPointValue.latitude)===ne(o.geoPointValue.latitude)&&ne(i.geoPointValue.longitude)===ne(o.geoPointValue.longitude)}(n,e);case 2:return function(i,o){if("integerValue"in i&&"integerValue"in o)return ne(i.integerValue)===ne(o.integerValue);if("doubleValue"in i&&"doubleValue"in o){const a=ne(i.doubleValue),u=ne(o.doubleValue);return a===u?Hr(a)===Hr(u):isNaN(a)&&isNaN(u)}return!1}(n,e);case 9:return en(n.arrayValue.values||[],e.arrayValue.values||[],Fe);case 10:case 11:return function(i,o){const a=i.mapValue.fields||{},u=o.mapValue.fields||{};if(Ka(a)!==Ka(u))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(u[h]===void 0||!Fe(a[h],u[h])))return!1;return!0}(n,e);default:return x(52216,{left:n})}}function Wn(n,e){return(n.values||[]).find(t=>Fe(t,e))!==void 0}function tn(n,e){if(n===e)return 0;const t=_t(n),r=_t(e);if(t!==r)return j(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return j(n.booleanValue,e.booleanValue);case 2:return function(o,a){const u=ne(o.integerValue||o.doubleValue),h=ne(a.integerValue||a.doubleValue);return u<h?-1:u>h?1:u===h?0:isNaN(u)?isNaN(h)?0:-1:1}(n,e);case 3:return Ja(n.timestampValue,e.timestampValue);case 4:return Ja(zn(n),zn(e));case 5:return _s(n.stringValue,e.stringValue);case 6:return function(o,a){const u=gt(o),h=gt(a);return u.compareTo(h)}(n.bytesValue,e.bytesValue);case 7:return function(o,a){const u=o.split("/"),h=a.split("/");for(let d=0;d<u.length&&d<h.length;d++){const p=j(u[d],h[d]);if(p!==0)return p}return j(u.length,h.length)}(n.referenceValue,e.referenceValue);case 8:return function(o,a){const u=j(ne(o.latitude),ne(a.latitude));return u!==0?u:j(ne(o.longitude),ne(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Ya(n.arrayValue,e.arrayValue);case 10:return function(o,a){var u,h,d,p;const y=o.fields||{},E=a.fields||{},S=(u=y[Gr])===null||u===void 0?void 0:u.arrayValue,b=(h=E[Gr])===null||h===void 0?void 0:h.arrayValue,N=j(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((p=b==null?void 0:b.values)===null||p===void 0?void 0:p.length)||0);return N!==0?N:Ya(S,b)}(n.mapValue,e.mapValue);case 11:return function(o,a){if(o===kr.mapValue&&a===kr.mapValue)return 0;if(o===kr.mapValue)return 1;if(a===kr.mapValue)return-1;const u=o.fields||{},h=Object.keys(u),d=a.fields||{},p=Object.keys(d);h.sort(),p.sort();for(let y=0;y<h.length&&y<p.length;++y){const E=_s(h[y],p[y]);if(E!==0)return E;const S=tn(u[h[y]],d[p[y]]);if(S!==0)return S}return j(h.length,p.length)}(n.mapValue,e.mapValue);default:throw x(23264,{Pe:t})}}function Ja(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return j(n,e);const t=mt(n),r=mt(e),i=j(t.seconds,r.seconds);return i!==0?i:j(t.nanos,r.nanos)}function Ya(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const o=tn(t[i],r[i]);if(o)return o}return j(t.length,r.length)}function nn(n){return ys(n)}function ys(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=mt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return gt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return L.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const o of t.values||[])i?i=!1:r+=",",r+=ys(o);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",o=!0;for(const a of r)o?o=!1:i+=",",i+=`${a}:${ys(t.fields[a])}`;return i+"}"}(n.mapValue):x(61005,{value:n})}function Lr(n){switch(_t(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=di(n);return e?16+Lr(e):16;case 5:return 2*n.stringValue.length;case 6:return gt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,o)=>i+Lr(o),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return Et(r.fields,(o,a)=>{i+=o.length+Lr(a)}),i}(n.mapValue);default:throw x(13486,{value:n})}}function vs(n){return!!n&&"integerValue"in n}function qs(n){return!!n&&"arrayValue"in n}function Xa(n){return!!n&&"nullValue"in n}function Za(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Mr(n){return!!n&&"mapValue"in n}function up(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[ku])===null||t===void 0?void 0:t.stringValue)===Vu}function xn(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Et(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=xn(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=xn(n.arrayValue.values[t]);return e}return Object.assign({},n)}function lp(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===cp}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae{constructor(e){this.value=e}static empty(){return new Ae({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Mr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=xn(t)}setAll(e){let t=le.emptyPath(),r={},i=[];e.forEach((a,u)=>{if(!t.isImmediateParentOf(u)){const h=this.getFieldsMap(t);this.applyChanges(h,r,i),r={},i=[],t=u.popLast()}a?r[u.lastSegment()]=xn(a):i.push(u.lastSegment())});const o=this.getFieldsMap(t);this.applyChanges(o,r,i)}delete(e){const t=this.field(e.popLast());Mr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Fe(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Mr(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Et(t,(i,o)=>e[i]=o);for(const i of r)delete e[i]}clone(){return new Ae(xn(this.value))}}function Du(n){const e=[];return Et(n.fields,(t,r)=>{const i=new le([t]);if(Mr(r)){const o=Du(r.mapValue).fields;if(o.length===0)e.push(i);else for(const a of o)e.push(i.child(a))}else e.push(i)}),new Pe(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye{constructor(e,t,r,i,o,a,u){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=o,this.data=a,this.documentState=u}static newInvalidDocument(e){return new ye(e,0,U.min(),U.min(),U.min(),Ae.empty(),0)}static newFoundDocument(e,t,r,i){return new ye(e,1,t,U.min(),r,i,0)}static newNoDocument(e,t){return new ye(e,2,t,U.min(),U.min(),Ae.empty(),0)}static newUnknownDocument(e,t){return new ye(e,3,t,U.min(),U.min(),Ae.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ae.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ae.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ye&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ye(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kr{constructor(e,t){this.position=e,this.inclusive=t}}function ec(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const o=e[i],a=n.position[i];if(o.field.isKeyField()?r=L.comparator(L.fromName(a.referenceValue),t.key):r=tn(a,t.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function tc(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Fe(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e,t="asc"){this.field=e,this.dir=t}}function hp(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu{}class ie extends Nu{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new fp(e,t,r):t==="array-contains"?new gp(e,r):t==="in"?new _p(e,r):t==="not-in"?new yp(e,r):t==="array-contains-any"?new vp(e,r):new ie(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new pp(e,r):new mp(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(tn(t,this.value)):t!==null&&_t(this.value)===_t(t)&&this.matchesComparison(tn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return x(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Be extends Nu{constructor(e,t){super(),this.filters=e,this.op=t,this.Te=null}static create(e,t){return new Be(e,t)}matches(e){return Ou(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Te!==null||(this.Te=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Te}getFilters(){return Object.assign([],this.filters)}}function Ou(n){return n.op==="and"}function Lu(n){return dp(n)&&Ou(n)}function dp(n){for(const e of n.filters)if(e instanceof Be)return!1;return!0}function Es(n){if(n instanceof ie)return n.field.canonicalString()+n.op.toString()+nn(n.value);if(Lu(n))return n.filters.map(e=>Es(e)).join(",");{const e=n.filters.map(t=>Es(t)).join(",");return`${n.op}(${e})`}}function Mu(n,e){return n instanceof ie?function(r,i){return i instanceof ie&&r.op===i.op&&r.field.isEqual(i.field)&&Fe(r.value,i.value)}(n,e):n instanceof Be?function(r,i){return i instanceof Be&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((o,a,u)=>o&&Mu(a,i.filters[u]),!0):!1}(n,e):void x(19439)}function xu(n){return n instanceof ie?function(t){return`${t.field.canonicalString()} ${t.op} ${nn(t.value)}`}(n):n instanceof Be?function(t){return t.op.toString()+" {"+t.getFilters().map(xu).join(" ,")+"}"}(n):"Filter"}class fp extends ie{constructor(e,t,r){super(e,t,r),this.key=L.fromName(r.referenceValue)}matches(e){const t=L.comparator(e.key,this.key);return this.matchesComparison(t)}}class pp extends ie{constructor(e,t){super(e,"in",t),this.keys=Uu("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class mp extends ie{constructor(e,t){super(e,"not-in",t),this.keys=Uu("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Uu(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>L.fromName(r.referenceValue))}class gp extends ie{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return qs(t)&&Wn(t.arrayValue,this.value)}}class _p extends ie{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Wn(this.value.arrayValue,t)}}class yp extends ie{constructor(e,t){super(e,"not-in",t)}matches(e){if(Wn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Wn(this.value.arrayValue,t)}}class vp extends ie{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!qs(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Wn(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ep{constructor(e,t=null,r=[],i=[],o=null,a=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=o,this.startAt=a,this.endAt=u,this.Ie=null}}function nc(n,e=null,t=[],r=[],i=null,o=null,a=null){return new Ep(n,e,t,r,i,o,a)}function zs(n){const e=F(n);if(e.Ie===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Es(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(o){return o.field.canonicalString()+o.dir}(r)).join(","),hi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>nn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>nn(r)).join(",")),e.Ie=t}return e.Ie}function Hs(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!hp(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Mu(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!tc(n.startAt,e.startAt)&&tc(n.endAt,e.endAt)}function Ts(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t=null,r=[],i=[],o=null,a="F",u=null,h=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=o,this.limitType=a,this.startAt=u,this.endAt=h,this.Ee=null,this.de=null,this.Ae=null,this.startAt,this.endAt}}function Tp(n,e,t,r,i,o,a,u){return new fi(n,e,t,r,i,o,a,u)}function Ws(n){return new fi(n)}function rc(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Ip(n){return n.collectionGroup!==null}function Un(n){const e=F(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const o of e.explicitOrderBy)e.Ee.push(o),t.add(o.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new oe(le.comparator);return a.filters.forEach(h=>{h.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(e).forEach(o=>{t.has(o.canonicalString())||o.isKeyField()||e.Ee.push(new Qr(o,r))}),t.has(le.keyField().canonicalString())||e.Ee.push(new Qr(le.keyField(),r))}return e.Ee}function Oe(n){const e=F(n);return e.de||(e.de=wp(e,Un(n))),e.de}function wp(n,e){if(n.limitType==="F")return nc(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const o=i.dir==="desc"?"asc":"desc";return new Qr(i.field,o)});const t=n.endAt?new Kr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Kr(n.startAt.position,n.startAt.inclusive):null;return nc(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Is(n,e,t){return new fi(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function pi(n,e){return Hs(Oe(n),Oe(e))&&n.limitType===e.limitType}function Fu(n){return`${zs(Oe(n))}|lt:${n.limitType}`}function zt(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>xu(i)).join(", ")}]`),hi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>nn(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>nn(i)).join(",")),`Target(${r})`}(Oe(n))}; limitType=${n.limitType})`}function mi(n,e){return e.isFoundDocument()&&function(r,i){const o=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):L.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)}(n,e)&&function(r,i){for(const o of Un(r))if(!o.field.isKeyField()&&i.data.field(o.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const o of r.filters)if(!o.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,u,h){const d=ec(a,u,h);return a.inclusive?d<=0:d<0}(r.startAt,Un(r),i)||r.endAt&&!function(a,u,h){const d=ec(a,u,h);return a.inclusive?d>=0:d>0}(r.endAt,Un(r),i))}(n,e)}function Ap(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Bu(n){return(e,t)=>{let r=!1;for(const i of Un(n)){const o=Rp(i,e,t);if(o!==0)return o;r=r||i.field.isKeyField()}return 0}}function Rp(n,e,t){const r=n.field.isKeyField()?L.comparator(e.key,t.key):function(o,a,u){const h=a.data.field(o),d=u.data.field(o);return h!==null&&d!==null?tn(h,d):x(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return x(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,o]of r)if(this.equalsFn(i,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let o=0;o<i.length;o++)if(this.equalsFn(i[o][0],e))return void(i[o]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Et(this.inner,(t,r)=>{for(const[i,o]of r)e(i,o)})}isEmpty(){return Au(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pp=new X(L.comparator);function Qe(){return Pp}const ju=new X(L.comparator);function On(...n){let e=ju;for(const t of n)e=e.insert(t.key,t);return e}function $u(n){let e=ju;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function bt(){return Fn()}function qu(){return Fn()}function Fn(){return new Mt(n=>n.toString(),(n,e)=>n.isEqual(e))}const Sp=new X(L.comparator),Cp=new oe(L.comparator);function z(...n){let e=Cp;for(const t of n)e=e.add(t);return e}const bp=new oe(j);function kp(){return bp}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gs(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Hr(e)?"-0":e}}function zu(n){return{integerValue:""+n}}function Vp(n,e){return rp(e)?zu(e):Gs(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(){this._=void 0}}function Dp(n,e,t){return n instanceof Jr?function(i,o){const a={fields:{[Su]:{stringValue:Pu},[bu]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return o&&$s(o)&&(o=di(o)),o&&(a.fields[Cu]=o),{mapValue:a}}(t,e):n instanceof rn?Wu(n,e):n instanceof Gn?Gu(n,e):function(i,o){const a=Hu(i,o),u=ic(a)+ic(i.Re);return vs(a)&&vs(i.Re)?zu(u):Gs(i.serializer,u)}(n,e)}function Np(n,e,t){return n instanceof rn?Wu(n,e):n instanceof Gn?Gu(n,e):t}function Hu(n,e){return n instanceof Yr?function(r){return vs(r)||function(o){return!!o&&"doubleValue"in o}(r)}(e)?e:{integerValue:0}:null}class Jr extends gi{}class rn extends gi{constructor(e){super(),this.elements=e}}function Wu(n,e){const t=Ku(e);for(const r of n.elements)t.some(i=>Fe(i,r))||t.push(r);return{arrayValue:{values:t}}}class Gn extends gi{constructor(e){super(),this.elements=e}}function Gu(n,e){let t=Ku(e);for(const r of n.elements)t=t.filter(i=>!Fe(i,r));return{arrayValue:{values:t}}}class Yr extends gi{constructor(e,t){super(),this.serializer=e,this.Re=t}}function ic(n){return ne(n.integerValue||n.doubleValue)}function Ku(n){return qs(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(e,t){this.field=e,this.transform=t}}function Lp(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof rn&&i instanceof rn||r instanceof Gn&&i instanceof Gn?en(r.elements,i.elements,Fe):r instanceof Yr&&i instanceof Yr?Fe(r.Re,i.Re):r instanceof Jr&&i instanceof Jr}(n.transform,e.transform)}class Mp{constructor(e,t){this.version=e,this.transformResults=t}}class Le{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Le}static exists(e){return new Le(void 0,e)}static updateTime(e){return new Le(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function xr(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class _i{}function Qu(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Yu(n.key,Le.none()):new er(n.key,n.data,Le.none());{const t=n.data,r=Ae.empty();let i=new oe(le.comparator);for(let o of e.fields)if(!i.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?r.delete(o):r.set(o,a),i=i.add(o)}return new Tt(n.key,r,new Pe(i.toArray()),Le.none())}}function xp(n,e,t){n instanceof er?function(i,o,a){const u=i.value.clone(),h=oc(i.fieldTransforms,o,a.transformResults);u.setAll(h),o.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):n instanceof Tt?function(i,o,a){if(!xr(i.precondition,o))return void o.convertToUnknownDocument(a.version);const u=oc(i.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Ju(i)),h.setAll(u),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()}(n,e,t):function(i,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Bn(n,e,t,r){return n instanceof er?function(o,a,u,h){if(!xr(o.precondition,a))return u;const d=o.value.clone(),p=ac(o.fieldTransforms,h,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Tt?function(o,a,u,h){if(!xr(o.precondition,a))return u;const d=ac(o.fieldTransforms,h,a),p=a.data;return p.setAll(Ju(o)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),u===null?null:u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(y=>y.field))}(n,e,t,r):function(o,a,u){return xr(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(n,e,t)}function Up(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),o=Hu(r.transform,i||null);o!=null&&(t===null&&(t=Ae.empty()),t.set(r.field,o))}return t||null}function sc(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&en(r,i,(o,a)=>Lp(o,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class er extends _i{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Tt extends _i{constructor(e,t,r,i,o=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Ju(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function oc(n,e,t){const r=new Map;K(n.length===t.length,32656,{Ve:t.length,me:n.length});for(let i=0;i<t.length;i++){const o=n[i],a=o.transform,u=e.data.field(o.field);r.set(o.field,Np(a,u,t[i]))}return r}function ac(n,e,t){const r=new Map;for(const i of n){const o=i.transform,a=t.data.field(i.field);r.set(i.field,Dp(o,a,e))}return r}class Yu extends _i{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Fp extends _i{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bp{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const o=this.mutations[i];o.key.isEqual(e.key)&&xp(o,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Bn(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Bn(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=qu();return this.mutations.forEach(i=>{const o=e.get(i.key),a=o.overlayedDocument;let u=this.applyToLocalView(a,o.mutatedFields);u=t.has(i.key)?null:u;const h=Qu(a,u);h!==null&&r.set(i.key,h),a.isValidDocument()||a.convertToNoDocument(U.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),z())}isEqual(e){return this.batchId===e.batchId&&en(this.mutations,e.mutations,(t,r)=>sc(t,r))&&en(this.baseMutations,e.baseMutations,(t,r)=>sc(t,r))}}class Ks{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){K(e.mutations.length===r.length,58842,{fe:e.mutations.length,ge:r.length});let i=function(){return Sp}();const o=e.mutations;for(let a=0;a<o.length;a++)i=i.insert(o[a].key,r[a].version);return new Ks(e,t,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jp{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var re,H;function qp(n){switch(n){case C.OK:return x(64938);case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0;default:return x(15467,{code:n})}}function Xu(n){if(n===void 0)return Ke("GRPC error has no .code"),C.UNKNOWN;switch(n){case re.OK:return C.OK;case re.CANCELLED:return C.CANCELLED;case re.UNKNOWN:return C.UNKNOWN;case re.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case re.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case re.INTERNAL:return C.INTERNAL;case re.UNAVAILABLE:return C.UNAVAILABLE;case re.UNAUTHENTICATED:return C.UNAUTHENTICATED;case re.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case re.NOT_FOUND:return C.NOT_FOUND;case re.ALREADY_EXISTS:return C.ALREADY_EXISTS;case re.PERMISSION_DENIED:return C.PERMISSION_DENIED;case re.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case re.ABORTED:return C.ABORTED;case re.OUT_OF_RANGE:return C.OUT_OF_RANGE;case re.UNIMPLEMENTED:return C.UNIMPLEMENTED;case re.DATA_LOSS:return C.DATA_LOSS;default:return x(39323,{code:n})}}(H=re||(re={}))[H.OK=0]="OK",H[H.CANCELLED=1]="CANCELLED",H[H.UNKNOWN=2]="UNKNOWN",H[H.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",H[H.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",H[H.NOT_FOUND=5]="NOT_FOUND",H[H.ALREADY_EXISTS=6]="ALREADY_EXISTS",H[H.PERMISSION_DENIED=7]="PERMISSION_DENIED",H[H.UNAUTHENTICATED=16]="UNAUTHENTICATED",H[H.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",H[H.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",H[H.ABORTED=10]="ABORTED",H[H.OUT_OF_RANGE=11]="OUT_OF_RANGE",H[H.UNIMPLEMENTED=12]="UNIMPLEMENTED",H[H.INTERNAL=13]="INTERNAL",H[H.UNAVAILABLE=14]="UNAVAILABLE",H[H.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zp=new ht([4294967295,4294967295],0);function cc(n){const e=Tu().encode(n),t=new fu;return t.update(e),new Uint8Array(t.digest())}function uc(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),o=e.getUint32(12,!0);return[new ht([t,r],0),new ht([i,o],0)]}class Qs{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ln(`Invalid padding: ${t}`);if(r<0)throw new Ln(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ln(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ln(`Invalid padding when bitmap length is 0: ${t}`);this.pe=8*e.length-t,this.ye=ht.fromNumber(this.pe)}we(e,t,r){let i=e.add(t.multiply(ht.fromNumber(r)));return i.compare(zp)===1&&(i=new ht([i.getBits(0),i.getBits(1)],0)),i.modulo(this.ye).toNumber()}Se(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.pe===0)return!1;const t=cc(e),[r,i]=uc(t);for(let o=0;o<this.hashCount;o++){const a=this.we(r,i,o);if(!this.Se(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,o=new Uint8Array(Math.ceil(e/8)),a=new Qs(o,i,t);return r.forEach(u=>a.insert(u)),a}insert(e){if(this.pe===0)return;const t=cc(e),[r,i]=uc(t);for(let o=0;o<this.hashCount;o++){const a=this.we(r,i,o);this.be(a)}}be(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ln extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yi{constructor(e,t,r,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,tr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new yi(U.min(),i,new X(j),Qe(),z())}}class tr{constructor(e,t,r,i,o){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new tr(r,t,z(),z(),z())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(e,t,r,i){this.De=e,this.removedTargetIds=t,this.key=r,this.ve=i}}class Zu{constructor(e,t){this.targetId=e,this.Ce=t}}class el{constructor(e,t,r=he.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class lc{constructor(){this.Fe=0,this.Me=hc(),this.xe=he.EMPTY_BYTE_STRING,this.Oe=!1,this.Ne=!0}get current(){return this.Oe}get resumeToken(){return this.xe}get Be(){return this.Fe!==0}get Le(){return this.Ne}ke(e){e.approximateByteSize()>0&&(this.Ne=!0,this.xe=e)}qe(){let e=z(),t=z(),r=z();return this.Me.forEach((i,o)=>{switch(o){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:x(38017,{changeType:o})}}),new tr(this.xe,this.Oe,e,t,r)}Qe(){this.Ne=!1,this.Me=hc()}$e(e,t){this.Ne=!0,this.Me=this.Me.insert(e,t)}Ue(e){this.Ne=!0,this.Me=this.Me.remove(e)}Ke(){this.Fe+=1}We(){this.Fe-=1,K(this.Fe>=0,3241,{Fe:this.Fe})}Ge(){this.Ne=!0,this.Oe=!0}}class Hp{constructor(e){this.ze=e,this.je=new Map,this.He=Qe(),this.Je=Vr(),this.Ye=Vr(),this.Ze=new X(j)}Xe(e){for(const t of e.De)e.ve&&e.ve.isFoundDocument()?this.et(t,e.ve):this.tt(t,e.key,e.ve);for(const t of e.removedTargetIds)this.tt(t,e.key,e.ve)}nt(e){this.forEachTarget(e,t=>{const r=this.rt(t);switch(e.state){case 0:this.it(t)&&r.ke(e.resumeToken);break;case 1:r.We(),r.Be||r.Qe(),r.ke(e.resumeToken);break;case 2:r.We(),r.Be||this.removeTarget(t);break;case 3:this.it(t)&&(r.Ge(),r.ke(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),r.ke(e.resumeToken));break;default:x(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach((r,i)=>{this.it(i)&&t(i)})}ot(e){const t=e.targetId,r=e.Ce.count,i=this._t(t);if(i){const o=i.target;if(Ts(o))if(r===0){const a=new L(o.path);this.tt(t,a,ye.newNoDocument(a,U.min()))}else K(r===1,20013,{expectedCount:r});else{const a=this.ut(t);if(a!==r){const u=this.ct(e),h=u?this.lt(u,e,a):1;if(h!==0){this.st(t);const d=h===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,d)}}}}}ct(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:o=0}=t;let a,u;try{a=gt(r).toUint8Array()}catch(h){if(h instanceof Ru)return Zt("Decoding the base64 bloom filter in existence filter failed ("+h.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw h}try{u=new Qs(a,i,o)}catch(h){return Zt(h instanceof Ln?"BloomFilter error: ":"Applying bloom filter failed: ",h),null}return u.pe===0?null:u}lt(e,t,r){return t.Ce.count===r-this.Tt(e,t.targetId)?0:2}Tt(e,t){const r=this.ze.getRemoteKeysForTarget(t);let i=0;return r.forEach(o=>{const a=this.ze.Pt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;e.mightContain(u)||(this.tt(t,o,null),i++)}),i}It(e){const t=new Map;this.je.forEach((o,a)=>{const u=this._t(a);if(u){if(o.current&&Ts(u.target)){const h=new L(u.target.path);this.Et(h).has(a)||this.dt(a,h)||this.tt(a,h,ye.newNoDocument(h,e))}o.Le&&(t.set(a,o.qe()),o.Qe())}});let r=z();this.Ye.forEach((o,a)=>{let u=!0;a.forEachWhile(h=>{const d=this._t(h);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(r=r.add(o))}),this.He.forEach((o,a)=>a.setReadTime(e));const i=new yi(e,t,this.Ze,this.He,r);return this.He=Qe(),this.Je=Vr(),this.Ye=Vr(),this.Ze=new X(j),i}et(e,t){if(!this.it(e))return;const r=this.dt(e,t.key)?2:0;this.rt(e).$e(t.key,r),this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.Ye=this.Ye.insert(t.key,this.At(t.key).add(e))}tt(e,t,r){if(!this.it(e))return;const i=this.rt(e);this.dt(e,t)?i.$e(t,1):i.Ue(t),this.Ye=this.Ye.insert(t,this.At(t).delete(e)),this.Ye=this.Ye.insert(t,this.At(t).add(e)),r&&(this.He=this.He.insert(t,r))}removeTarget(e){this.je.delete(e)}ut(e){const t=this.rt(e).qe();return this.ze.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ke(e){this.rt(e).Ke()}rt(e){let t=this.je.get(e);return t||(t=new lc,this.je.set(e,t)),t}At(e){let t=this.Ye.get(e);return t||(t=new oe(j),this.Ye=this.Ye.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new oe(j),this.Je=this.Je.insert(e,t)),t}it(e){const t=this._t(e)!==null;return t||D("WatchChangeAggregator","Detected inactive target",e),t}_t(e){const t=this.je.get(e);return t&&t.Be?null:this.ze.Rt(e)}st(e){this.je.set(e,new lc),this.ze.getRemoteKeysForTarget(e).forEach(t=>{this.tt(e,t,null)})}dt(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function Vr(){return new X(L.comparator)}function hc(){return new X(L.comparator)}const Wp={asc:"ASCENDING",desc:"DESCENDING"},Gp={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Kp={and:"AND",or:"OR"};class Qp{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ws(n,e){return n.useProto3Json||hi(e)?e:{value:e}}function Xr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function tl(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Jp(n,e){return Xr(n,e.toTimestamp())}function Me(n){return K(!!n,49232),U.fromTimestamp(function(t){const r=mt(t);return new se(r.seconds,r.nanos)}(n))}function Js(n,e){return As(n,e).canonicalString()}function As(n,e){const t=function(i){return new ee(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function nl(n){const e=ee.fromString(n);return K(al(e),10190,{key:e.toString()}),e}function Rs(n,e){return Js(n.databaseId,e.path)}function ss(n,e){const t=nl(e);if(t.get(1)!==n.databaseId.projectId)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(il(t))}function rl(n,e){return Js(n.databaseId,e)}function Yp(n){const e=nl(n);return e.length===4?ee.emptyPath():il(e)}function Ps(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function il(n){return K(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function dc(n,e,t){return{name:Rs(n,e),fields:t.value.mapValue.fields}}function Xp(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:x(39313,{state:d})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],o=function(d,p){return d.useProto3Json?(K(p===void 0||typeof p=="string",58123),he.fromBase64String(p||"")):(K(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),he.fromUint8Array(p||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,u=a&&function(d){const p=d.code===void 0?C.UNKNOWN:Xu(d.code);return new O(p,d.message||"")}(a);t=new el(r,i,o,u||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=ss(n,r.document.name),o=Me(r.document.updateTime),a=r.document.createTime?Me(r.document.createTime):U.min(),u=new Ae({mapValue:{fields:r.document.fields}}),h=ye.newFoundDocument(i,o,a,u),d=r.targetIds||[],p=r.removedTargetIds||[];t=new Ur(d,p,h.key,h)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=ss(n,r.document),o=r.readTime?Me(r.readTime):U.min(),a=ye.newNoDocument(i,o),u=r.removedTargetIds||[];t=new Ur([],u,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=ss(n,r.document),o=r.removedTargetIds||[];t=new Ur([],o,i,null)}else{if(!("filter"in e))return x(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:o}=r,a=new $p(i,o),u=r.targetId;t=new Zu(u,a)}}return t}function Zp(n,e){let t;if(e instanceof er)t={update:dc(n,e.key,e.value)};else if(e instanceof Yu)t={delete:Rs(n,e.key)};else if(e instanceof Tt)t={update:dc(n,e.key,e.data),updateMask:cm(e.fieldMask)};else{if(!(e instanceof Fp))return x(16599,{ft:e.type});t={verify:Rs(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(o,a){const u=a.transform;if(u instanceof Jr)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof rn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Gn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Yr)return{fieldPath:a.field.canonicalString(),increment:u.Re};throw x(20930,{transform:a.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,o){return o.updateTime!==void 0?{updateTime:Jp(i,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:x(27497)}(n,e.precondition)),t}function em(n,e){return n&&n.length>0?(K(e!==void 0,14353),n.map(t=>function(i,o){let a=i.updateTime?Me(i.updateTime):Me(o);return a.isEqual(U.min())&&(a=Me(o)),new Mp(a,i.transformResults||[])}(t,e))):[]}function tm(n,e){return{documents:[rl(n,e.path)]}}function nm(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=rl(n,i);const o=function(d){if(d.length!==0)return ol(Be.create(d,"and"))}(e.filters);o&&(t.structuredQuery.where=o);const a=function(d){if(d.length!==0)return d.map(p=>function(E){return{field:Ht(E.field),direction:sm(E.dir)}}(p))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const u=ws(n,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{gt:t,parent:i}}function rm(n){let e=Yp(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){K(r===1,65062);const p=t.from[0];p.allDescendants?i=p.collectionId:e=e.child(p.collectionId)}let o=[];t.where&&(o=function(y){const E=sl(y);return E instanceof Be&&Lu(E)?E.getFilters():[E]}(t.where));let a=[];t.orderBy&&(a=function(y){return y.map(E=>function(b){return new Qr(Wt(b.field),function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(b.direction))}(E))}(t.orderBy));let u=null;t.limit&&(u=function(y){let E;return E=typeof y=="object"?y.value:y,hi(E)?null:E}(t.limit));let h=null;t.startAt&&(h=function(y){const E=!!y.before,S=y.values||[];return new Kr(S,E)}(t.startAt));let d=null;return t.endAt&&(d=function(y){const E=!y.before,S=y.values||[];return new Kr(S,E)}(t.endAt)),Tp(e,i,a,o,u,"F",h,d)}function im(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return x(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function sl(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Wt(t.unaryFilter.field);return ie.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Wt(t.unaryFilter.field);return ie.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=Wt(t.unaryFilter.field);return ie.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Wt(t.unaryFilter.field);return ie.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return x(61313);default:return x(60726)}}(n):n.fieldFilter!==void 0?function(t){return ie.create(Wt(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return x(58110);default:return x(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Be.create(t.compositeFilter.filters.map(r=>sl(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return x(1026)}}(t.compositeFilter.op))}(n):x(30097,{filter:n})}function sm(n){return Wp[n]}function om(n){return Gp[n]}function am(n){return Kp[n]}function Ht(n){return{fieldPath:n.canonicalString()}}function Wt(n){return le.fromServerFormat(n.fieldPath)}function ol(n){return n instanceof ie?function(t){if(t.op==="=="){if(Za(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NAN"}};if(Xa(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Za(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NOT_NAN"}};if(Xa(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ht(t.field),op:om(t.op),value:t.value}}}(n):n instanceof Be?function(t){const r=t.getFilters().map(i=>ol(i));return r.length===1?r[0]:{compositeFilter:{op:am(t.op),filters:r}}}(n):x(54877,{filter:n})}function cm(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function al(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e,t,r,i,o=U.min(),a=U.min(),u=he.EMPTY_BYTE_STRING,h=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=h}withSequenceNumber(e){return new at(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class um{constructor(e){this.wt=e}}function lm(n){const e=rm({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Is(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hm{constructor(){this.Cn=new dm}addToCollectionParentIndex(e,t){return this.Cn.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(pt.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(pt.min())}updateCollectionGroup(e,t,r){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class dm{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new oe(ee.comparator),o=!i.has(r);return this.index[t]=i.add(r),o}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new oe(ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fc={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},cl=41943040;class we{static withCacheSize(e){return new we(e,we.DEFAULT_COLLECTION_PERCENTILE,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */we.DEFAULT_COLLECTION_PERCENTILE=10,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,we.DEFAULT=new we(cl,we.DEFAULT_COLLECTION_PERCENTILE,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),we.DISABLED=new we(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e){this.ur=e}next(){return this.ur+=2,this.ur}static cr(){return new sn(0)}static lr(){return new sn(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pc="LruGarbageCollector",fm=1048576;function mc([n,e],[t,r]){const i=j(n,t);return i===0?j(e,r):i}class pm{constructor(e){this.Er=e,this.buffer=new oe(mc),this.dr=0}Ar(){return++this.dr}Rr(e){const t=[e,this.Ar()];if(this.buffer.size<this.Er)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();mc(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class mm{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Vr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.mr(6e4)}stop(){this.Vr&&(this.Vr.cancel(),this.Vr=null)}get started(){return this.Vr!==null}mr(e){D(pc,`Garbage collection scheduled in ${e}ms`),this.Vr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Vr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){hn(t)?D(pc,"Ignoring IndexedDB error during garbage collection: ",t):await ln(t)}await this.mr(3e5)})}}class gm{constructor(e,t){this.gr=e,this.params=t}calculateTargetCount(e,t){return this.gr.pr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return P.resolve(li.le);const r=new pm(t);return this.gr.forEachTarget(e,i=>r.Rr(i.sequenceNumber)).next(()=>this.gr.yr(e,i=>r.Rr(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.gr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.gr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(D("LruGarbageCollector","Garbage collection skipped; disabled"),P.resolve(fc)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(D("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),fc):this.wr(e,t))}getCacheSize(e){return this.gr.getCacheSize(e)}wr(e,t){let r,i,o,a,u,h,d;const p=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(y=>(y>this.params.maximumSequenceNumbersToCollect?(D("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${y}`),i=this.params.maximumSequenceNumbersToCollect):i=y,a=Date.now(),this.nthSequenceNumber(e,i))).next(y=>(r=y,u=Date.now(),this.removeTargets(e,r,t))).next(y=>(o=y,h=Date.now(),this.removeOrphanedDocuments(e,r))).next(y=>(d=Date.now(),qt()<=q.DEBUG&&D("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${i} in `+(u-a)+`ms
	Removed ${o} targets in `+(h-u)+`ms
	Removed ${y} documents in `+(d-h)+`ms
Total Duration: ${d-p}ms`),P.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:o,documentsRemoved:y})))}}function _m(n,e){return new gm(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ym{constructor(){this.changes=new Mt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ye.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?P.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Em{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Bn(r.mutation,i,Pe.empty(),se.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,z()).next(()=>r))}getLocalViewOfDocuments(e,t,r=z()){const i=bt();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(o=>{let a=On();return o.forEach((u,h)=>{a=a.insert(u,h.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=bt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,z()))}populateOverlays(e,t,r){const i=[];return r.forEach(o=>{t.has(o)||i.push(o)}),this.documentOverlayCache.getOverlays(e,i).next(o=>{o.forEach((a,u)=>{t.set(a,u)})})}computeViews(e,t,r,i){let o=Qe();const a=Fn(),u=function(){return Fn()}();return t.forEach((h,d)=>{const p=r.get(d.key);i.has(d.key)&&(p===void 0||p.mutation instanceof Tt)?o=o.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),Bn(p.mutation,d,p.mutation.getFieldMask(),se.now())):a.set(d.key,Pe.empty())}),this.recalculateAndSaveOverlays(e,o).next(h=>(h.forEach((d,p)=>a.set(d,p)),t.forEach((d,p)=>{var y;return u.set(d,new vm(p,(y=a.get(d))!==null&&y!==void 0?y:null))}),u))}recalculateAndSaveOverlays(e,t){const r=Fn();let i=new X((a,u)=>a-u),o=z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const u of a)u.keys().forEach(h=>{const d=t.get(h);if(d===null)return;let p=r.get(h)||Pe.empty();p=u.applyToLocalView(d,p),r.set(h,p);const y=(i.get(u.batchId)||z()).add(h);i=i.insert(u.batchId,y)})}).next(()=>{const a=[],u=i.getReverseIterator();for(;u.hasNext();){const h=u.getNext(),d=h.key,p=h.value,y=qu();p.forEach(E=>{if(!o.has(E)){const S=Qu(t.get(E),r.get(E));S!==null&&y.set(E,S),o=o.add(E)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,y))}return P.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return function(a){return L.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Ip(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(o=>{const a=i-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-o.size):P.resolve(bt());let u=qn,h=o;return a.next(d=>P.forEach(d,(p,y)=>(u<y.largestBatchId&&(u=y.largestBatchId),o.get(p)?P.resolve():this.remoteDocumentCache.getEntry(e,p).next(E=>{h=h.insert(p,E)}))).next(()=>this.populateOverlays(e,d,o)).next(()=>this.computeViews(e,h,d,z())).next(p=>({batchId:u,changes:$u(p)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next(r=>{let i=On();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const o=t.collectionGroup;let a=On();return this.indexManager.getCollectionParents(e,o).next(u=>P.forEach(u,h=>{const d=function(y,E){return new fi(E,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)}(t,h.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next(p=>{p.forEach((y,E)=>{a=a.insert(y,E)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,o,i))).next(a=>{o.forEach((h,d)=>{const p=d.getKey();a.get(p)===null&&(a=a.insert(p,ye.newInvalidDocument(p)))});let u=On();return a.forEach((h,d)=>{const p=o.get(h);p!==void 0&&Bn(p.mutation,d,Pe.empty(),se.now()),mi(t,d)&&(u=u.insert(h,d))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tm{constructor(e){this.serializer=e,this.kr=new Map,this.qr=new Map}getBundleMetadata(e,t){return P.resolve(this.kr.get(t))}saveBundleMetadata(e,t){return this.kr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:Me(i.createTime)}}(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.qr.get(t))}saveNamedQuery(e,t){return this.qr.set(t.name,function(i){return{name:i.name,query:lm(i.bundledQuery),readTime:Me(i.readTime)}}(t)),P.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Im{constructor(){this.overlays=new X(L.comparator),this.Qr=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const r=bt();return P.forEach(t,i=>this.getOverlay(e,i).next(o=>{o!==null&&r.set(i,o)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,o)=>{this.bt(e,t,o)}),P.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Qr.get(r);return i!==void 0&&(i.forEach(o=>this.overlays=this.overlays.remove(o)),this.Qr.delete(r)),P.resolve()}getOverlaysForCollection(e,t,r){const i=bt(),o=t.length+1,a=new L(t.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const h=u.getNext().value,d=h.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>r&&i.set(h.getKey(),h)}return P.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let o=new X((d,p)=>d-p);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let p=o.get(d.largestBatchId);p===null&&(p=bt(),o=o.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const u=bt(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach((d,p)=>u.set(d,p)),!(u.size()>=i)););return P.resolve(u)}bt(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Qr.get(i.largestBatchId).delete(r.key);this.Qr.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new jp(t,r));let o=this.Qr.get(t);o===void 0&&(o=z(),this.Qr.set(t,o)),this.Qr.set(t,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wm{constructor(){this.sessionToken=he.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(){this.$r=new oe(ae.Ur),this.Kr=new oe(ae.Wr)}isEmpty(){return this.$r.isEmpty()}addReference(e,t){const r=new ae(e,t);this.$r=this.$r.add(r),this.Kr=this.Kr.add(r)}Gr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.zr(new ae(e,t))}jr(e,t){e.forEach(r=>this.removeReference(r,t))}Hr(e){const t=new L(new ee([])),r=new ae(t,e),i=new ae(t,e+1),o=[];return this.Kr.forEachInRange([r,i],a=>{this.zr(a),o.push(a.key)}),o}Jr(){this.$r.forEach(e=>this.zr(e))}zr(e){this.$r=this.$r.delete(e),this.Kr=this.Kr.delete(e)}Yr(e){const t=new L(new ee([])),r=new ae(t,e),i=new ae(t,e+1);let o=z();return this.Kr.forEachInRange([r,i],a=>{o=o.add(a.key)}),o}containsKey(e){const t=new ae(e,0),r=this.$r.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ae{constructor(e,t){this.key=e,this.Zr=t}static Ur(e,t){return L.comparator(e.key,t.key)||j(e.Zr,t.Zr)}static Wr(e,t){return j(e.Zr,t.Zr)||L.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Am{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.nr=1,this.Xr=new oe(ae.Ur)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const o=this.nr;this.nr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Bp(o,t,r,i);this.mutationQueue.push(a);for(const u of i)this.Xr=this.Xr.add(new ae(u.key,o)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return P.resolve(a)}lookupMutationBatch(e,t){return P.resolve(this.ei(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.ti(r),o=i<0?0:i;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?js:this.nr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ae(t,0),i=new ae(t,Number.POSITIVE_INFINITY),o=[];return this.Xr.forEachInRange([r,i],a=>{const u=this.ei(a.Zr);o.push(u)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new oe(j);return t.forEach(i=>{const o=new ae(i,0),a=new ae(i,Number.POSITIVE_INFINITY);this.Xr.forEachInRange([o,a],u=>{r=r.add(u.Zr)})}),P.resolve(this.ni(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let o=r;L.isDocumentKey(o)||(o=o.child(""));const a=new ae(new L(o),0);let u=new oe(j);return this.Xr.forEachWhile(h=>{const d=h.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(u=u.add(h.Zr)),!0)},a),P.resolve(this.ni(u))}ni(e){const t=[];return e.forEach(r=>{const i=this.ei(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){K(this.ri(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Xr;return P.forEach(t.mutations,i=>{const o=new ae(i.key,t.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Xr=r})}sr(e){}containsKey(e,t){const r=new ae(t,0),i=this.Xr.firstAfterOrEqual(r);return P.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}ri(e,t){return this.ti(e)}ti(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}ei(e){const t=this.ti(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rm{constructor(e){this.ii=e,this.docs=function(){return new X(L.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),o=i?i.size:0,a=this.ii(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return P.resolve(r?r.document.mutableCopy():ye.newInvalidDocument(t))}getEntries(e,t){let r=Qe();return t.forEach(i=>{const o=this.docs.get(i);r=r.insert(i,o?o.document.mutableCopy():ye.newInvalidDocument(i))}),P.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let o=Qe();const a=t.path,u=new L(a.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(u);for(;h.hasNext();){const{key:d,value:{document:p}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||Zf(Xf(p),r)<=0||(i.has(p.key)||mi(t,p))&&(o=o.insert(p.key,p.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(e,t,r,i){x(9500)}si(e,t){return P.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new Pm(this)}getSize(e){return P.resolve(this.size)}}class Pm extends ym{constructor(e){super(),this.Br=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.Br.addEntry(e,i)):this.Br.removeEntry(r)}),P.waitFor(t)}getFromCache(e,t){return this.Br.getEntry(e,t)}getAllFromCache(e,t){return this.Br.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sm{constructor(e){this.persistence=e,this.oi=new Mt(t=>zs(t),Hs),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this._i=0,this.ai=new Ys,this.targetCount=0,this.ui=sn.cr()}forEachTarget(e,t){return this.oi.forEach((r,i)=>t(i)),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this._i)}allocateTargetId(e){return this.highestTargetId=this.ui.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this._i&&(this._i=t),P.resolve()}Tr(e){this.oi.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ui=new sn(t),this.highestTargetId=t),e.sequenceNumber>this._i&&(this._i=e.sequenceNumber)}addTargetData(e,t){return this.Tr(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.Tr(t),P.resolve()}removeTargetData(e,t){return this.oi.delete(t.target),this.ai.Hr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,r){let i=0;const o=[];return this.oi.forEach((a,u)=>{u.sequenceNumber<=t&&r.get(u.targetId)===null&&(this.oi.delete(a),o.push(this.removeMatchingKeysForTargetId(e,u.targetId)),i++)}),P.waitFor(o).next(()=>i)}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const r=this.oi.get(t)||null;return P.resolve(r)}addMatchingKeys(e,t,r){return this.ai.Gr(t,r),P.resolve()}removeMatchingKeys(e,t,r){this.ai.jr(t,r);const i=this.persistence.referenceDelegate,o=[];return i&&t.forEach(a=>{o.push(i.markPotentiallyOrphaned(e,a))}),P.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this.ai.Hr(t),P.resolve()}getMatchingKeysForTargetId(e,t){const r=this.ai.Yr(t);return P.resolve(r)}containsKey(e,t){return P.resolve(this.ai.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ul{constructor(e,t){this.ci={},this.overlays={},this.li=new li(0),this.hi=!1,this.hi=!0,this.Pi=new wm,this.referenceDelegate=e(this),this.Ti=new Sm(this),this.indexManager=new hm,this.remoteDocumentCache=function(i){return new Rm(i)}(r=>this.referenceDelegate.Ii(r)),this.serializer=new um(t),this.Ei=new Tm(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.hi=!1,Promise.resolve()}get started(){return this.hi}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Im,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ci[e.toKey()];return r||(r=new Am(t,this.referenceDelegate),this.ci[e.toKey()]=r),r}getGlobalsCache(){return this.Pi}getTargetCache(){return this.Ti}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ei}runTransaction(e,t,r){D("MemoryPersistence","Starting transaction:",e);const i=new Cm(this.li.next());return this.referenceDelegate.di(),r(i).next(o=>this.referenceDelegate.Ai(i).next(()=>o)).toPromise().then(o=>(i.raiseOnCommittedEvent(),o))}Ri(e,t){return P.or(Object.values(this.ci).map(r=>()=>r.containsKey(e,t)))}}class Cm extends tp{constructor(e){super(),this.currentSequenceNumber=e}}class Xs{constructor(e){this.persistence=e,this.Vi=new Ys,this.mi=null}static fi(e){return new Xs(e)}get gi(){if(this.mi)return this.mi;throw x(60996)}addReference(e,t,r){return this.Vi.addReference(r,t),this.gi.delete(r.toString()),P.resolve()}removeReference(e,t,r){return this.Vi.removeReference(r,t),this.gi.add(r.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.gi.add(t.toString()),P.resolve()}removeTarget(e,t){this.Vi.Hr(t.targetId).forEach(i=>this.gi.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(o=>this.gi.add(o.toString()))}).next(()=>r.removeTargetData(e,t))}di(){this.mi=new Set}Ai(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.gi,r=>{const i=L.fromPath(r);return this.pi(e,i).next(o=>{o||t.removeEntry(i,U.min())})}).next(()=>(this.mi=null,t.apply(e)))}updateLimboDocument(e,t){return this.pi(e,t).next(r=>{r?this.gi.delete(t.toString()):this.gi.add(t.toString())})}Ii(e){return 0}pi(e,t){return P.or([()=>P.resolve(this.Vi.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ri(e,t)])}}class Zr{constructor(e,t){this.persistence=e,this.yi=new Mt(r=>ip(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=_m(this,t)}static fi(e,t){return new Zr(e,t)}di(){}Ai(e){return P.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}pr(e){const t=this.Sr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}Sr(e){let t=0;return this.yr(e,r=>{t++}).next(()=>t)}yr(e,t){return P.forEach(this.yi,(r,i)=>this.Dr(e,r,i).next(o=>o?P.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),o=i.newChangeBuffer();return i.si(e,a=>this.Dr(e,a,t).next(u=>{u||(r++,o.removeEntry(a,U.min()))})).next(()=>o.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.yi.set(t,e.currentSequenceNumber),P.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.yi.set(r,e.currentSequenceNumber),P.resolve()}removeReference(e,t,r){return this.yi.set(r,e.currentSequenceNumber),P.resolve()}updateLimboDocument(e,t){return this.yi.set(t,e.currentSequenceNumber),P.resolve()}Ii(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Lr(e.data.value)),t}Dr(e,t,r){return P.or([()=>this.persistence.Ri(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.yi.get(t);return P.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zs{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.ds=r,this.As=i}static Rs(e,t){let r=z(),i=z();for(const o of t.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:i=i.add(o.doc.key)}return new Zs(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bm{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class km{constructor(){this.Vs=!1,this.fs=!1,this.gs=100,this.ps=function(){return Id()?8:np(ve())>0?6:4}()}initialize(e,t){this.ys=e,this.indexManager=t,this.Vs=!0}getDocumentsMatchingQuery(e,t,r,i){const o={result:null};return this.ws(e,t).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.Ss(e,t,i,r).next(a=>{o.result=a})}).next(()=>{if(o.result)return;const a=new bm;return this.bs(e,t,a).next(u=>{if(o.result=u,this.fs)return this.Ds(e,t,a,u.size)})}).next(()=>o.result)}Ds(e,t,r,i){return r.documentReadCount<this.gs?(qt()<=q.DEBUG&&D("QueryEngine","SDK will not create cache indexes for query:",zt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.gs,"documents"),P.resolve()):(qt()<=q.DEBUG&&D("QueryEngine","Query:",zt(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ps*i?(qt()<=q.DEBUG&&D("QueryEngine","The SDK decides to create cache indexes for query:",zt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Oe(t))):P.resolve())}ws(e,t){if(rc(t))return P.resolve(null);let r=Oe(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=Is(t,null,"F"),r=Oe(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(o=>{const a=z(...o);return this.ys.getDocuments(e,a).next(u=>this.indexManager.getMinOffset(e,r).next(h=>{const d=this.vs(t,u);return this.Cs(t,d,a,h.readTime)?this.ws(e,Is(t,null,"F")):this.Fs(e,d,t,h)}))})))}Ss(e,t,r,i){return rc(t)||i.isEqual(U.min())?P.resolve(null):this.ys.getDocuments(e,r).next(o=>{const a=this.vs(t,o);return this.Cs(t,a,r,i)?P.resolve(null):(qt()<=q.DEBUG&&D("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),zt(t)),this.Fs(e,a,t,Yf(i,qn)).next(u=>u))})}vs(e,t){let r=new oe(Bu(e));return t.forEach((i,o)=>{mi(e,o)&&(r=r.add(o))}),r}Cs(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(i)>0)}bs(e,t,r){return qt()<=q.DEBUG&&D("QueryEngine","Using full collection scan to execute query:",zt(t)),this.ys.getDocumentsMatchingQuery(e,t,pt.min(),r)}Fs(e,t,r,i){return this.ys.getDocumentsMatchingQuery(e,r,i).next(o=>(t.forEach(a=>{o=o.insert(a.key,a)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eo="LocalStore",Vm=3e8;class Dm{constructor(e,t,r,i){this.persistence=e,this.Ms=t,this.serializer=i,this.xs=new X(j),this.Os=new Mt(o=>zs(o),Hs),this.Ns=new Map,this.Bs=e.getRemoteDocumentCache(),this.Ti=e.getTargetCache(),this.Ei=e.getBundleCache(),this.Ls(r)}Ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Em(this.Bs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Bs.setIndexManager(this.indexManager),this.Ms.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.xs))}}function Nm(n,e,t,r){return new Dm(n,e,t,r)}async function ll(n,e){const t=F(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(o=>(i=o,t.Ls(e),t.mutationQueue.getAllMutationBatches(r))).next(o=>{const a=[],u=[];let h=z();for(const d of i){a.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}for(const d of o){u.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}return t.localDocuments.getDocuments(r,h).next(d=>({ks:d,removedBatchIds:a,addedBatchIds:u}))})})}function Om(n,e){const t=F(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),o=t.Bs.newChangeBuffer({trackRemovals:!0});return function(u,h,d,p){const y=d.batch,E=y.keys();let S=P.resolve();return E.forEach(b=>{S=S.next(()=>p.getEntry(h,b)).next(N=>{const V=d.docVersions.get(b);K(V!==null,48541),N.version.compareTo(V)<0&&(y.applyToRemoteDocument(N,d),N.isValidDocument()&&(N.setReadTime(d.commitVersion),p.addEntry(N)))})}),S.next(()=>u.mutationQueue.removeMutationBatch(h,y))}(t,r,e,o).next(()=>o.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(u){let h=z();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(h=h.add(u.batch.mutations[d].key));return h}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function hl(n){const e=F(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ti.getLastRemoteSnapshotVersion(t))}function Lm(n,e){const t=F(n),r=e.snapshotVersion;let i=t.xs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",o=>{const a=t.Bs.newChangeBuffer({trackRemovals:!0});i=t.xs;const u=[];e.targetChanges.forEach((p,y)=>{const E=i.get(y);if(!E)return;u.push(t.Ti.removeMatchingKeys(o,p.removedDocuments,y).next(()=>t.Ti.addMatchingKeys(o,p.addedDocuments,y)));let S=E.withSequenceNumber(o.currentSequenceNumber);e.targetMismatches.get(y)!==null?S=S.withResumeToken(he.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):p.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(p.resumeToken,r)),i=i.insert(y,S),function(N,V,W){return N.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=Vm?!0:W.addedDocuments.size+W.modifiedDocuments.size+W.removedDocuments.size>0}(E,S,p)&&u.push(t.Ti.updateTargetData(o,S))});let h=Qe(),d=z();if(e.documentUpdates.forEach(p=>{e.resolvedLimboDocuments.has(p)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(o,p))}),u.push(Mm(o,a,e.documentUpdates).next(p=>{h=p.qs,d=p.Qs})),!r.isEqual(U.min())){const p=t.Ti.getLastRemoteSnapshotVersion(o).next(y=>t.Ti.setTargetsMetadata(o,o.currentSequenceNumber,r));u.push(p)}return P.waitFor(u).next(()=>a.apply(o)).next(()=>t.localDocuments.getLocalViewOfDocuments(o,h,d)).next(()=>h)}).then(o=>(t.xs=i,o))}function Mm(n,e,t){let r=z(),i=z();return t.forEach(o=>r=r.add(o)),e.getEntries(n,r).next(o=>{let a=Qe();return t.forEach((u,h)=>{const d=o.get(u);h.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(u)),h.isNoDocument()&&h.version.isEqual(U.min())?(e.removeEntry(u,h.readTime),a=a.insert(u,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||h.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(h),a=a.insert(u,h)):D(eo,"Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",h.version)}),{qs:a,Qs:i}})}function xm(n,e){const t=F(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=js),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Um(n,e){const t=F(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.Ti.getTargetData(r,e).next(o=>o?(i=o,P.resolve(i)):t.Ti.allocateTargetId(r).next(a=>(i=new at(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ti.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.xs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.xs=t.xs.insert(r.targetId,r),t.Os.set(e,r.targetId)),r})}async function Ss(n,e,t){const r=F(n),i=r.xs.get(e),o=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",o,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!hn(a))throw a;D(eo,`Failed to update sequence numbers for target ${e}: ${a}`)}r.xs=r.xs.remove(e),r.Os.delete(i.target)}function gc(n,e,t){const r=F(n);let i=U.min(),o=z();return r.persistence.runTransaction("Execute query","readwrite",a=>function(h,d,p){const y=F(h),E=y.Os.get(p);return E!==void 0?P.resolve(y.xs.get(E)):y.Ti.getTargetData(d,p)}(r,a,Oe(e)).next(u=>{if(u)return i=u.lastLimboFreeSnapshotVersion,r.Ti.getMatchingKeysForTargetId(a,u.targetId).next(h=>{o=h})}).next(()=>r.Ms.getDocumentsMatchingQuery(a,e,t?i:U.min(),t?o:z())).next(u=>(Fm(r,Ap(e),u),{documents:u,$s:o})))}function Fm(n,e,t){let r=n.Ns.get(e)||U.min();t.forEach((i,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)}),n.Ns.set(e,r)}class _c{constructor(){this.activeTargetIds=kp()}js(e){this.activeTargetIds=this.activeTargetIds.add(e)}Hs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}zs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Bm{constructor(){this.xo=new _c,this.Oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.xo.js(e),this.Oo[e]||"not-current"}updateQueryState(e,t,r){this.Oo[e]=t}removeLocalQueryTarget(e){this.xo.Hs(e)}isLocalQueryTarget(e){return this.xo.activeTargetIds.has(e)}clearQueryState(e){delete this.Oo[e]}getAllActiveQueryTargets(){return this.xo.activeTargetIds}isActiveQueryTarget(e){return this.xo.activeTargetIds.has(e)}start(){return this.xo=new _c,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jm{No(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yc="ConnectivityMonitor";class vc{constructor(){this.Bo=()=>this.Lo(),this.ko=()=>this.qo(),this.Qo=[],this.$o()}No(e){this.Qo.push(e)}shutdown(){window.removeEventListener("online",this.Bo),window.removeEventListener("offline",this.ko)}$o(){window.addEventListener("online",this.Bo),window.addEventListener("offline",this.ko)}Lo(){D(yc,"Network connectivity changed: AVAILABLE");for(const e of this.Qo)e(0)}qo(){D(yc,"Network connectivity changed: UNAVAILABLE");for(const e of this.Qo)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Dr=null;function Cs(){return Dr===null?Dr=function(){return 268435456+Math.round(2147483648*Math.random())}():Dr++,"0x"+Dr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os="RestConnection",$m={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class qm{get Uo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Wo=`projects/${r}/databases/${i}`,this.Go=this.databaseId.database===Wr?`project_id=${r}`:`project_id=${r}&database_id=${i}`}zo(e,t,r,i,o){const a=Cs(),u=this.jo(e,t.toUriEncodedString());D(os,`Sending RPC '${e}' ${a}:`,u,r);const h={"google-cloud-resource-prefix":this.Wo,"x-goog-request-params":this.Go};this.Ho(h,i,o);const{host:d}=new URL(u),p=Yn(d);return this.Jo(e,u,h,r,p).then(y=>(D(os,`Received RPC '${e}' ${a}: `,y),y),y=>{throw Zt(os,`RPC '${e}' ${a} failed with error: `,y,"url: ",u,"request:",r),y})}Yo(e,t,r,i,o,a){return this.zo(e,t,r,i,o)}Ho(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+un}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,o)=>e[o]=i),r&&r.headers.forEach((i,o)=>e[o]=i)}jo(e,t){const r=$m[e];return`${this.Ko}/v1/${t}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zm{constructor(e){this.Zo=e.Zo,this.Xo=e.Xo}e_(e){this.t_=e}n_(e){this.r_=e}i_(e){this.s_=e}onMessage(e){this.o_=e}close(){this.Xo()}send(e){this.Zo(e)}__(){this.t_()}a_(){this.r_()}u_(e){this.s_(e)}c_(e){this.o_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ge="WebChannelConnection";class Hm extends qm{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,r,i,o){const a=Cs();return new Promise((u,h)=>{const d=new pu;d.setWithCredentials(!0),d.listenOnce(mu.COMPLETE,()=>{try{switch(d.getLastErrorCode()){case Or.NO_ERROR:const y=d.getResponseJson();D(ge,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(y)),u(y);break;case Or.TIMEOUT:D(ge,`RPC '${e}' ${a} timed out`),h(new O(C.DEADLINE_EXCEEDED,"Request time out"));break;case Or.HTTP_ERROR:const E=d.getStatus();if(D(ge,`RPC '${e}' ${a} failed with status:`,E,"response text:",d.getResponseText()),E>0){let S=d.getResponseJson();Array.isArray(S)&&(S=S[0]);const b=S==null?void 0:S.error;if(b&&b.status&&b.message){const N=function(W){const B=W.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf(B)>=0?B:C.UNKNOWN}(b.status);h(new O(N,b.message))}else h(new O(C.UNKNOWN,"Server responded with status "+d.getStatus()))}else h(new O(C.UNAVAILABLE,"Connection failed."));break;default:x(9055,{l_:e,streamId:a,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{D(ge,`RPC '${e}' ${a} completed.`)}});const p=JSON.stringify(i);D(ge,`RPC '${e}' ${a} sending request:`,i),d.send(t,"POST",p,r,15)})}T_(e,t,r){const i=Cs(),o=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=yu(),u=_u(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.Ho(h.initMessageHeaders,t,r),h.encodeInitMessageHeaders=!0;const p=o.join("");D(ge,`Creating RPC '${e}' stream ${i}: ${p}`,h);const y=a.createWebChannel(p,h);let E=!1,S=!1;const b=new zm({Zo:V=>{S?D(ge,`Not sending because RPC '${e}' stream ${i} is closed:`,V):(E||(D(ge,`Opening RPC '${e}' stream ${i} transport.`),y.open(),E=!0),D(ge,`RPC '${e}' stream ${i} sending:`,V),y.send(V))},Xo:()=>y.close()}),N=(V,W,B)=>{V.listen(W,$=>{try{B($)}catch(Y){setTimeout(()=>{throw Y},0)}})};return N(y,Nn.EventType.OPEN,()=>{S||(D(ge,`RPC '${e}' stream ${i} transport opened.`),b.__())}),N(y,Nn.EventType.CLOSE,()=>{S||(S=!0,D(ge,`RPC '${e}' stream ${i} transport closed`),b.u_())}),N(y,Nn.EventType.ERROR,V=>{S||(S=!0,Zt(ge,`RPC '${e}' stream ${i} transport errored. Name:`,V.name,"Message:",V.message),b.u_(new O(C.UNAVAILABLE,"The operation could not be completed")))}),N(y,Nn.EventType.MESSAGE,V=>{var W;if(!S){const B=V.data[0];K(!!B,16349);const $=B,Y=($==null?void 0:$.error)||((W=$[0])===null||W===void 0?void 0:W.error);if(Y){D(ge,`RPC '${e}' stream ${i} received error:`,Y);const Ce=Y.status;let te=function(_){const v=re[_];if(v!==void 0)return Xu(v)}(Ce),T=Y.message;te===void 0&&(te=C.INTERNAL,T="Unknown error status: "+Ce+" with message "+Y.message),S=!0,b.u_(new O(te,T)),y.close()}else D(ge,`RPC '${e}' stream ${i} received:`,B),b.c_(B)}}),N(u,gu.STAT_EVENT,V=>{V.stat===gs.PROXY?D(ge,`RPC '${e}' stream ${i} detected buffering proxy`):V.stat===gs.NOPROXY&&D(ge,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{b.a_()},0),b}}function as(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vi(n){return new Qp(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dl{constructor(e,t,r=1e3,i=1.5,o=6e4){this.xi=e,this.timerId=t,this.I_=r,this.E_=i,this.d_=o,this.A_=0,this.R_=null,this.V_=Date.now(),this.reset()}reset(){this.A_=0}m_(){this.A_=this.d_}f_(e){this.cancel();const t=Math.floor(this.A_+this.g_()),r=Math.max(0,Date.now()-this.V_),i=Math.max(0,t-r);i>0&&D("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.A_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.R_=this.xi.enqueueAfterDelay(this.timerId,i,()=>(this.V_=Date.now(),e())),this.A_*=this.E_,this.A_<this.I_&&(this.A_=this.I_),this.A_>this.d_&&(this.A_=this.d_)}p_(){this.R_!==null&&(this.R_.skipDelay(),this.R_=null)}cancel(){this.R_!==null&&(this.R_.cancel(),this.R_=null)}g_(){return(Math.random()-.5)*this.A_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ec="PersistentStream";class fl{constructor(e,t,r,i,o,a,u,h){this.xi=e,this.y_=r,this.w_=i,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=h,this.state=0,this.S_=0,this.b_=null,this.D_=null,this.stream=null,this.v_=0,this.C_=new dl(e,t)}F_(){return this.state===1||this.state===5||this.M_()}M_(){return this.state===2||this.state===3}start(){this.v_=0,this.state!==4?this.auth():this.x_()}async stop(){this.F_()&&await this.close(0)}O_(){this.state=0,this.C_.reset()}N_(){this.M_()&&this.b_===null&&(this.b_=this.xi.enqueueAfterDelay(this.y_,6e4,()=>this.B_()))}L_(e){this.k_(),this.stream.send(e)}async B_(){if(this.M_())return this.close(0)}k_(){this.b_&&(this.b_.cancel(),this.b_=null)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}async close(e,t){this.k_(),this.q_(),this.C_.cancel(),this.S_++,e!==4?this.C_.reset():t&&t.code===C.RESOURCE_EXHAUSTED?(Ke(t.toString()),Ke("Using maximum backoff delay to prevent overloading the backend."),this.C_.m_()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.Q_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.i_(t)}Q_(){}auth(){this.state=1;const e=this.U_(this.S_),t=this.S_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.S_===t&&this.K_(r,i)},r=>{e(()=>{const i=new O(C.UNKNOWN,"Fetching auth token failed: "+r.message);return this.W_(i)})})}K_(e,t){const r=this.U_(this.S_);this.stream=this.G_(e,t),this.stream.e_(()=>{r(()=>this.listener.e_())}),this.stream.n_(()=>{r(()=>(this.state=2,this.D_=this.xi.enqueueAfterDelay(this.w_,1e4,()=>(this.M_()&&(this.state=3),Promise.resolve())),this.listener.n_()))}),this.stream.i_(i=>{r(()=>this.W_(i))}),this.stream.onMessage(i=>{r(()=>++this.v_==1?this.z_(i):this.onNext(i))})}x_(){this.state=5,this.C_.f_(async()=>{this.state=0,this.start()})}W_(e){return D(Ec,`close with error: ${e}`),this.stream=null,this.close(4,e)}U_(e){return t=>{this.xi.enqueueAndForget(()=>this.S_===e?t():(D(Ec,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Wm extends fl{constructor(e,t,r,i,o,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=o}G_(e,t){return this.connection.T_("Listen",e,t)}z_(e){return this.onNext(e)}onNext(e){this.C_.reset();const t=Xp(this.serializer,e),r=function(o){if(!("targetChange"in o))return U.min();const a=o.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?Me(a.readTime):U.min()}(e);return this.listener.j_(t,r)}H_(e){const t={};t.database=Ps(this.serializer),t.addTarget=function(o,a){let u;const h=a.target;if(u=Ts(h)?{documents:tm(o,h)}:{query:nm(o,h).gt},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=tl(o,a.resumeToken);const d=ws(o,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(U.min())>0){u.readTime=Xr(o,a.snapshotVersion.toTimestamp());const d=ws(o,a.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,e);const r=im(this.serializer,e);r&&(t.labels=r),this.L_(t)}J_(e){const t={};t.database=Ps(this.serializer),t.removeTarget=e,this.L_(t)}}class Gm extends fl{constructor(e,t,r,i,o,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=o}get Y_(){return this.v_>0}start(){this.lastStreamToken=void 0,super.start()}Q_(){this.Y_&&this.Z_([])}G_(e,t){return this.connection.T_("Write",e,t)}z_(e){return K(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,K(!e.writeResults||e.writeResults.length===0,55816),this.listener.X_()}onNext(e){K(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.C_.reset();const t=em(e.writeResults,e.commitTime),r=Me(e.commitTime);return this.listener.ea(r,t)}ta(){const e={};e.database=Ps(this.serializer),this.L_(e)}Z_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>Zp(this.serializer,r))};this.L_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Km{}class Qm extends Km{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.na=!1}ra(){if(this.na)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.")}zo(e,t,r,i){return this.ra(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.zo(e,As(t,r),i,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(C.UNKNOWN,o.toString())})}Yo(e,t,r,i,o){return this.ra(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.Yo(e,As(t,r),i,a,u,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new O(C.UNKNOWN,a.toString())})}terminate(){this.na=!0,this.connection.terminate()}}class Jm{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.ia=0,this.sa=null,this.oa=!0}_a(){this.ia===0&&(this.aa("Unknown"),this.sa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.sa=null,this.ua("Backend didn't respond within 10 seconds."),this.aa("Offline"),Promise.resolve())))}ca(e){this.state==="Online"?this.aa("Unknown"):(this.ia++,this.ia>=1&&(this.la(),this.ua(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.aa("Offline")))}set(e){this.la(),this.ia=0,e==="Online"&&(this.oa=!1),this.aa(e)}aa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ua(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.oa?(Ke(t),this.oa=!1):D("OnlineStateTracker",t)}la(){this.sa!==null&&(this.sa.cancel(),this.sa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt="RemoteStore";class Ym{constructor(e,t,r,i,o){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ha=[],this.Pa=new Map,this.Ta=new Set,this.Ia=[],this.Ea=o,this.Ea.No(a=>{r.enqueueAndForget(async()=>{xt(this)&&(D(Dt,"Restarting streams for network reachability change."),await async function(h){const d=F(h);d.Ta.add(4),await nr(d),d.da.set("Unknown"),d.Ta.delete(4),await Ei(d)}(this))})}),this.da=new Jm(r,i)}}async function Ei(n){if(xt(n))for(const e of n.Ia)await e(!0)}async function nr(n){for(const e of n.Ia)await e(!1)}function pl(n,e){const t=F(n);t.Pa.has(e.targetId)||(t.Pa.set(e.targetId,e),io(t)?ro(t):dn(t).M_()&&no(t,e))}function to(n,e){const t=F(n),r=dn(t);t.Pa.delete(e),r.M_()&&ml(t,e),t.Pa.size===0&&(r.M_()?r.N_():xt(t)&&t.da.set("Unknown"))}function no(n,e){if(n.Aa.Ke(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}dn(n).H_(e)}function ml(n,e){n.Aa.Ke(e),dn(n).J_(e)}function ro(n){n.Aa=new Hp({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),Rt:e=>n.Pa.get(e)||null,Pt:()=>n.datastore.serializer.databaseId}),dn(n).start(),n.da._a()}function io(n){return xt(n)&&!dn(n).F_()&&n.Pa.size>0}function xt(n){return F(n).Ta.size===0}function gl(n){n.Aa=void 0}async function Xm(n){n.da.set("Online")}async function Zm(n){n.Pa.forEach((e,t)=>{no(n,e)})}async function eg(n,e){gl(n),io(n)?(n.da.ca(e),ro(n)):n.da.set("Unknown")}async function tg(n,e,t){if(n.da.set("Online"),e instanceof el&&e.state===2&&e.cause)try{await async function(i,o){const a=o.cause;for(const u of o.targetIds)i.Pa.has(u)&&(await i.remoteSyncer.rejectListen(u,a),i.Pa.delete(u),i.Aa.removeTarget(u))}(n,e)}catch(r){D(Dt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ei(n,r)}else if(e instanceof Ur?n.Aa.Xe(e):e instanceof Zu?n.Aa.ot(e):n.Aa.nt(e),!t.isEqual(U.min()))try{const r=await hl(n.localStore);t.compareTo(r)>=0&&await function(o,a){const u=o.Aa.It(a);return u.targetChanges.forEach((h,d)=>{if(h.resumeToken.approximateByteSize()>0){const p=o.Pa.get(d);p&&o.Pa.set(d,p.withResumeToken(h.resumeToken,a))}}),u.targetMismatches.forEach((h,d)=>{const p=o.Pa.get(h);if(!p)return;o.Pa.set(h,p.withResumeToken(he.EMPTY_BYTE_STRING,p.snapshotVersion)),ml(o,h);const y=new at(p.target,h,d,p.sequenceNumber);no(o,y)}),o.remoteSyncer.applyRemoteEvent(u)}(n,t)}catch(r){D(Dt,"Failed to raise snapshot:",r),await ei(n,r)}}async function ei(n,e,t){if(!hn(e))throw e;n.Ta.add(1),await nr(n),n.da.set("Offline"),t||(t=()=>hl(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{D(Dt,"Retrying IndexedDB access"),await t(),n.Ta.delete(1),await Ei(n)})}function _l(n,e){return e().catch(t=>ei(n,t,e))}async function Ti(n){const e=F(n),t=yt(e);let r=e.ha.length>0?e.ha[e.ha.length-1].batchId:js;for(;ng(e);)try{const i=await xm(e.localStore,r);if(i===null){e.ha.length===0&&t.N_();break}r=i.batchId,rg(e,i)}catch(i){await ei(e,i)}yl(e)&&vl(e)}function ng(n){return xt(n)&&n.ha.length<10}function rg(n,e){n.ha.push(e);const t=yt(n);t.M_()&&t.Y_&&t.Z_(e.mutations)}function yl(n){return xt(n)&&!yt(n).F_()&&n.ha.length>0}function vl(n){yt(n).start()}async function ig(n){yt(n).ta()}async function sg(n){const e=yt(n);for(const t of n.ha)e.Z_(t.mutations)}async function og(n,e,t){const r=n.ha.shift(),i=Ks.from(r,e,t);await _l(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Ti(n)}async function ag(n,e){e&&yt(n).Y_&&await async function(r,i){if(function(a){return qp(a)&&a!==C.ABORTED}(i.code)){const o=r.ha.shift();yt(r).O_(),await _l(r,()=>r.remoteSyncer.rejectFailedWrite(o.batchId,i)),await Ti(r)}}(n,e),yl(n)&&vl(n)}async function Tc(n,e){const t=F(n);t.asyncQueue.verifyOperationInProgress(),D(Dt,"RemoteStore received new credentials");const r=xt(t);t.Ta.add(3),await nr(t),r&&t.da.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ta.delete(3),await Ei(t)}async function cg(n,e){const t=F(n);e?(t.Ta.delete(2),await Ei(t)):e||(t.Ta.add(2),await nr(t),t.da.set("Unknown"))}function dn(n){return n.Ra||(n.Ra=function(t,r,i){const o=F(t);return o.ra(),new Wm(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(n.datastore,n.asyncQueue,{e_:Xm.bind(null,n),n_:Zm.bind(null,n),i_:eg.bind(null,n),j_:tg.bind(null,n)}),n.Ia.push(async e=>{e?(n.Ra.O_(),io(n)?ro(n):n.da.set("Unknown")):(await n.Ra.stop(),gl(n))})),n.Ra}function yt(n){return n.Va||(n.Va=function(t,r,i){const o=F(t);return o.ra(),new Gm(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(n.datastore,n.asyncQueue,{e_:()=>Promise.resolve(),n_:ig.bind(null,n),i_:ag.bind(null,n),X_:sg.bind(null,n),ea:og.bind(null,n)}),n.Ia.push(async e=>{e?(n.Va.O_(),await Ti(n)):(await n.Va.stop(),n.ha.length>0&&(D(Dt,`Stopping write stream with ${n.ha.length} pending writes`),n.ha=[]))})),n.Va}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t,r,i,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=o,this.deferred=new dt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,o){const a=Date.now()+r,u=new so(e,t,a,i,o);return u.start(r),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function oo(n,e){if(Ke("AsyncQueue",`${e}: ${n}`),hn(n))return new O(C.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{static emptySet(e){return new Kt(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||L.comparator(t.key,r.key):(t,r)=>L.comparator(t.key,r.key),this.keyedMap=On(),this.sortedSet=new X(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Kt)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,o=r.getNext().key;if(!i.isEqual(o))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Kt;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{constructor(){this.ma=new X(L.comparator)}track(e){const t=e.doc.key,r=this.ma.get(t);r?e.type!==0&&r.type===3?this.ma=this.ma.insert(t,e):e.type===3&&r.type!==1?this.ma=this.ma.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ma=this.ma.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ma=this.ma.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ma=this.ma.remove(t):e.type===1&&r.type===2?this.ma=this.ma.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ma=this.ma.insert(t,{type:2,doc:e.doc}):x(63341,{Vt:e,fa:r}):this.ma=this.ma.insert(t,e)}ga(){const e=[];return this.ma.inorderTraversal((t,r)=>{e.push(r)}),e}}class on{constructor(e,t,r,i,o,a,u,h,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=h,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,i,o){const a=[];return t.forEach(u=>{a.push({type:0,doc:u})}),new on(e,t,Kt.emptySet(t),a,r,i,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&pi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ug{constructor(){this.pa=void 0,this.ya=[]}wa(){return this.ya.some(e=>e.Sa())}}class lg{constructor(){this.queries=wc(),this.onlineState="Unknown",this.ba=new Set}terminate(){(function(t,r){const i=F(t),o=i.queries;i.queries=wc(),o.forEach((a,u)=>{for(const h of u.ya)h.onError(r)})})(this,new O(C.ABORTED,"Firestore shutting down"))}}function wc(){return new Mt(n=>Fu(n),pi)}async function hg(n,e){const t=F(n);let r=3;const i=e.query;let o=t.queries.get(i);o?!o.wa()&&e.Sa()&&(r=2):(o=new ug,r=e.Sa()?0:1);try{switch(r){case 0:o.pa=await t.onListen(i,!0);break;case 1:o.pa=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const u=oo(a,`Initialization of query '${zt(e.query)}' failed`);return void e.onError(u)}t.queries.set(i,o),o.ya.push(e),e.Da(t.onlineState),o.pa&&e.va(o.pa)&&ao(t)}async function dg(n,e){const t=F(n),r=e.query;let i=3;const o=t.queries.get(r);if(o){const a=o.ya.indexOf(e);a>=0&&(o.ya.splice(a,1),o.ya.length===0?i=e.Sa()?0:1:!o.wa()&&e.Sa()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function fg(n,e){const t=F(n);let r=!1;for(const i of e){const o=i.query,a=t.queries.get(o);if(a){for(const u of a.ya)u.va(i)&&(r=!0);a.pa=i}}r&&ao(t)}function pg(n,e,t){const r=F(n),i=r.queries.get(e);if(i)for(const o of i.ya)o.onError(t);r.queries.delete(e)}function ao(n){n.ba.forEach(e=>{e.next()})}var bs,Ac;(Ac=bs||(bs={})).Ca="default",Ac.Cache="cache";class mg{constructor(e,t,r){this.query=e,this.Fa=t,this.Ma=!1,this.xa=null,this.onlineState="Unknown",this.options=r||{}}va(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new on(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ma?this.Oa(e)&&(this.Fa.next(e),t=!0):this.Na(e,this.onlineState)&&(this.Ba(e),t=!0),this.xa=e,t}onError(e){this.Fa.error(e)}Da(e){this.onlineState=e;let t=!1;return this.xa&&!this.Ma&&this.Na(this.xa,e)&&(this.Ba(this.xa),t=!0),t}Na(e,t){if(!e.fromCache||!this.Sa())return!0;const r=t!=="Offline";return(!this.options.La||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Oa(e){if(e.docChanges.length>0)return!0;const t=this.xa&&this.xa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Ba(e){e=on.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ma=!0,this.Fa.next(e)}Sa(){return this.options.source!==bs.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class El{constructor(e){this.key=e}}class Tl{constructor(e){this.key=e}}class gg{constructor(e,t){this.query=e,this.Ga=t,this.za=null,this.hasCachedResults=!1,this.current=!1,this.ja=z(),this.mutatedKeys=z(),this.Ha=Bu(e),this.Ja=new Kt(this.Ha)}get Ya(){return this.Ga}Za(e,t){const r=t?t.Xa:new Ic,i=t?t.Ja:this.Ja;let o=t?t.mutatedKeys:this.mutatedKeys,a=i,u=!1;const h=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((p,y)=>{const E=i.get(p),S=mi(this.query,y)?y:null,b=!!E&&this.mutatedKeys.has(E.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let V=!1;E&&S?E.data.isEqual(S.data)?b!==N&&(r.track({type:3,doc:S}),V=!0):this.eu(E,S)||(r.track({type:2,doc:S}),V=!0,(h&&this.Ha(S,h)>0||d&&this.Ha(S,d)<0)&&(u=!0)):!E&&S?(r.track({type:0,doc:S}),V=!0):E&&!S&&(r.track({type:1,doc:E}),V=!0,(h||d)&&(u=!0)),V&&(S?(a=a.add(S),o=N?o.add(p):o.delete(p)):(a=a.delete(p),o=o.delete(p)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),o=o.delete(p.key),r.track({type:1,doc:p})}return{Ja:a,Xa:r,Cs:u,mutatedKeys:o}}eu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const o=this.Ja;this.Ja=e.Ja,this.mutatedKeys=e.mutatedKeys;const a=e.Xa.ga();a.sort((p,y)=>function(S,b){const N=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return x(20277,{Vt:V})}};return N(S)-N(b)}(p.type,y.type)||this.Ha(p.doc,y.doc)),this.tu(r),i=i!=null&&i;const u=t&&!i?this.nu():[],h=this.ja.size===0&&this.current&&!i?1:0,d=h!==this.za;return this.za=h,a.length!==0||d?{snapshot:new on(this.query,e.Ja,o,a,e.mutatedKeys,h===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),ru:u}:{ru:u}}Da(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ja:this.Ja,Xa:new Ic,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{ru:[]}}iu(e){return!this.Ga.has(e)&&!!this.Ja.has(e)&&!this.Ja.get(e).hasLocalMutations}tu(e){e&&(e.addedDocuments.forEach(t=>this.Ga=this.Ga.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ga=this.Ga.delete(t)),this.current=e.current)}nu(){if(!this.current)return[];const e=this.ja;this.ja=z(),this.Ja.forEach(r=>{this.iu(r.key)&&(this.ja=this.ja.add(r.key))});const t=[];return e.forEach(r=>{this.ja.has(r)||t.push(new Tl(r))}),this.ja.forEach(r=>{e.has(r)||t.push(new El(r))}),t}su(e){this.Ga=e.$s,this.ja=z();const t=this.Za(e.documents);return this.applyChanges(t,!0)}ou(){return on.fromInitialDocuments(this.query,this.Ja,this.mutatedKeys,this.za===0,this.hasCachedResults)}}const co="SyncEngine";class _g{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class yg{constructor(e){this.key=e,this._u=!1}}class vg{constructor(e,t,r,i,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.au={},this.uu=new Mt(u=>Fu(u),pi),this.cu=new Map,this.lu=new Set,this.hu=new X(L.comparator),this.Pu=new Map,this.Tu=new Ys,this.Iu={},this.Eu=new Map,this.du=sn.lr(),this.onlineState="Unknown",this.Au=void 0}get isPrimaryClient(){return this.Au===!0}}async function Eg(n,e,t=!0){const r=Sl(n);let i;const o=r.uu.get(e);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),i=o.view.ou()):i=await Il(r,e,t,!0),i}async function Tg(n,e){const t=Sl(n);await Il(t,e,!0,!1)}async function Il(n,e,t,r){const i=await Um(n.localStore,Oe(e)),o=i.targetId,a=n.sharedClientState.addLocalQueryTarget(o,t);let u;return r&&(u=await Ig(n,e,o,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&pl(n.remoteStore,i),u}async function Ig(n,e,t,r,i){n.Ru=(y,E,S)=>async function(N,V,W,B){let $=V.view.Za(W);$.Cs&&($=await gc(N.localStore,V.query,!1).then(({documents:T})=>V.view.Za(T,$)));const Y=B&&B.targetChanges.get(V.targetId),Ce=B&&B.targetMismatches.get(V.targetId)!=null,te=V.view.applyChanges($,N.isPrimaryClient,Y,Ce);return Pc(N,V.targetId,te.ru),te.snapshot}(n,y,E,S);const o=await gc(n.localStore,e,!0),a=new gg(e,o.$s),u=a.Za(o.documents),h=tr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),d=a.applyChanges(u,n.isPrimaryClient,h);Pc(n,t,d.ru);const p=new _g(e,t,a);return n.uu.set(e,p),n.cu.has(t)?n.cu.get(t).push(e):n.cu.set(t,[e]),d.snapshot}async function wg(n,e,t){const r=F(n),i=r.uu.get(e),o=r.cu.get(i.targetId);if(o.length>1)return r.cu.set(i.targetId,o.filter(a=>!pi(a,e))),void r.uu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Ss(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&to(r.remoteStore,i.targetId),ks(r,i.targetId)}).catch(ln)):(ks(r,i.targetId),await Ss(r.localStore,i.targetId,!0))}async function Ag(n,e){const t=F(n),r=t.uu.get(e),i=t.cu.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),to(t.remoteStore,r.targetId))}async function Rg(n,e,t){const r=Dg(n);try{const i=await function(a,u){const h=F(a),d=se.now(),p=u.reduce((S,b)=>S.add(b.key),z());let y,E;return h.persistence.runTransaction("Locally write mutations","readwrite",S=>{let b=Qe(),N=z();return h.Bs.getEntries(S,p).next(V=>{b=V,b.forEach((W,B)=>{B.isValidDocument()||(N=N.add(W))})}).next(()=>h.localDocuments.getOverlayedDocuments(S,b)).next(V=>{y=V;const W=[];for(const B of u){const $=Up(B,y.get(B.key).overlayedDocument);$!=null&&W.push(new Tt(B.key,$,Du($.value.mapValue),Le.exists(!0)))}return h.mutationQueue.addMutationBatch(S,d,W,u)}).next(V=>{E=V;const W=V.applyToLocalDocumentSet(y,N);return h.documentOverlayCache.saveOverlays(S,V.batchId,W)})}).then(()=>({batchId:E.batchId,changes:$u(y)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,u,h){let d=a.Iu[a.currentUser.toKey()];d||(d=new X(j)),d=d.insert(u,h),a.Iu[a.currentUser.toKey()]=d}(r,i.batchId,t),await rr(r,i.changes),await Ti(r.remoteStore)}catch(i){const o=oo(i,"Failed to persist write");t.reject(o)}}async function wl(n,e){const t=F(n);try{const r=await Lm(t.localStore,e);e.targetChanges.forEach((i,o)=>{const a=t.Pu.get(o);a&&(K(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?a._u=!0:i.modifiedDocuments.size>0?K(a._u,14607):i.removedDocuments.size>0&&(K(a._u,42227),a._u=!1))}),await rr(t,r,e)}catch(r){await ln(r)}}function Rc(n,e,t){const r=F(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.uu.forEach((o,a)=>{const u=a.view.Da(e);u.snapshot&&i.push(u.snapshot)}),function(a,u){const h=F(a);h.onlineState=u;let d=!1;h.queries.forEach((p,y)=>{for(const E of y.ya)E.Da(u)&&(d=!0)}),d&&ao(h)}(r.eventManager,e),i.length&&r.au.j_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Pg(n,e,t){const r=F(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Pu.get(e),o=i&&i.key;if(o){let a=new X(L.comparator);a=a.insert(o,ye.newNoDocument(o,U.min()));const u=z().add(o),h=new yi(U.min(),new Map,new X(j),a,u);await wl(r,h),r.hu=r.hu.remove(o),r.Pu.delete(e),uo(r)}else await Ss(r.localStore,e,!1).then(()=>ks(r,e,t)).catch(ln)}async function Sg(n,e){const t=F(n),r=e.batch.batchId;try{const i=await Om(t.localStore,e);Rl(t,r,null),Al(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await rr(t,i)}catch(i){await ln(i)}}async function Cg(n,e,t){const r=F(n);try{const i=await function(a,u){const h=F(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let p;return h.mutationQueue.lookupMutationBatch(d,u).next(y=>(K(y!==null,37113),p=y.keys(),h.mutationQueue.removeMutationBatch(d,y))).next(()=>h.mutationQueue.performConsistencyCheck(d)).next(()=>h.documentOverlayCache.removeOverlaysForBatchId(d,p,u)).next(()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p)).next(()=>h.localDocuments.getDocuments(d,p))})}(r.localStore,e);Rl(r,e,t),Al(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await rr(r,i)}catch(i){await ln(i)}}function Al(n,e){(n.Eu.get(e)||[]).forEach(t=>{t.resolve()}),n.Eu.delete(e)}function Rl(n,e,t){const r=F(n);let i=r.Iu[r.currentUser.toKey()];if(i){const o=i.get(e);o&&(t?o.reject(t):o.resolve(),i=i.remove(e)),r.Iu[r.currentUser.toKey()]=i}}function ks(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.cu.get(e))n.uu.delete(r),t&&n.au.Vu(r,t);n.cu.delete(e),n.isPrimaryClient&&n.Tu.Hr(e).forEach(r=>{n.Tu.containsKey(r)||Pl(n,r)})}function Pl(n,e){n.lu.delete(e.path.canonicalString());const t=n.hu.get(e);t!==null&&(to(n.remoteStore,t),n.hu=n.hu.remove(e),n.Pu.delete(t),uo(n))}function Pc(n,e,t){for(const r of t)r instanceof El?(n.Tu.addReference(r.key,e),bg(n,r)):r instanceof Tl?(D(co,"Document no longer in limbo: "+r.key),n.Tu.removeReference(r.key,e),n.Tu.containsKey(r.key)||Pl(n,r.key)):x(19791,{mu:r})}function bg(n,e){const t=e.key,r=t.path.canonicalString();n.hu.get(t)||n.lu.has(r)||(D(co,"New document in limbo: "+t),n.lu.add(r),uo(n))}function uo(n){for(;n.lu.size>0&&n.hu.size<n.maxConcurrentLimboResolutions;){const e=n.lu.values().next().value;n.lu.delete(e);const t=new L(ee.fromString(e)),r=n.du.next();n.Pu.set(r,new yg(t)),n.hu=n.hu.insert(t,r),pl(n.remoteStore,new at(Oe(Ws(t.path)),r,"TargetPurposeLimboResolution",li.le))}}async function rr(n,e,t){const r=F(n),i=[],o=[],a=[];r.uu.isEmpty()||(r.uu.forEach((u,h)=>{a.push(r.Ru(h,e,t).then(d=>{var p;if((d||t)&&r.isPrimaryClient){const y=d?!d.fromCache:(p=t==null?void 0:t.targetChanges.get(h.targetId))===null||p===void 0?void 0:p.current;r.sharedClientState.updateQueryState(h.targetId,y?"current":"not-current")}if(d){i.push(d);const y=Zs.Rs(h.targetId,d);o.push(y)}}))}),await Promise.all(a),r.au.j_(i),await async function(h,d){const p=F(h);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",y=>P.forEach(d,E=>P.forEach(E.ds,S=>p.persistence.referenceDelegate.addReference(y,E.targetId,S)).next(()=>P.forEach(E.As,S=>p.persistence.referenceDelegate.removeReference(y,E.targetId,S)))))}catch(y){if(!hn(y))throw y;D(eo,"Failed to update sequence numbers: "+y)}for(const y of d){const E=y.targetId;if(!y.fromCache){const S=p.xs.get(E),b=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(b);p.xs=p.xs.insert(E,N)}}}(r.localStore,o))}async function kg(n,e){const t=F(n);if(!t.currentUser.isEqual(e)){D(co,"User change. New user:",e.toKey());const r=await ll(t.localStore,e);t.currentUser=e,function(o,a){o.Eu.forEach(u=>{u.forEach(h=>{h.reject(new O(C.CANCELLED,a))})}),o.Eu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await rr(t,r.ks)}}function Vg(n,e){const t=F(n),r=t.Pu.get(e);if(r&&r._u)return z().add(r.key);{let i=z();const o=t.cu.get(e);if(!o)return i;for(const a of o){const u=t.uu.get(a);i=i.unionWith(u.view.Ya)}return i}}function Sl(n){const e=F(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=wl.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Vg.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Pg.bind(null,e),e.au.j_=fg.bind(null,e.eventManager),e.au.Vu=pg.bind(null,e.eventManager),e}function Dg(n){const e=F(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Sg.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Cg.bind(null,e),e}class ti{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=vi(e.databaseInfo.databaseId),this.sharedClientState=this.pu(e),this.persistence=this.yu(e),await this.persistence.start(),this.localStore=this.wu(e),this.gcScheduler=this.Su(e,this.localStore),this.indexBackfillerScheduler=this.bu(e,this.localStore)}Su(e,t){return null}bu(e,t){return null}wu(e){return Nm(this.persistence,new km,e.initialUser,this.serializer)}yu(e){return new ul(Xs.fi,this.serializer)}pu(e){return new Bm}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ti.provider={build:()=>new ti};class Ng extends ti{constructor(e){super(),this.cacheSizeBytes=e}Su(e,t){K(this.persistence.referenceDelegate instanceof Zr,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new mm(r,e.asyncQueue,t)}yu(e){const t=this.cacheSizeBytes!==void 0?we.withCacheSize(this.cacheSizeBytes):we.DEFAULT;return new ul(r=>Zr.fi(r,t),this.serializer)}}class Vs{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Rc(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=kg.bind(null,this.syncEngine),await cg(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new lg}()}createDatastore(e){const t=vi(e.databaseInfo.databaseId),r=function(o){return new Hm(o)}(e.databaseInfo);return function(o,a,u,h){return new Qm(o,a,u,h)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,o,a,u){return new Ym(r,i,o,a,u)}(this.localStore,this.datastore,e.asyncQueue,t=>Rc(this.syncEngine,t,0),function(){return vc.C()?new vc:new jm}())}createSyncEngine(e,t){return function(i,o,a,u,h,d,p){const y=new vg(i,o,a,u,h,d);return p&&(y.Au=!0),y}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const o=F(i);D(Dt,"RemoteStore shutting down."),o.Ta.add(5),await nr(o),o.Ea.shutdown(),o.da.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Vs.provider={build:()=>new Vs};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Og{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.vu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.vu(this.observer.error,e):Ke("Uncaught Error in snapshot listener:",e.toString()))}Cu(){this.muted=!0}vu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vt="FirestoreClient";class Lg{constructor(e,t,r,i,o){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=_e.UNAUTHENTICATED,this.clientId=Iu.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,async a=>{D(vt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(D(vt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new dt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=oo(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function cs(n,e){n.asyncQueue.verifyOperationInProgress(),D(vt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await ll(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Sc(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Mg(n);D(vt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Tc(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>Tc(e.remoteStore,i)),n._onlineComponents=e}async function Mg(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){D(vt,"Using user provided OfflineComponentProvider");try{await cs(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===C.FAILED_PRECONDITION||i.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;Zt("Error using user provided cache. Falling back to memory cache: "+t),await cs(n,new ti)}}else D(vt,"Using default OfflineComponentProvider"),await cs(n,new Ng(void 0));return n._offlineComponents}async function Cl(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(D(vt,"Using user provided OnlineComponentProvider"),await Sc(n,n._uninitializedComponentsProvider._online)):(D(vt,"Using default OnlineComponentProvider"),await Sc(n,new Vs))),n._onlineComponents}function xg(n){return Cl(n).then(e=>e.syncEngine)}async function Ug(n){const e=await Cl(n),t=e.eventManager;return t.onListen=Eg.bind(null,e.syncEngine),t.onUnlisten=wg.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Tg.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Ag.bind(null,e.syncEngine),t}function Fg(n,e,t={}){const r=new dt;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,u,h,d){const p=new Og({next:E=>{p.Cu(),a.enqueueAndForget(()=>dg(o,y));const S=E.docs.has(u);!S&&E.fromCache?d.reject(new O(C.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&E.fromCache&&h&&h.source==="server"?d.reject(new O(C.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(E)},error:E=>d.reject(E)}),y=new mg(Ws(u.path),p,{includeMetadataChanges:!0,La:!0});return hg(o,y)}(await Ug(n),n.asyncQueue,e,t,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bl(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cc=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bg(n,e,t){if(!t)throw new O(C.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function jg(n,e,t,r){if(e===!0&&r===!0)throw new O(C.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function bc(n){if(!L.isDocumentKey(n))throw new O(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function lo(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":x(12329,{type:typeof n})}function Nt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=lo(n);throw new O(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kl="firestore.googleapis.com",kc=!0;class Vc{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new O(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=kl,this.ssl=kc}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:kc;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=cl;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<fm)throw new O(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}jg("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=bl((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ho{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Vc({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Vc(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new $f;switch(r.type){case"firstParty":return new Wf(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new O(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Cc.get(t);r&&(D("ComponentProvider","Removing Datastore"),Cc.delete(t),r.terminate())}(this),Promise.resolve()}}function $g(n,e,t,r={}){var i;n=Nt(n,ho);const o=Yn(e),a=n._getSettings(),u=Object.assign(Object.assign({},a),{emulatorOptions:n._getEmulatorOptions()}),h=`${e}:${t}`;o&&(ou(`https://${h}`),au("Firestore",!0)),a.host!==kl&&a.host!==h&&Zt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const d=Object.assign(Object.assign({},a),{host:h,ssl:o,emulatorOptions:r});if(!ft(d,u)&&(n._setSettings(d),r.mockUserToken)){let p,y;if(typeof r.mockUserToken=="string")p=r.mockUserToken,y=_e.MOCK_USER;else{p=fd(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const E=r.mockUserToken.sub||r.mockUserToken.user_id;if(!E)throw new O(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");y=new _e(E)}n._authCredentials=new qf(new Eu(p,y))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new fo(this.firestore,e,this._query)}}class Se{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Kn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Se(this.firestore,e,this._key)}}class Kn extends fo{constructor(e,t,r){super(e,t,Ws(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Se(this.firestore,null,new L(e))}withConverter(e){return new Kn(this.firestore,e,this._path)}}function yv(n,e,...t){if(n=Ie(n),arguments.length===1&&(e=Iu.newId()),Bg("doc","path",e),n instanceof ho){const r=ee.fromString(e,...t);return bc(r),new Se(n,null,new L(r))}{if(!(n instanceof Se||n instanceof Kn))throw new O(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return bc(r),new Se(n.firestore,n instanceof Kn?n.converter:null,new L(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dc="AsyncQueue";class Nc{constructor(e=Promise.resolve()){this.zu=[],this.ju=!1,this.Hu=[],this.Ju=null,this.Yu=!1,this.Zu=!1,this.Xu=[],this.C_=new dl(this,"async_queue_retry"),this.ec=()=>{const r=as();r&&D(Dc,"Visibility state changed to "+r.visibilityState),this.C_.p_()},this.tc=e;const t=as();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.ec)}get isShuttingDown(){return this.ju}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.nc(),this.rc(e)}enterRestrictedMode(e){if(!this.ju){this.ju=!0,this.Zu=e||!1;const t=as();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.ec)}}enqueue(e){if(this.nc(),this.ju)return new Promise(()=>{});const t=new dt;return this.rc(()=>this.ju&&this.Zu?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.zu.push(e),this.sc()))}async sc(){if(this.zu.length!==0){try{await this.zu[0](),this.zu.shift(),this.C_.reset()}catch(e){if(!hn(e))throw e;D(Dc,"Operation failed with retryable error: "+e)}this.zu.length>0&&this.C_.f_(()=>this.sc())}}rc(e){const t=this.tc.then(()=>(this.Yu=!0,e().catch(r=>{throw this.Ju=r,this.Yu=!1,Ke("INTERNAL UNHANDLED ERROR: ",Oc(r)),r}).then(r=>(this.Yu=!1,r))));return this.tc=t,t}enqueueAfterDelay(e,t,r){this.nc(),this.Xu.indexOf(e)>-1&&(t=0);const i=so.createAndSchedule(this,e,t,r,o=>this.oc(o));return this.Hu.push(i),i}nc(){this.Ju&&x(47125,{_c:Oc(this.Ju)})}verifyOperationInProgress(){}async ac(){let e;do e=this.tc,await e;while(e!==this.tc)}uc(e){for(const t of this.Hu)if(t.timerId===e)return!0;return!1}cc(e){return this.ac().then(()=>{this.Hu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Hu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.ac()})}lc(e){this.Xu.push(e)}oc(e){const t=this.Hu.indexOf(e);this.Hu.splice(t,1)}}function Oc(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Ii extends ho{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new Nc,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Nc(e),this._firestoreClient=void 0,await e}}}function vv(n,e){const t=typeof n=="object"?n:lu(),r=typeof n=="string"?n:Wr,i=Fs(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const o=hd("firestore");o&&$g(i,...o)}return i}function Vl(n){if(n._terminated)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||qg(n),n._firestoreClient}function qg(n){var e,t,r;const i=n._freezeSettings(),o=function(u,h,d,p){return new ap(u,h,d,p.host,p.ssl,p.experimentalForceLongPolling,p.experimentalAutoDetectLongPolling,bl(p.experimentalLongPollingOptions),p.useFetchStreams,p.isUsingEmulator)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),n._firestoreClient=new Lg(n._authCredentials,n._appCheckCredentials,n._queue,o,n._componentsProvider&&function(u){const h=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(h),_online:h}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e){this._byteString=e}static fromBase64String(e){try{return new an(he.fromBase64String(e))}catch(t){throw new O(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new an(he.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new le(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return j(this._lat,e._lat)||j(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==i[o])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zg=/^__.*__$/;class Hg{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Tt(e,this.data,this.fieldMask,t,this.fieldTransforms):new er(e,this.data,t,this.fieldTransforms)}}class Dl{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Tt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Nl(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw x(40011,{hc:n})}}class Ri{constructor(e,t,r,i,o,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,o===void 0&&this.Pc(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get hc(){return this.settings.hc}Tc(e){return new Ri(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Ic(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Tc({path:r,Ec:!1});return i.dc(e),i}Ac(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Tc({path:r,Ec:!1});return i.Pc(),i}Rc(e){return this.Tc({path:void 0,Ec:!0})}Vc(e){return ni(e,this.settings.methodName,this.settings.mc||!1,this.path,this.settings.fc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Pc(){if(this.path)for(let e=0;e<this.path.length;e++)this.dc(this.path.get(e))}dc(e){if(e.length===0)throw this.Vc("Document fields must not be empty");if(Nl(this.hc)&&zg.test(e))throw this.Vc('Document fields cannot begin and end with "__"')}}class Wg{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||vi(e)}gc(e,t,r,i=!1){return new Ri({hc:e,methodName:t,fc:r,path:le.emptyPath(),Ec:!1,mc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ol(n){const e=n._freezeSettings(),t=vi(n._databaseId);return new Wg(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Gg(n,e,t,r,i,o={}){const a=n.gc(o.merge||o.mergeFields?2:0,e,t,i);_o("Data must be an object, but it was:",a,r);const u=Ll(r,a);let h,d;if(o.merge)h=new Pe(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){const p=[];for(const y of o.mergeFields){const E=Ds(e,y,t);if(!a.contains(E))throw new O(C.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);xl(p,E)||p.push(E)}h=new Pe(p),d=a.fieldTransforms.filter(y=>h.covers(y.field))}else h=null,d=a.fieldTransforms;return new Hg(new Ae(u),h,d)}class Pi extends Ai{_toFieldTransform(e){if(e.hc!==2)throw e.hc===1?e.Vc(`${this._methodName}() can only appear at the top level of your update data`):e.Vc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Pi}}function Kg(n,e,t){return new Ri({hc:3,fc:e.settings.fc,methodName:n._methodName,Ec:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class go extends Ai{constructor(e,t){super(e),this.yc=t}_toFieldTransform(e){const t=Kg(this,e,!0),r=this.yc.map(o=>ir(o,t)),i=new rn(r);return new Op(e.path,i)}isEqual(e){return e instanceof go&&ft(this.yc,e.yc)}}function Qg(n,e,t,r){const i=n.gc(1,e,t);_o("Data must be an object, but it was:",i,r);const o=[],a=Ae.empty();Et(r,(h,d)=>{const p=yo(e,h,t);d=Ie(d);const y=i.Ac(p);if(d instanceof Pi)o.push(p);else{const E=ir(d,y);E!=null&&(o.push(p),a.set(p,E))}});const u=new Pe(o);return new Dl(a,u,i.fieldTransforms)}function Jg(n,e,t,r,i,o){const a=n.gc(1,e,t),u=[Ds(e,r,t)],h=[i];if(o.length%2!=0)throw new O(C.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<o.length;E+=2)u.push(Ds(e,o[E])),h.push(o[E+1]);const d=[],p=Ae.empty();for(let E=u.length-1;E>=0;--E)if(!xl(d,u[E])){const S=u[E];let b=h[E];b=Ie(b);const N=a.Ac(S);if(b instanceof Pi)d.push(S);else{const V=ir(b,N);V!=null&&(d.push(S),p.set(S,V))}}const y=new Pe(d);return new Dl(p,y,a.fieldTransforms)}function ir(n,e){if(Ml(n=Ie(n)))return _o("Unsupported field value:",e,n),Ll(n,e);if(n instanceof Ai)return function(r,i){if(!Nl(i.hc))throw i.Vc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Vc(`${r._methodName}() is not currently supported inside arrays`);const o=r._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.Ec&&e.hc!==4)throw e.Vc("Nested arrays are not supported");return function(r,i){const o=[];let a=0;for(const u of r){let h=ir(u,i.Rc(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}}(n,e)}return function(r,i){if((r=Ie(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Vp(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const o=se.fromDate(r);return{timestampValue:Xr(i.serializer,o)}}if(r instanceof se){const o=new se(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Xr(i.serializer,o)}}if(r instanceof po)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof an)return{bytesValue:tl(i.serializer,r._byteString)};if(r instanceof Se){const o=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(o))throw i.Vc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:Js(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof mo)return function(a,u){return{mapValue:{fields:{[ku]:{stringValue:Vu},[Gr]:{arrayValue:{values:a.toArray().map(d=>{if(typeof d!="number")throw u.Vc("VectorValues must only contain numeric values.");return Gs(u.serializer,d)})}}}}}}(r,i);throw i.Vc(`Unsupported field value: ${lo(r)}`)}(n,e)}function Ll(n,e){const t={};return Au(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Et(n,(r,i)=>{const o=ir(i,e.Ic(r));o!=null&&(t[r]=o)}),{mapValue:{fields:t}}}function Ml(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof se||n instanceof po||n instanceof an||n instanceof Se||n instanceof Ai||n instanceof mo)}function _o(n,e,t){if(!Ml(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){const r=lo(t);throw r==="an object"?e.Vc(n+" a custom object"):e.Vc(n+" "+r)}}function Ds(n,e,t){if((e=Ie(e))instanceof wi)return e._internalPath;if(typeof e=="string")return yo(n,e);throw ni("Field path arguments must be of type string or ",n,!1,void 0,t)}const Yg=new RegExp("[~\\*/\\[\\]]");function yo(n,e,t){if(e.search(Yg)>=0)throw ni(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new wi(...e.split("."))._internalPath}catch{throw ni(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function ni(n,e,t,r,i){const o=r&&!r.isEmpty(),a=i!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${r}`),a&&(h+=` in document ${i}`),h+=")"),new O(C.INVALID_ARGUMENT,u+n+h)}function xl(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ul{constructor(e,t,r,i,o){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new Se(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Xg(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Fl("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Xg extends Ul{data(){return super.data()}}function Fl(n,e){return typeof e=="string"?yo(n,e):e instanceof wi?e._internalPath:e._delegate._internalPath}class Zg{convertValue(e,t="none"){switch(_t(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ne(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(gt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw x(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Et(e,(i,o)=>{r[i]=this.convertValue(o,t)}),r}convertVectorValue(e){var t,r,i;const o=(i=(r=(t=e.fields)===null||t===void 0?void 0:t[Gr].arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(a=>ne(a.doubleValue));return new mo(o)}convertGeoPoint(e){return new po(ne(e.latitude),ne(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=di(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(zn(e));default:return null}}convertTimestamp(e){const t=mt(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ee.fromString(e);K(al(r),9688,{name:e});const i=new Hn(r.get(1),r.get(3)),o=new L(r.popFirst(5));return i.isEqual(t)||Ke(`Document ${o} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function e_(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t_{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Bl extends Ul{constructor(e,t,r,i,o,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=o}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new n_(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Fl("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class n_ extends Bl{data(e={}){return super.data(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ev(n){n=Nt(n,Se);const e=Nt(n.firestore,Ii);return Fg(Vl(e),n._key).then(t=>i_(e,n,t))}class r_ extends Zg{constructor(e){super(),this.firestore=e}convertBytes(e){return new an(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Se(this.firestore,null,t)}}function Tv(n,e,t){n=Nt(n,Se);const r=Nt(n.firestore,Ii),i=e_(n.converter,e,t);return jl(r,[Gg(Ol(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Le.none())])}function Iv(n,e,t,...r){n=Nt(n,Se);const i=Nt(n.firestore,Ii),o=Ol(i);let a;return a=typeof(e=Ie(e))=="string"||e instanceof wi?Jg(o,"updateDoc",n._key,e,t,r):Qg(o,"updateDoc",n._key,e),jl(i,[a.toMutation(n._key,Le.exists(!0))])}function jl(n,e){return function(r,i){const o=new dt;return r.asyncQueue.enqueueAndForget(async()=>Rg(await xg(r),i,o)),o.promise}(Vl(n),e)}function i_(n,e,t){const r=t.docs.get(e._key),i=new r_(n);return new Bl(n,i,e._key,r,new t_(t.hasPendingWrites,t.fromCache),e.converter)}function wv(...n){return new go("arrayUnion",n)}(function(e,t=!0){(function(i){un=i})(cn),Xt(new kt("firestore",(r,{instanceIdentifier:i,options:o})=>{const a=r.getProvider("app").getImmediate(),u=new Ii(new zf(r.getProvider("auth-internal")),new Gf(a,r.getProvider("app-check-internal")),function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new O(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Hn(d.options.projectId,p)}(a,i),a);return o=Object.assign({useFetchStreams:t},o),u._setSettings(o),u},"PUBLIC").setMultipleInstances(!0)),lt(Ba,ja,e),lt(Ba,ja,"esm2017")})();var s_="firebase",o_="11.8.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */lt(s_,o_,"app");function vo(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function $l(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const a_=$l,ql=new Xn("auth","Firebase",$l());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ri=new xs("@firebase/auth");function c_(n,...e){ri.logLevel<=q.WARN&&ri.warn(`Auth (${cn}): ${n}`,...e)}function Fr(n,...e){ri.logLevel<=q.ERROR&&ri.error(`Auth (${cn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function De(n,...e){throw Eo(n,...e)}function xe(n,...e){return Eo(n,...e)}function zl(n,e,t){const r=Object.assign(Object.assign({},a_()),{[e]:t});return new Xn("auth","Firebase",r).create(e,{appName:n.name})}function We(n){return zl(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Eo(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return ql.create(n,...e)}function M(n,e,...t){if(!n)throw Eo(e,...t)}function ze(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Fr(e),new Error(e)}function Je(n,e){n||ze(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ns(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function u_(){return Lc()==="http:"||Lc()==="https:"}function Lc(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(u_()||vd()||"connection"in navigator)?navigator.onLine:!0}function h_(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sr{constructor(e,t){this.shortDelay=e,this.longDelay=t,Je(t>e,"Short delay should be less than long delay!"),this.isMobile=gd()||Ed()}get(){return l_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function To(n,e){Je(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ze("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ze("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ze("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],p_=new sr(3e4,6e4);function It(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function wt(n,e,t,r,i={}){return Wl(n,i,async()=>{let o={},a={};r&&(e==="GET"?a=r:o={body:JSON.stringify(r)});const u=Zn(Object.assign({key:n.config.apiKey},a)).slice(1),h=await n._getAdditionalHeaders();h["Content-Type"]="application/json",n.languageCode&&(h["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:h},o);return yd()||(d.referrerPolicy="no-referrer"),n.emulatorConfig&&Yn(n.emulatorConfig.host)&&(d.credentials="include"),Hl.fetch()(await Gl(n,n.config.apiHost,t,u),d)})}async function Wl(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},d_),e);try{const i=new g_(n),o=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await o.json();if("needConfirmation"in a)throw Nr(n,"account-exists-with-different-credential",a);if(o.ok&&!("errorMessage"in a))return a;{const u=o.ok?a.errorMessage:a.error.message,[h,d]=u.split(" : ");if(h==="FEDERATED_USER_ID_ALREADY_LINKED")throw Nr(n,"credential-already-in-use",a);if(h==="EMAIL_EXISTS")throw Nr(n,"email-already-in-use",a);if(h==="USER_DISABLED")throw Nr(n,"user-disabled",a);const p=r[h]||h.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw zl(n,p,d);De(n,p)}}catch(i){if(i instanceof Ye)throw i;De(n,"network-request-failed",{message:String(i)})}}async function or(n,e,t,r,i={}){const o=await wt(n,e,t,r,i);return"mfaPendingCredential"in o&&De(n,"multi-factor-auth-required",{_serverResponse:o}),o}async function Gl(n,e,t,r){const i=`${e}${t}?${r}`,o=n,a=o.config.emulator?To(n.config,i):`${n.config.apiScheme}://${i}`;return f_.includes(t)&&(await o._persistenceManagerAvailable,o._getPersistenceType()==="COOKIE")?o._getPersistence()._getFinalTarget(a).toString():a}function m_(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class g_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(xe(this.auth,"network-request-failed")),p_.get())})}}function Nr(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=xe(n,e,r);return i.customData._tokenResponse=t,i}function Mc(n){return n!==void 0&&n.enterprise!==void 0}class __{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return m_(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function y_(n,e){return wt(n,"GET","/v2/recaptchaConfig",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function v_(n,e){return wt(n,"POST","/v1/accounts:delete",e)}async function ii(n,e){return wt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function E_(n,e=!1){const t=Ie(n),r=await t.getIdToken(e),i=Io(r);M(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const o=typeof i.firebase=="object"?i.firebase:void 0,a=o==null?void 0:o.sign_in_provider;return{claims:i,token:r,authTime:jn(us(i.auth_time)),issuedAtTime:jn(us(i.iat)),expirationTime:jn(us(i.exp)),signInProvider:a||null,signInSecondFactor:(o==null?void 0:o.sign_in_second_factor)||null}}function us(n){return Number(n)*1e3}function Io(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Fr("JWT malformed, contained fewer than 3 sections"),null;try{const i=nu(t);return i?JSON.parse(i):(Fr("Failed to decode base64 JWT payload"),null)}catch(i){return Fr("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function xc(n){const e=Io(n);return M(e,"internal-error"),M(typeof e.exp<"u","internal-error"),M(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qn(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ye&&T_(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function T_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=jn(this.lastLoginAt),this.creationTime=jn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function si(n){var e;const t=n.auth,r=await n.getIdToken(),i=await Qn(n,ii(t,{idToken:r}));M(i==null?void 0:i.users.length,t,"internal-error");const o=i.users[0];n._notifyReloadListener(o);const a=!((e=o.providerUserInfo)===null||e===void 0)&&e.length?Kl(o.providerUserInfo):[],u=A_(n.providerData,a),h=n.isAnonymous,d=!(n.email&&o.passwordHash)&&!(u!=null&&u.length),p=h?d:!1,y={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:u,metadata:new Os(o.createdAt,o.lastLoginAt),isAnonymous:p};Object.assign(n,y)}async function w_(n){const e=Ie(n);await si(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function A_(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Kl(n){return n.map(e=>{var{providerId:t}=e,r=vo(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function R_(n,e){const t=await Wl(n,{},async()=>{const r=Zn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:o}=n.config,a=await Gl(n,i,"/v1/token",`key=${o}`),u=await n._getAdditionalHeaders();return u["Content-Type"]="application/x-www-form-urlencoded",Hl.fetch()(a,{method:"POST",headers:u,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function P_(n,e){return wt(n,"POST","/v2/accounts:revokeToken",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){M(e.idToken,"internal-error"),M(typeof e.idToken<"u","internal-error"),M(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):xc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){M(e.length!==0,"internal-error");const t=xc(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(M(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:o}=await R_(e,t);this.updateTokensAndExpiration(r,i,Number(o))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:o}=t,a=new Qt;return r&&(M(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(M(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),o&&(M(typeof o=="number","internal-error",{appName:e}),a.expirationTime=o),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Qt,this.toJSON())}_performRefresh(){return ze("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nt(n,e){M(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ve{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,o=vo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new I_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=o.displayName||null,this.email=o.email||null,this.emailVerified=o.emailVerified||!1,this.phoneNumber=o.phoneNumber||null,this.photoURL=o.photoURL||null,this.isAnonymous=o.isAnonymous||!1,this.tenantId=o.tenantId||null,this.providerData=o.providerData?[...o.providerData]:[],this.metadata=new Os(o.createdAt||void 0,o.lastLoginAt||void 0)}async getIdToken(e){const t=await Qn(this,this.stsTokenManager.getToken(this.auth,e));return M(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return E_(this,e)}reload(){return w_(this)}_assign(e){this!==e&&(M(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ve(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){M(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await si(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(be(this.auth.app))return Promise.reject(We(this.auth));const e=await this.getIdToken();return await Qn(this,v_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,o,a,u,h,d,p;const y=(r=t.displayName)!==null&&r!==void 0?r:void 0,E=(i=t.email)!==null&&i!==void 0?i:void 0,S=(o=t.phoneNumber)!==null&&o!==void 0?o:void 0,b=(a=t.photoURL)!==null&&a!==void 0?a:void 0,N=(u=t.tenantId)!==null&&u!==void 0?u:void 0,V=(h=t._redirectEventId)!==null&&h!==void 0?h:void 0,W=(d=t.createdAt)!==null&&d!==void 0?d:void 0,B=(p=t.lastLoginAt)!==null&&p!==void 0?p:void 0,{uid:$,emailVerified:Y,isAnonymous:Ce,providerData:te,stsTokenManager:T}=t;M($&&T,e,"internal-error");const m=Qt.fromJSON(this.name,T);M(typeof $=="string",e,"internal-error"),nt(y,e.name),nt(E,e.name),M(typeof Y=="boolean",e,"internal-error"),M(typeof Ce=="boolean",e,"internal-error"),nt(S,e.name),nt(b,e.name),nt(N,e.name),nt(V,e.name),nt(W,e.name),nt(B,e.name);const _=new Ve({uid:$,auth:e,email:E,emailVerified:Y,displayName:y,isAnonymous:Ce,photoURL:b,phoneNumber:S,tenantId:N,stsTokenManager:m,createdAt:W,lastLoginAt:B});return te&&Array.isArray(te)&&(_.providerData=te.map(v=>Object.assign({},v))),V&&(_._redirectEventId=V),_}static async _fromIdTokenResponse(e,t,r=!1){const i=new Qt;i.updateFromServerResponse(t);const o=new Ve({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await si(o),o}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];M(i.localId!==void 0,"internal-error");const o=i.providerUserInfo!==void 0?Kl(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(o!=null&&o.length),u=new Qt;u.updateFromIdToken(r);const h=new Ve({uid:i.localId,auth:e,stsTokenManager:u,isAnonymous:a}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new Os(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(o!=null&&o.length)};return Object.assign(h,d),h}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uc=new Map;function He(n){Je(n instanceof Function,"Expected a class definition");let e=Uc.get(n);return e?(Je(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Uc.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ql{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Ql.type="NONE";const Fc=Ql;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Br(n,e,t){return`firebase:${n}:${e}:${t}`}class Jt{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:o}=this.auth;this.fullUserKey=Br(this.userKey,i.apiKey,o),this.fullPersistenceKey=Br("persistence",i.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await ii(this.auth,{idToken:e}).catch(()=>{});return t?Ve._fromGetAccountInfoResponse(this.auth,t,e):null}return Ve._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Jt(He(Fc),e,r);const i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let o=i[0]||He(Fc);const a=Br(r,e.config.apiKey,e.name);let u=null;for(const d of t)try{const p=await d._get(a);if(p){let y;if(typeof p=="string"){const E=await ii(e,{idToken:p}).catch(()=>{});if(!E)break;y=await Ve._fromGetAccountInfoResponse(e,E,p)}else y=Ve._fromJSON(e,p);d!==o&&(u=y),o=d;break}}catch{}const h=i.filter(d=>d._shouldAllowMigration);return!o._shouldAllowMigration||!h.length?new Jt(o,e,r):(o=h[0],u&&await o._set(a,u.toJSON()),await Promise.all(t.map(async d=>{if(d!==o)try{await d._remove(a)}catch{}})),new Jt(o,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bc(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Zl(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Jl(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(th(e))return"Blackberry";if(nh(e))return"Webos";if(Yl(e))return"Safari";if((e.includes("chrome/")||Xl(e))&&!e.includes("edge/"))return"Chrome";if(eh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Jl(n=ve()){return/firefox\//i.test(n)}function Yl(n=ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Xl(n=ve()){return/crios\//i.test(n)}function Zl(n=ve()){return/iemobile/i.test(n)}function eh(n=ve()){return/android/i.test(n)}function th(n=ve()){return/blackberry/i.test(n)}function nh(n=ve()){return/webos/i.test(n)}function wo(n=ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function S_(n=ve()){var e;return wo(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function C_(){return Td()&&document.documentMode===10}function rh(n=ve()){return wo(n)||eh(n)||nh(n)||th(n)||/windows phone/i.test(n)||Zl(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ih(n,e=[]){let t;switch(n){case"Browser":t=Bc(ve());break;case"Worker":t=`${Bc(ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${cn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=o=>new Promise((a,u)=>{try{const h=e(o);a(h)}catch(h){u(h)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k_(n,e={}){return wt(n,"GET","/v2/passwordPolicy",It(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V_=6;class D_{constructor(e){var t,r,i,o;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:V_,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!==null&&o!==void 0?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,o,a,u;const h={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,h),this.validatePasswordCharacterOptions(e,h),h.isValid&&(h.isValid=(t=h.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),h.isValid&&(h.isValid=(r=h.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),h.isValid&&(h.isValid=(i=h.containsLowercaseLetter)!==null&&i!==void 0?i:!0),h.isValid&&(h.isValid=(o=h.containsUppercaseLetter)!==null&&o!==void 0?o:!0),h.isValid&&(h.isValid=(a=h.containsNumericCharacter)!==null&&a!==void 0?a:!0),h.isValid&&(h.isValid=(u=h.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),h}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N_{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new jc(this),this.idTokenSubscription=new jc(this),this.beforeStateQueue=new b_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ql,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(o=>this._resolvePersistenceManagerAvailable=o)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=He(t)),this._initializationPromise=this.queue(async()=>{var r,i,o;if(!this._deleted&&(this.persistenceManager=await Jt.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((o=this.currentUser)===null||o===void 0?void 0:o.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await ii(this,{idToken:e}),r=await Ve._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(be(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(u,u))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,o=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,u=i==null?void 0:i._redirectEventId,h=await this.tryRedirectSignIn(e);(!a||a===u)&&(h!=null&&h.user)&&(i=h.user,o=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(o)try{await this.beforeStateQueue.runMiddleware(i)}catch(a){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return M(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await si(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=h_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(be(this.app))return Promise.reject(We(this));const t=e?Ie(e):null;return t&&M(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&M(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return be(this.app)?Promise.reject(We(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return be(this.app)?Promise.reject(We(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(He(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await k_(this),t=new D_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Xn("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await P_(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&He(e)||this._popupRedirectResolver;M(t,this,"argument-error"),this.redirectPersistenceManager=await Jt.create(this,[He(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const o=typeof t=="function"?t:t.next.bind(t);let a=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(M(u,this,"internal-error"),u.then(()=>{a||o(this.currentUser)}),typeof t=="function"){const h=e.addObserver(t,r,i);return()=>{a=!0,h()}}else{const h=e.addObserver(t);return()=>{a=!0,h()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return M(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ih(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;if(be(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&c_(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Ut(n){return Ie(n)}class jc{constructor(e){this.auth=e,this.observer=null,this.addObserver=bd(t=>this.observer=t)}get next(){return M(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Si={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function O_(n){Si=n}function sh(n){return Si.loadJS(n)}function L_(){return Si.recaptchaEnterpriseScript}function M_(){return Si.gapiScript}function x_(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class U_{constructor(){this.enterprise=new F_}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class F_{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const B_="recaptcha-enterprise",oh="NO_RECAPTCHA";class j_{constructor(e){this.type=B_,this.auth=Ut(e)}async verify(e="verify",t=!1){async function r(o){if(!t){if(o.tenantId==null&&o._agentRecaptchaConfig!=null)return o._agentRecaptchaConfig.siteKey;if(o.tenantId!=null&&o._tenantRecaptchaConfigs[o.tenantId]!==void 0)return o._tenantRecaptchaConfigs[o.tenantId].siteKey}return new Promise(async(a,u)=>{y_(o,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(h=>{if(h.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{const d=new __(h);return o.tenantId==null?o._agentRecaptchaConfig=d:o._tenantRecaptchaConfigs[o.tenantId]=d,a(d.siteKey)}}).catch(h=>{u(h)})})}function i(o,a,u){const h=window.grecaptcha;Mc(h)?h.enterprise.ready(()=>{h.enterprise.execute(o,{action:e}).then(d=>{a(d)}).catch(()=>{a(oh)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new U_().execute("siteKey",{action:"verify"}):new Promise((o,a)=>{r(this.auth).then(u=>{if(!t&&Mc(window.grecaptcha))i(u,o,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let h=L_();h.length!==0&&(h+=u),sh(h).then(()=>{i(u,o,a)}).catch(d=>{a(d)})}}).catch(u=>{a(u)})})}}async function $c(n,e,t,r=!1,i=!1){const o=new j_(n);let a;if(i)a=oh;else try{a=await o.verify(t)}catch{a=await o.verify(t,!0)}const u=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){const h=u.phoneEnrollmentInfo.phoneNumber,d=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:h,recaptchaToken:d,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){const h=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:h,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return r?Object.assign(u,{captchaResp:a}):Object.assign(u,{captchaResponse:a}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function Ls(n,e,t,r,i){var o;if(!((o=n._getRecaptchaConfig())===null||o===void 0)&&o.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await $c(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=await $c(n,e,t,t==="getOobCode");return r(n,u)}else return Promise.reject(a)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $_(n,e){const t=Fs(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),o=t.getOptions();if(ft(o,e??{}))return i;De(i,"already-initialized")}return t.initialize({options:e})}function q_(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(He);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function z_(n,e,t){const r=Ut(n);M(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,o=ah(e),{host:a,port:u}=H_(e),h=u===null?"":`:${u}`,d={url:`${o}//${a}${h}/`},p=Object.freeze({host:a,port:u,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){M(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),M(ft(d,r.config.emulator)&&ft(p,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=d,r.emulatorConfig=p,r.settings.appVerificationDisabledForTesting=!0,Yn(a)?(ou(`${o}//${a}${h}`),au("Auth",!0)):W_()}function ah(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function H_(n){const e=ah(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const o=i[1];return{host:o,port:qc(r.substr(o.length+1))}}else{const[o,a]=r.split(":");return{host:o,port:qc(a)}}}function qc(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function W_(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ao{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ze("not implemented")}_getIdTokenResponse(e){return ze("not implemented")}_linkToIdToken(e,t){return ze("not implemented")}_getReauthenticationResolver(e){return ze("not implemented")}}async function G_(n,e){return wt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function K_(n,e){return or(n,"POST","/v1/accounts:signInWithPassword",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q_(n,e){return or(n,"POST","/v1/accounts:signInWithEmailLink",It(n,e))}async function J_(n,e){return or(n,"POST","/v1/accounts:signInWithEmailLink",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jn extends Ao{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Jn(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Jn(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ls(e,t,"signInWithPassword",K_);case"emailLink":return Q_(e,{email:this._email,oobCode:this._password});default:De(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ls(e,r,"signUpPassword",G_);case"emailLink":return J_(e,{idToken:t,email:this._email,oobCode:this._password});default:De(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yt(n,e){return or(n,"POST","/v1/accounts:signInWithIdp",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y_="http://localhost";class Ot extends Ao{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Ot(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):De("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,o=vo(t,["providerId","signInMethod"]);if(!r||!i)return null;const a=new Ot(r,i);return a.idToken=o.idToken||void 0,a.accessToken=o.accessToken||void 0,a.secret=o.secret,a.nonce=o.nonce,a.pendingToken=o.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Yt(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Yt(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Yt(e,t)}buildRequest(){const e={requestUri:Y_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Zn(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function X_(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Z_(n){const e=Vn(Dn(n)).link,t=e?Vn(Dn(e)).deep_link_id:null,r=Vn(Dn(n)).deep_link_id;return(r?Vn(Dn(r)).link:null)||r||t||e||n}class Ro{constructor(e){var t,r,i,o,a,u;const h=Vn(Dn(e)),d=(t=h.apiKey)!==null&&t!==void 0?t:null,p=(r=h.oobCode)!==null&&r!==void 0?r:null,y=X_((i=h.mode)!==null&&i!==void 0?i:null);M(d&&p&&y,"argument-error"),this.apiKey=d,this.operation=y,this.code=p,this.continueUrl=(o=h.continueUrl)!==null&&o!==void 0?o:null,this.languageCode=(a=h.lang)!==null&&a!==void 0?a:null,this.tenantId=(u=h.tenantId)!==null&&u!==void 0?u:null}static parseLink(e){const t=Z_(e);try{return new Ro(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(){this.providerId=fn.PROVIDER_ID}static credential(e,t){return Jn._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Ro.parseLink(t);return M(r,"argument-error"),Jn._fromEmailAndCode(e,r.code,r.tenantId)}}fn.PROVIDER_ID="password";fn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";fn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar extends ch{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt extends ar{constructor(){super("facebook.com")}static credential(e){return Ot._fromParams({providerId:rt.PROVIDER_ID,signInMethod:rt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return rt.credentialFromTaggedObject(e)}static credentialFromError(e){return rt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return rt.credential(e.oauthAccessToken)}catch{return null}}}rt.FACEBOOK_SIGN_IN_METHOD="facebook.com";rt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it extends ar{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Ot._fromParams({providerId:it.PROVIDER_ID,signInMethod:it.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return it.credentialFromTaggedObject(e)}static credentialFromError(e){return it.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return it.credential(t,r)}catch{return null}}}it.GOOGLE_SIGN_IN_METHOD="google.com";it.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st extends ar{constructor(){super("github.com")}static credential(e){return Ot._fromParams({providerId:st.PROVIDER_ID,signInMethod:st.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return st.credentialFromTaggedObject(e)}static credentialFromError(e){return st.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return st.credential(e.oauthAccessToken)}catch{return null}}}st.GITHUB_SIGN_IN_METHOD="github.com";st.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot extends ar{constructor(){super("twitter.com")}static credential(e,t){return Ot._fromParams({providerId:ot.PROVIDER_ID,signInMethod:ot.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ot.credentialFromTaggedObject(e)}static credentialFromError(e){return ot.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ot.credential(t,r)}catch{return null}}}ot.TWITTER_SIGN_IN_METHOD="twitter.com";ot.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ey(n,e){return or(n,"POST","/v1/accounts:signUp",It(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const o=await Ve._fromIdTokenResponse(e,r,i),a=zc(r);return new Lt({user:o,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=zc(r);return new Lt({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function zc(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oi extends Ye{constructor(e,t,r,i){var o;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,oi.prototype),this.customData={appName:e.name,tenantId:(o=e.tenantId)!==null&&o!==void 0?o:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new oi(e,t,r,i)}}function uh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(o=>{throw o.code==="auth/multi-factor-auth-required"?oi._fromErrorAndOperation(n,o,e,r):o})}async function ty(n,e,t=!1){const r=await Qn(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Lt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ny(n,e,t=!1){const{auth:r}=n;if(be(r.app))return Promise.reject(We(r));const i="reauthenticate";try{const o=await Qn(n,uh(r,i,e,n),t);M(o.idToken,r,"internal-error");const a=Io(o.idToken);M(a,r,"internal-error");const{sub:u}=a;return M(n.uid===u,r,"user-mismatch"),Lt._forOperation(n,i,o)}catch(o){throw(o==null?void 0:o.code)==="auth/user-not-found"&&De(r,"user-mismatch"),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lh(n,e,t=!1){if(be(n.app))return Promise.reject(We(n));const r="signIn",i=await uh(n,r,e),o=await Lt._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(o.user),o}async function ry(n,e){return lh(Ut(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hh(n){const e=Ut(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function Av(n,e,t){if(be(n.app))return Promise.reject(We(n));const r=Ut(n),a=await Ls(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ey).catch(h=>{throw h.code==="auth/password-does-not-meet-requirements"&&hh(n),h}),u=await Lt._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(u.user),u}function Rv(n,e,t){return be(n.app)?Promise.reject(We(n)):ry(Ie(n),fn.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&hh(n),r})}function iy(n,e,t,r){return Ie(n).onIdTokenChanged(e,t,r)}function sy(n,e,t){return Ie(n).beforeAuthStateChanged(e,t)}function Pv(n){return Ie(n).signOut()}const ai="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dh{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ai,"1"),this.storage.removeItem(ai),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oy=1e3,ay=10;class fh extends dh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=rh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,u,h)=>{this.notifyListeners(a,h)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},o=this.storage.getItem(r);C_()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,ay):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},oy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}fh.type="LOCAL";const cy=fh;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ph extends dh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}ph.type="SESSION";const mh=ph;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uy(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ci{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Ci(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:o}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const u=Array.from(a).map(async d=>d(t.origin,o)),h=await uy(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:h})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ci.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Po(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ly{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let o,a;return new Promise((u,h)=>{const d=Po("",20);i.port1.start();const p=setTimeout(()=>{h(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(y){const E=y;if(E.data.eventId===d)switch(E.data.status){case"ack":clearTimeout(p),o=setTimeout(()=>{h(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),u(E.data.response);break;default:clearTimeout(p),clearTimeout(o),h(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ue(){return window}function hy(n){Ue().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gh(){return typeof Ue().WorkerGlobalScope<"u"&&typeof Ue().importScripts=="function"}async function dy(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function fy(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function py(){return gh()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _h="firebaseLocalStorageDb",my=1,ci="firebaseLocalStorage",yh="fbase_key";class cr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function bi(n,e){return n.transaction([ci],e?"readwrite":"readonly").objectStore(ci)}function gy(){const n=indexedDB.deleteDatabase(_h);return new cr(n).toPromise()}function Ms(){const n=indexedDB.open(_h,my);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(ci,{keyPath:yh})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(ci)?e(r):(r.close(),await gy(),e(await Ms()))})})}async function Hc(n,e,t){const r=bi(n,!0).put({[yh]:e,value:t});return new cr(r).toPromise()}async function _y(n,e){const t=bi(n,!1).get(e),r=await new cr(t).toPromise();return r===void 0?null:r.value}function Wc(n,e){const t=bi(n,!0).delete(e);return new cr(t).toPromise()}const yy=800,vy=3;class vh{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ms(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>vy)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return gh()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ci._getInstance(py()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await dy(),!this.activeServiceWorker)return;this.sender=new ly(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||fy()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ms();return await Hc(e,ai,"1"),await Wc(e,ai),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Hc(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>_y(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Wc(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const o=bi(i,!1).getAll();return new cr(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:o}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(o)&&(this.notifyListeners(i,o),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),yy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}vh.type="LOCAL";const Ey=vh;new sr(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ty(n,e){return e?He(e):(M(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class So extends Ao{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Yt(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Yt(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Yt(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Iy(n){return lh(n.auth,new So(n),n.bypassAuthState)}function wy(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),ny(t,new So(n),n.bypassAuthState)}async function Ay(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),ty(t,new So(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eh{constructor(e,t,r,i,o=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=o,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:o,error:a,type:u}=e;if(a){this.reject(a);return}const h={auth:this.auth,requestUri:t,sessionId:r,tenantId:o||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(h))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Iy;case"linkViaPopup":case"linkViaRedirect":return Ay;case"reauthViaPopup":case"reauthViaRedirect":return wy;default:De(this.auth,"internal-error")}}resolve(e){Je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ry=new sr(2e3,1e4);class Gt extends Eh{constructor(e,t,r,i,o){super(e,t,i,o),this.provider=r,this.authWindow=null,this.pollId=null,Gt.currentPopupAction&&Gt.currentPopupAction.cancel(),Gt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return M(e,this.auth,"internal-error"),e}async onExecution(){Je(this.filter.length===1,"Popup operations only handle one event");const e=Po();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(xe(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(xe(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Gt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(xe(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Ry.get())};e()}}Gt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Py="pendingRedirect",jr=new Map;class Sy extends Eh{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=jr.get(this.auth._key());if(!e){try{const r=await Cy(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}jr.set(this.auth._key(),e)}return this.bypassAuthState||jr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Cy(n,e){const t=Vy(e),r=ky(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function by(n,e){jr.set(n._key(),e)}function ky(n){return He(n._redirectPersistence)}function Vy(n){return Br(Py,n.config.apiKey,n.name)}async function Dy(n,e,t=!1){if(be(n.app))return Promise.reject(We(n));const r=Ut(n),i=Ty(r,e),a=await new Sy(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ny=10*60*1e3;class Oy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ly(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Th(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(xe(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ny&&this.cachedEventUids.clear(),this.cachedEventUids.has(Gc(e))}saveEventToCache(e){this.cachedEventUids.add(Gc(e)),this.lastProcessedEventTime=Date.now()}}function Gc(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Th({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ly(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Th(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function My(n,e={}){return wt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Uy=/^https?/;async function Fy(n){if(n.config.emulator)return;const{authorizedDomains:e}=await My(n);for(const t of e)try{if(By(t))return}catch{}De(n,"unauthorized-domain")}function By(n){const e=Ns(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Uy.test(t))return!1;if(xy.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jy=new sr(3e4,6e4);function Kc(){const n=Ue().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function $y(n){return new Promise((e,t)=>{var r,i,o;function a(){Kc(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Kc(),t(xe(n,"network-request-failed"))},timeout:jy.get()})}if(!((i=(r=Ue().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((o=Ue().gapi)===null||o===void 0)&&o.load)a();else{const u=x_("iframefcb");return Ue()[u]=()=>{gapi.load?a():t(xe(n,"network-request-failed"))},sh(`${M_()}?onload=${u}`).catch(h=>t(h))}}).catch(e=>{throw $r=null,e})}let $r=null;function qy(n){return $r=$r||$y(n),$r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zy=new sr(5e3,15e3),Hy="__/auth/iframe",Wy="emulator/auth/iframe",Gy={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ky=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Qy(n){const e=n.config;M(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?To(e,Wy):`https://${n.config.authDomain}/${Hy}`,r={apiKey:e.apiKey,appName:n.name,v:cn},i=Ky.get(n.config.apiHost);i&&(r.eid=i);const o=n._getFrameworks();return o.length&&(r.fw=o.join(",")),`${t}?${Zn(r).slice(1)}`}async function Jy(n){const e=await qy(n),t=Ue().gapi;return M(t,n,"internal-error"),e.open({where:document.body,url:Qy(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Gy,dontclear:!0},r=>new Promise(async(i,o)=>{await r.restyle({setHideOnLeave:!1});const a=xe(n,"network-request-failed"),u=Ue().setTimeout(()=>{o(a)},zy.get());function h(){Ue().clearTimeout(u),i(r)}r.ping(h).then(h,()=>{o(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yy={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Xy=500,Zy=600,ev="_blank",tv="http://localhost";class Qc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function nv(n,e,t,r=Xy,i=Zy){const o=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let u="";const h=Object.assign(Object.assign({},Yy),{width:r.toString(),height:i.toString(),top:o,left:a}),d=ve().toLowerCase();t&&(u=Xl(d)?ev:t),Jl(d)&&(e=e||tv,h.scrollbars="yes");const p=Object.entries(h).reduce((E,[S,b])=>`${E}${S}=${b},`,"");if(S_(d)&&u!=="_self")return rv(e||"",u),new Qc(null);const y=window.open(e||"",u,p);M(y,n,"popup-blocked");try{y.focus()}catch{}return new Qc(y)}function rv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iv="__/auth/handler",sv="emulator/auth/handler",ov=encodeURIComponent("fac");async function Jc(n,e,t,r,i,o){M(n.config.authDomain,n,"auth-domain-config-required"),M(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:cn,eventId:i};if(e instanceof ch){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Cd(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,y]of Object.entries({}))a[p]=y}if(e instanceof ar){const p=e.getScopes().filter(y=>y!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);const u=a;for(const p of Object.keys(u))u[p]===void 0&&delete u[p];const h=await n._getAppCheckToken(),d=h?`#${ov}=${encodeURIComponent(h)}`:"";return`${av(n)}?${Zn(u).slice(1)}${d}`}function av({config:n}){return n.emulator?To(n,sv):`https://${n.authDomain}/${iv}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls="webStorageSupport";class cv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=mh,this._completeRedirectFn=Dy,this._overrideRedirectResult=by}async _openPopup(e,t,r,i){var o;Je((o=this.eventManagers[e._key()])===null||o===void 0?void 0:o.manager,"_initialize() not called before _openPopup()");const a=await Jc(e,t,r,Ns(),i);return nv(e,a,Po())}async _openRedirect(e,t,r,i){await this._originValidation(e);const o=await Jc(e,t,r,Ns(),i);return hy(o),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:o}=this.eventManagers[t];return i?Promise.resolve(i):(Je(o,"If manager is not set, promise should be"),o)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Jy(e),r=new Oy(e);return t.register("authEvent",i=>(M(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ls,{type:ls},i=>{var o;const a=(o=i==null?void 0:i[0])===null||o===void 0?void 0:o[ls];a!==void 0&&t(!!a),De(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Fy(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return rh()||Yl()||wo()}}const uv=cv;var Yc="@firebase/auth",Xc="1.10.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){M(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hv(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function dv(n){Xt(new kt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:a,authDomain:u}=r.options;M(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const h={apiKey:a,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ih(n)},d=new N_(r,i,o,h);return q_(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Xt(new kt("auth-internal",e=>{const t=Ut(e.getProvider("auth").getImmediate());return(r=>new lv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),lt(Yc,Xc,hv(n)),lt(Yc,Xc,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fv=5*60,pv=su("authIdTokenMaxAge")||fv;let Zc=null;const mv=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>pv)return;const i=t==null?void 0:t.token;Zc!==i&&(Zc=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Sv(n=lu()){const e=Fs(n,"auth");if(e.isInitialized())return e.getImmediate();const t=$_(n,{popupRedirectResolver:uv,persistence:[Ey,cy,mh]}),r=su("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const o=new URL(r,location.origin);if(location.origin===o.origin){const a=mv(o.toString());sy(t,a,()=>a(t.currentUser)),iy(t,u=>a(u))}}const i=ru("auth");return i&&z_(t,`http://${i}`),t}function gv(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}O_({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const o=xe("internal-error");o.customData=i,t(o)},r.type="text/javascript",r.charset="UTF-8",gv().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});dv("Browser");export{vv as a,Ev as b,wv as c,yv as d,Av as e,Rv as f,Sv as g,Pv as h,Vf as i,Tv as s,Iv as u};
