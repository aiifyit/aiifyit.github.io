import test from 'node:test';
import assert from 'node:assert/strict';
import { submitLeadRequest } from '../src/data/leadSubmission.ts';
test('lead submission rejects non-success responses and preserves retry path',async()=>{
 for(const status of [400,403,429,500]) await assert.rejects(submitLeadRequest('https://example.invalid/test',{},async()=>({ok:false,status})),new RegExp(`HTTP ${status}`));
});
test('unconfigured endpoint makes no request and network errors reject',async()=>{
 let called=false;await assert.rejects(submitLeadRequest('',{},async()=>{called=true;}),/not configured/);assert.equal(called,false);
 await assert.rejects(submitLeadRequest('https://example.invalid/test',{},async()=>{throw new Error('network unavailable');}),/network unavailable/);
});
test('successful endpoint acceptance resolves without claiming email delivery',async()=>{
 let request;await submitLeadRequest('https://example.invalid/test',{source:'local-test'},async(url,options)=>{request={url,options};return {ok:true,status:202};});
 assert.equal(request.options.method,'POST');assert.deepEqual(JSON.parse(request.options.body),{source:'local-test'});
});
