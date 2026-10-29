//Globals
var mod_ogc_mapWindow;
var mod_ogc_alertWindow;

//Initialisieren des OGC-moduls
$(document).ready(function() {	
	//Kendo Objekte initalisieren
	mod_ogc_initKendoElements();	
	//Wenn alles geladen wurde Wrapperdiv sichtbar und Ladeanzeige weg
    $("#loadingapp").css('display','none');
	$("#loadingwrapper").css('visibility','visible');	
});


//Kendo Objekte initalisieren
function mod_ogc_initKendoElements(){
	
	//Popup Map Fenster initalisieren
	mod_ogc_mapWindow = $("#mod_ogc_mapWindow");
	mod_ogc_mapWindow.kendoWindow({
		minWidth: "220px",
		minHeight: "20px",
		pinned: true,
		position: {
			top: 10,
			left: "20%"
		},
		title: "",
		visible: false,
		actions: ["Close"]
	});	
	
	
	//Alert Fenster initalisieren	
	mod_ogc_alertWindow = $("#mod_ogc_alertWindow");
	mod_ogc_alertWindow.kendoWindow({
		minWidth: "160px",
        minHeight: "2px",
		modal: true,	
		title: "Meldung",
		visible: false,		
		actions: ["Close"]
	});	
	
	//Tabstrip
	$("#ogc_tabstrip").kendoTabStrip({
		animation:  {
			open: {
				effects: "fadeIn"
			}
		}
	});
	
	//Panelbar
	$("#panelbar").kendoPanelBar({
		expandMode: "multi"
	});
	
	var panelBar = $("#panelbar").data("kendoPanelBar");
	panelBar.expand($('[id^="item"]'));
	
	//Layer Daten Source
	var dataSource_Layer = new kendo.data.DataSource({
		type: "json",
		transport: {
			read: 'ajax/ajax_ogc_json.php?source=layer'
		},
		serverOperation: false,
		serverSorting: false,
		pageSize:1000,
		schema: {
			model: {
				fields: {
					sort: { type: "number" },
					title: { type: "string" },
					"abstract": { type: "string" },
					datatyp: { type: "string" },
					bbox: { type: "string" },
					metadataid: { type: "number" },
					is_wms: { type: "string"},
					is_wfs: { type: "string"},
					auth_groupid: { type: "number"}					
				}
			}
		}		
	});
	
	//Group Daten Source
	var dataSource_Group = new kendo.data.DataSource({
		type: "json",
		transport: {
			read: 'ajax/ajax_ogc_json.php?source=group'
		},
		serverOperation: false,
		serverSorting: false,
		schema: {
			model: {
				fields: {
					sort: { type: "number" },
					title: { type: "string" },
					"abstract": { type: "string" },		
					is_wms: { type: "string"},
					is_wfs: { type: "string"},
					auth_groupid: { type: "number"}
				}
			}
		},
		pageSize:1000
	});
	
	//Layer Grid initialisieren
	$("#ogc_layer_grid").kendoGrid({
		dataSource: dataSource_Layer,
		scrollable: true,
		sortable: true,
		filterable: true,
		maxheight: 460,
		columns: [	
			{ field: "id", title: "Edit", width: "72px", filterable: false, sortable: false, hidden: true, template: '<a class="k-button" href="javascript:void(0)" onclick="mod_ogc_open_editLayer(${id},\'layer\')"><span class="k-icon k-i-pencil"></span>&nbsp;&nbsp;Edit</a>' },
			{ field: "sort", title: "Nr.", width: "44px" },
			{ field: "title", title: "Titel", width: "140px" },
			{ field: "abstract", title: "Beschreibung", width: "240px" },
			{ field: "datatyp", title: "Datentyp", width: "80px", filterable: { multi: true, search: true } },	
			{ field: "metadataid", title: "Meta", width: "54px", filterable: false, sortable: false, template: '#if (metadataid !== "" && metadataid !== null ) {# <a href="../mod_metadata/ajax/gethtml.php?id=${metadataid}" class="k-button" style="padding:1px;line-height: 1.0em;" title="Inspire Metadaten"  target="_blank" ><img  src="img/icon_inspire.png" ></a> #} else {# #}#'  },
			{ field: "is_visible", title: "View", width: "40px", filterable: false, sortable: false, hidden: true, template: '#if (is_visible === \'t\') {# <img  src="img/icon_visible.png" title="öffentlich sichtbar" > #} else {# <img  src="img/icon_invisible.png" title="öffentlich nicht sichtbar" > #}#' },
			{ field: "is_wms", title: "WMS", width: "58px", filterable: false, sortable: false, template: '#if (is_wms === \'t\') {# <a class="k-button" title="WMS GetCapabilities Url" href="javascript:void(0)" onclick="mod_ogc_getUrl(${id},\'layer\',\'wms\')">URL</a> #} else {# #}#'  },
			{ field: "is_wfs", title: "WFS", width: "58px", filterable: false, sortable: false, template: '#if (is_wfs === \'t\') {# <a class="k-button" href="javascript:void(0)"  title="WFS GetCapabilities Url" onclick="mod_ogc_getUrl(${id},\'layer\',\'wfs\')">URL</a> #} else {# #}#' },
			{ field: "bbox", title: "MAP", width: "58px", filterable: false, sortable: false, template: '#if (bbox !== "") {# <a class="k-button" style="padding:1px;line-height: 1.0em;" title="getMap Beispiel" href="javascript:void(0)" onclick="mod_ogc_open_mapWindow(${id})"><img  src="img/icon_getmap.png" ></a> #} else {# #}#' },
			{ field: "auth_groupid", title: "Auth", width: "40px", filterable: false, sortable: false, template: '#if (auth_groupid > 0 ) {# <img  src="img/icon_lock.png" title="Die Ebene ist nur mit entsprechenden Berechtigungen zugänglich!" > #} else {# <img  src="img/icon_unlock.png" title="Die Ebene ist frei zugänglich!" > #}#'  }
		],	
		
	filterable: {
		extra: false,
		operators: {
			string: {
				contains: "beinhaltet",
				startswith: "beginnt mit",
				eq: "ist gleich"
				
			 }
		},
		
		messages: {
		  and: "und",
		  or: "oder",
		  clear: "entfernen",
		  filter: "Filter",
		  info: "Ergebnis  filtern nach:",
		  checkAll: "alle auswählen"
		}
	}
	
	});	

	
	//Group Grid Gruppe initialisieren
	$("#ogc_group_grid").kendoGrid({
		dataSource: dataSource_Group,
		scrollable: true,
		sortable: true,
		filterable: true,
		maxheight: 460,
		columns: [				
			{ field: "id", title: "Edit", width: "72px", filterable: false, sortable: false, hidden: true, template: '<a class="k-button" href="javascript:void(0)" onclick="mod_ogc_open_editGroup(${id},\'group\')"><span class="k-icon k-i-pencil"></span>&nbsp; Edit</a>' },
			{ field: "sort", title: "Nr.", width: "44px" },
			{ field: "title", title: "Titel", width: "160px" },
			{ field: "abstract", title: "Beschreibung", width: "240px" },
			{ field: "is_visible", title: "View", width: "40px", filterable: false, sortable: false, hidden: true, template: '#if (is_visible === \'t\') {# <img  src="img/icon_visible.png" > #} else {# <img  src="img/icon_invisible.png" > #}#' },
			{ field: "is_wms", title: "WMS", width: "54px", filterable: false, sortable: false, template: '#if (is_wms === \'t\') {# <a class="k-button" title="WMS GetCapabilities Url" href="javascript:void(0)" onclick="mod_ogc_getUrl(${id},\'group\',\'wms\')">URL</a> #} else {# #}#'  },
			{ field: "is_wfs", title: "WFS", width: "54px", filterable: false, sortable: false, template: '#if (is_wfs === \'t\') {# <a class="k-button" href="javascript:void(0)"  title="WFS GetCapabilities Url" onclick="mod_ogc_getUrl(${id},\'group\',\'wfs\')">URL</a> #} else {# #}#' },
			{ field: "auth_groupid", title: "Auth", width: "40px", filterable: false, sortable: false, template: '#if (auth_groupid > 0 ) {# <img  src="img/icon_lock.png" title="Die Ebene ist nur mit entsprechenden Berechtigungen zugänglich!" > #} else {# <img  src="img/icon_unlock.png" title="Die Ebene ist frei zugänglich!" > #}#'  }
		],	
		
	filterable: {
		extra: false,
		operators: {
			string: {
				contains: "beinhaltet",
				startswith: "beginnt mit",
				eq: "ist gleich"
				
			 }
		},
		
		messages: {
		  and: "und",
		  or: "oder",
		  clear: "entfernen",
		  filter: "Filter",
		  info: "Ergebnis  filtern nach:",
		  checkAll: "alle auswählen"
		}
	}
	
	});	
	
	//Fix für Kendo-Fenster
	mod_ogc_mapWindow.data("kendoWindow").open();
	mod_ogc_mapWindow.data("kendoWindow").close();

} //Ende Kendo Objekte initalisieren

