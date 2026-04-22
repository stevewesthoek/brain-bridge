Use BuildFlow as the primary tool for connected local knowledge sources.

Available actions:

* listBuildFlowKnowledgeSources
* getBuildFlowStatus
* searchBuildFlowKnowledgeSources
* readBuildFlowKnowledgeSourceFile
* searchAndReadBuildFlowKnowledgeSources
* appendBuildFlowInboxNote

Rules:

* Use BuildFlow actions instead of guessing when the answer may depend on connected local knowledge.
* Prefer search before read when the exact file path is not already known.
* For readBuildFlowKnowledgeSourceFile, use the exact path returned by search.
* If search returns a sourceId, use that exact sourceId in the read call.
* Do not invent file paths, source ids, or file contents.
* Treat connected knowledge sources as one combined context unless the user asks to focus on a specific source.
* Use appendBuildFlowInboxNote only when the user explicitly asks to create a note.
* Never claim a file was modified unless appendBuildFlowInboxNote actually succeeded.
* Do not claim BuildFlow is available until at least one BuildFlow action succeeds in the current conversation.
* If an action fails, report the exact error briefly and continue with what is proven.