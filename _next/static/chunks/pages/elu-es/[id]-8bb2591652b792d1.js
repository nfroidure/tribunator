(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[334],{1087:function(e,s,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/elu-es/[id]",function(){return t(7405)}])},6479:function(e,s,t){"use strict";var n=t(5893),r=t(6465),a=t.n(r);let i=e=>{let{children:s,...t}=e;return(0,n.jsxs)("h3",{...t,className:"jsx-1a3be634bc234fba "+(t&&null!=t.className&&t.className||"root"),children:[s,(0,n.jsx)(a(),{id:"1a3be634bc234fba",children:".root.jsx-1a3be634bc234fba{font-family:var(--headingFont);font-size:var(--bigFontSize);line-height:var(--greatLineHeight);text-decoration:underline;font-weigth:normal;margin:var(--vRythm)0 0 0}"})]})};s.Z=i},7405:function(e,s,t){"use strict";t.r(s),t.d(s,{__N_SSG:function(){return D}});var n=t(5893),r=t(2064),a=t(5608),i=t(7294),l=t(3523),c=t(3488),d=t(3959),o=t(2237),x=t(1507),h=t(2142),u=t(2483),p=t(3617),j=t(6776),m=t(166),f=t(2357),Z=t(6022),g=t(3946),b=t(6479);let _={"cm-douai":"Conseil Municipal de la Ville de Douai"},v=e=>{let{entry:s}=e;return(0,n.jsxs)(l.Z,{title:"".concat((0,a.b)(s.title)),description:(0,a.b)(s.description),image:"/images/banners/".concat(s.id,".png"),children:[(0,n.jsxs)(c.Z,{children:[(0,n.jsx)(d.Z,{children:s.title}),(0,n.jsx)(x.Z,{children:(0,n.jsx)(m.Z,{children:s.description})}),s.illustration?(0,n.jsx)("p",{className:"entry_illustration",children:(0,n.jsx)(u.Z,{float:"left",orientation:"landscape",src:"/"+s.illustration.url,alt:s.illustration.alt})}):null,(0,n.jsx)(o.Z,{children:"Informations"}),(0,n.jsxs)(p.Z,{children:[(0,n.jsxs)(j.Z,{children:[(0,n.jsx)(m.Z,{children:"Groupe politique\xa0:"})," ",s.stats.groups.map((e,s)=>(0,n.jsxs)(i.Fragment,{children:[s?", ":"",(0,n.jsxs)(f.Z,{href:"/groupes/".concat(e.id),children:[e.name," (",e.party,")"]})]},e.id))]}),(0,n.jsxs)(j.Z,{children:[(0,n.jsx)(m.Z,{children:"Mandats\xa0:"})," ",s.stats.mandates.join(", ")]})]}),(0,n.jsx)(o.Z,{children:"Mots-Cl\xe9s"}),(0,n.jsx)(p.Z,{children:s.stats.words.slice(0,10).map(e=>{let{word:s,count:t}=e;return(0,n.jsxs)(j.Z,{children:[s,"\xa0(",t,")"]},s)})}),(0,n.jsx)(g.Z,{stats:s.stats}),(0,n.jsx)(Z.Z,{summary:s.stats.summary}),s.presences?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.Z,{children:"Feuille de pr\xe9sence"}),Object.keys(s.presences).map(e=>(0,n.jsxs)(i.Fragment,{children:[(0,n.jsx)(b.Z,{children:_[e]}),(0,n.jsxs)(p.Z,{children:[(0,n.jsxs)(j.Z,{children:["✅ Pr\xe9sences\xa0: ",s.presencesStats[e].present,"/",s.presencesStats[e].total]}),(0,n.jsxs)(j.Z,{children:["❌ Absences\xa0:"," ",s.presencesStats[e].total-s.presencesStats[e].present,"/",s.presencesStats[e].total]}),(0,n.jsxs)(j.Z,{children:["⌚ Retards\xa0: ",s.presencesStats[e].arrivedLate,"/",s.presencesStats[e].total]}),(0,n.jsxs)(j.Z,{children:["\uD83C\uDFC3\uD83C\uDFFD D\xe9parts anticip\xe9s\xa0:"," ",s.presencesStats[e].leftBeforeTheEnd,"/",s.presencesStats[e].total]}),(0,n.jsxs)(j.Z,{children:["\uD83E\uDD3E Pouvoirs donn\xe9s\xa0:"," ",s.presencesStats[e].delegation,"/",s.presencesStats[e].total]})]}),(0,n.jsx)(p.Z,{children:s.presences[e].map(e=>(0,n.jsxs)(j.Z,{children:[(0,n.jsxs)(m.Z,{children:[new Intl.DateTimeFormat("fr-FR",{year:"numeric",month:"long"}).format(new Date(e.date)),"\xa0:"]})," ",e.present?"✅ pr\xe9sent\xb7e":"❌ absent\xb7e",e.arrivedLate||e.leftBeforeTheEnd?" (".concat(e.arrivedLate?"en retard":"").concat(e.arrivedLate&&e.leftBeforeTheEnd?" et ":"").concat(e.leftBeforeTheEnd?"parti\xb7e plus t\xf4t":"",")"):"",e.delegation?(0,n.jsxs)(n.Fragment,{children:[", a donn\xe9 son pouvoir \xe0"," ",(0,n.jsx)(f.Z,{href:"/elu-es/".concat(e.delegation.id),children:e.delegation.name})]}):null]},e.date))})]},e))]}):null,(0,n.jsx)(o.Z,{children:"Liste des tribunes"}),(0,n.jsx)(p.Z,{children:s.stats.writtings.map(e=>{let{id:s,date:t}=e;return(0,n.jsx)(j.Z,{children:(0,n.jsx)(f.Z,{href:"/tribunes/".concat(s),children:new Intl.DateTimeFormat("fr-FR",{year:"numeric",month:"long"}).format(new Date(t))})},s)})}),(0,n.jsxs)("aside",{children:[(0,n.jsx)(o.Z,{children:"Commenter et partager"}),(0,n.jsx)(h.Z,{url:"https://".concat(r.fh,"/tribunes/").concat(s.id),title:s.title})]})]}),(0,n.jsx)("style",{children:"\n      :global(.entry_illustration) {\n        margin: 0 !important;\n      }\n      @media print {\n        aside {\n          display: none;\n        }\n      }\n      "})]})};var D=!0;s.default=v}},function(e){e.O(0,[689,331,589,774,888,179],function(){return e(e.s=1087)}),_N_E=e.O()}]);