//Grid Datenquelle der Layer aktualisieren
function mod_ogc_refreshLayergrid(){		
	var grid = $("#ogc_layer_grid").data("kendoGrid");
	grid.dataSource.read();
	grid.refresh();
}

//Grid Datenquelle der Group aktualisieren
function mod_ogc_refreshGroupgrid(){		
	var grid = $("#ogc_group_grid").data("kendoGrid");
	grid.dataSource.read();
	grid.refresh();
}


//WMS/WFS Url
function mod_ogc_getUrl(id,source,typ){
	if(typ === 'wms'){var wintitle = 'WMS GetCapabilities Url';}else if(typ === 'wfs'){var wintitle = 'WFS GetCapabilities Url';}else{var wintitle = '';}
	$.ajax({
		type: 'GET',
		url: 'ajax/ajax_ogc_url.php',
		data: {
			id:id,
			source:source,
			typ:typ
		},
		success: function(ergebnis){
					if(ergebnis){
						$("#mod_ogc_mapWindow").html(ergebnis);
						mod_ogc_mapWindow.data("kendoWindow").setOptions({
							title: wintitle,
							maxWidth: 580
						});
						mod_ogc_mapWindow.data("kendoWindow").open();
						$("mod_ogr_capUrl").focus();
						$("mod_ogr_capUrl").select();
					}
				}
		});	
}


