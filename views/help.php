<div class="scroll screenHeigth container">
<br><?= $this->view('quickstart',compact('requiredPlugins')) ?>
<h1>Introduction</h1>
<p><?= $this->tag('strong',PRODUCTNAME) ?> helps you define a "link sequence" checking and highlighting potential problems 
thus allowing reordering and optimization of the operation schedule.<br>
Everything start from actually "drawing" the links you plan to realize with the Draw Tools IITC plugin.<br>
The initial sequence of links is the sequence you drawn them.
The "Steps" tab will list in the "Planning" table the links and highlight any issue with them.
</p>
<h3>Links &amp; Fields checks</h3>
<p>The following checks are performed:
<ul>
	<li><strong>Cross Links</strong>:
	You can't create a link intersecting any existing link.
	</li>

	<li><strong>Link's Destination Portal ownership and resonators' status</strong>:
	The destination Portal of a link must be owned by your own faction and must have 8 resonators ("full").
	</li>

	<li><strong>Portal keys</strong>:
	You must own the Key of the destination Portal to link to it. The system will calculate the overall requirements for each targeted portal,
	match this information with the number of key already owned (as stored in the "Keys"+"Sync" IITC plugins) and accordingly plan/warn
	for key acquisition.
	</li>

	<li><strong>Origin Portal outgoing links count</strong>:
	Each Portal can have maximum 8 outgoing links. SoftBank Ultra Link Amps can be used to extend the limit.
	</li>

	<li><strong>Origin Portal inside field</strong>:
	you can't originate a link from a Portal that is inside an existing field, while you can link to it starting from a Portal on the edge of the containing field.
	</li>

	<li><strong>"Wasted fields"</strong>:
	when a link is created, it can possibly "close" multiple fields. 
	In that case the outer fields are first created, and any inner field is ignored, and therefore "wasted".
	In short terms a link can have maximum 2 links, 1 per "side"
	(this is the reason for "ghost" fields).
	</li>
</ul>
</p>
<h4 style="color: red;">Checks not performed</h4>
<p>Please be aware that the <strong>portal link ranges ARE NOT CHECKED</strong> at this time!</p>
<h3>Action Points (AP) estimation</h3>
<p>Additionally AP gained during the execution of the plan are calculated, 
with the following limitations:
<ul>
	<li>MODs destroying and deploying</li>
	<li>Upgrade resonator</li>
	<li>Hack, recharges</li>

</ul>
</p>

<h3>Plan Progression "animation"</h3>
<?= PRODUCTNAME ?> allows you to view step by step progression of your planned links and generated (and wasted) fields.

<h1>Planning</h1>
<h3>Plans "tab"</h3>
<p>The Plans tab will list the "plans" saved in your Google Drive and allow you to select, delete, copy them as well as create blank new ones.</p>

<h3>Steps "tab"</h3>
The Planning table allows you to quickly visualize your plan, the result of the checks performed by the system and make the necessary change.
<br>Each row of the table is either a link (planned or an existent "crosslink") or a "portal visit" (rendered as a "marker" in the drawing) to acquire keys/take down corsslinks.
<strong>You can drag a row and drop it somewhere else in the table to change the order of execution</strong>,
the system will immediately perform the complete check of the updated sequence.<br>
Details for each row are:
<ul>
	<li><strong>Type</strong>: 
	if the row is either a Link, a cross link or a "Portal" visit. 
	<br>If it is a link you'll also find here the current count  of outgoing links for the origin portal 
	and the number of fields created (or "wasted") by the link.
	<br>A double left-right arrow allow you to reverse the link orientation (swapping portals)
	<br>A red "X" allows you to remove a previously added "portal visit".
	</li>

	<li><strong>Step #</strong>:
	the cliccable link will open a map with the Plan Progression "animation",
	showing the visual status at that exact point, very useful in dealing with "wasted" fields and "inner field lock" for origin Portals.
	</li>

	<li><strong>From</strong> Portal:
	Here you'll find the name of the Origin Portal, graphically rendered to quickly get its current ownership and resonators' count status.
	</li>

	<li><strong>Keys</strong>:
	The "In" column shows the suggested qty of Origin Portal keys to be acquired
	(operative suggestion: ascquiring 2 keys in one stop is already not so easy, try avoid planning for 3 or more key at a single stop,
	and take in account the eventual need of multi-hack/heat sink MODs deployment!).<br>
	The "Needed" column will show the total quantity to acquire, including following planned stops at the same Portal.
	</li>

	<li><strong>Tp</strong> Portal:
	Here you'll find, if applicable, the name of the Destination Portal, graphically rendered to quickly get its current ownership and resonators' count status.
	</li>

	<li><strong>Keys After</strong>:
	The column show the quantity of Destination Portal's keys you'll have after establishing the link. A negative number means you have to plan a previous
	</li>

	<li><strong>AP</strong>:
	The calulated Action Points for that row/action. Stopping you mouse pointer over the cell will popup the details of the score computation.
	</li>

</ul>

<h4>"Textual" plan</h4>
<p>Below the "Planning table" you'll find a selectable text area with textual rendering of the plan,
intended to be copied and pasted to any "todo"/list software/app on your mobile device (i.e. Google Kepp)
for quick on-field reference.
</p>

<h3>Portals "tab"</h3>
<p>This tab will list all the portals in the plan. You can sort the list clicking on the table header.
<br>This is very useful to check portal key owned: order the list by Portal name and then scroll through your inventory of keys in the Ingress scanner app sorting it by title as well!
</p>

<h1>Ingraph <small>integration</small></h1>
<p><strong>Ingraph</strong> (<a href="<?= INGRAPHURL ?>" target="_blank"><?= INGRAPHURL ?></a>)
is a brilliant software written by Nigel Stepp that allows optimiziation of links between portals following different selectable algorithms.<br>
<?= PRODUCTNAME?> can export the complete list of portals in the current plan to a Ingraph "graph" file (.gph) and then
import back into the current plan the links created in the software (links from the graph file will replace/overwrite the current plan).<br>
To "select" on the IICT map the portals to be exported you can either mark them with "markers" or join them with links.
</p>

<?php echo $this->view('credits') ?>

</div>