import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(fileURLToPath(new URL("..",import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"data/public-asset-dependencies.json"),"utf8"));
const reviewed=new Set([
  "/assets/img/building.png",
  "/assets/img/glasses-book.png",
  "/assets/diagrams/yokohama-notice-structure.svg"
]);

function gitBlobSha(buffer){
  return crypto.createHash("sha1").update(`blob ${buffer.length}\\0`).update(buffer).digest("hex");
}

test("only 3 individually reviewed, existing public diagrams/illustrations are republished",()=>{
 assert.equal(manifest.sourceCommitSha,"a1deb9ff2580b37ac69bb56bef3089d73f82c75b");
 assert.equal(manifest.assets.length,92);
 for(const asset of manifest.assets){
  const copied=reviewed.has(asset.path);
  if(copied){
   assert.equal(asset.reviewStatus,"republished-verified-identical",asset.path);
   const bytes=fs.readFileSync(path.join(root,asset.path.slice(1)));
   assert.equal(bytes.length,asset.bytes,asset.path);
   assert.equal(gitBlobSha(bytes),asset.sourceGitBlobSha,asset.path);
   assert.equal(crypto.createHash("sha256").update(bytes).digest("hex").length,64);
  }else{
   assert.equal(asset.reviewStatus,"pending-republication-review",asset.path);
  }
 }
});