//WMS/WFS Url
function mod_ogc_open_mapWindow(id){
	$.ajax({
		type: 'GET',
		url: 'ajax/ajax_ogc_map.php',
		data: {
			id:id
		},
		success: function(ergebnis){
					if(ergebnis){
						$("#mod_ogc_mapWindow").html(ergebnis);
						mod_ogc_mapWindow.data("kendoWindow").setOptions({
							title: 'WMS GetMap Aufruf',
							maxWidth: 580
						});
						mod_ogc_mapWindow.data("kendoWindow").open();
					}
				}
		});	
}


//Hilfsfunktion Copy to Clipboard?
function mod_ogc_copyToClipboard(text) {
   var copytextArea = document.createElement( "textarea" );
   copytextArea.value = text;
   document.body.appendChild( copytextArea );
   copytextArea.select();
   try {
      var successful = document.execCommand( 'copy' );
      var msg = successful ? 'URL wurde erfolgreich in die Zwischenablage kopiert!' : 'Fehler beim Kopieren!';	  
      $("#copyMsg").html(msg);
   } catch (err) {
      $("#copyMsg").html('Fehler beim Kopieren!');
   }

   document.body.removeChild( copytextArea );
}

//Alertfenster öffnen
function mod_ogc_openAlertWindow(content){
	var htmlcontent = '<div class="k-block k-info-colored" style="padding:5px;">' + content + '</div>';
	htmlcontent += '<div style="text-align: center; margin:10px;"><button onClick="mod_ogc_closeAlertWindow();" class="k-button" > OK </button></div>';
	$("#mod_ogc_alertWindow").html(htmlcontent);
	mod_ogc_alertWindow.data("kendoWindow").center();
	mod_ogc_alertWindow.data("kendoWindow").open();
}

//Alertfenster schließen
function mod_ogc_closeAlertWindow(){
	mod_ogc_alertWindow.data("kendoWindow").close();
}

//Mapfenster schließen
function mod_ogc_closeMapWindow(){
	mod_ogc_mapWindow.data("kendoWindow").close();
}

//Hilfsfunktion ist Zahl?
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
