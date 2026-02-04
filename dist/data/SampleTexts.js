/**
 * SampleTexts.js
 *
 * This module exports a collection of stories and text fragments.
 * Each entry is a template string in which tokens enclosed in square
 * brackets (e.g. [Vorname], [Nominativ], [Poss. 1]) will be
 * substituted by the PronounTool class at runtime. Capitalized tokens
 * will stay capitalized in the outputted text.
 *
 * Texts kindly provided by Valo: https://valochristiansen.com/
 * Licensed under CC-BY-SA 4.0 Queer Lexikon e.V.
 */
const SampleTexts = {
  school: {
    title: "Schule",
    text: `Halb acht Uhr morgens in einem Schulgebäude, irgendwo in einer großen oder kleinen Stadt.

„Ey, Zill, hast du [Vorname] schon gesehen?“
„Nee, aber [nominativ] hat mir geschrieben, dass [poss. 1] Bus Verspätung hat.“
„Ahhhhh, Shit, ich wollte noch Hausaufgaben bei [dativ] abschreiben, Frau Montez wird mir wieder den Kopf abreißen.“
„Du musst nicht auf [akkusativ] warten, ich kann dir meine geben.“
„Ich weiß nicht, ob deine so gut sind wie [poss. 2], aber ja ok. Besser als nix.“
„Na danke. Aber ja, [nominativ] ist schon echt gut immer. Naja. Hier ist mein Heft, aber bitte änder das bisschen, damit es nicht auffällt!“`,
  },

  afterTraining: {
    title: "Nach dem Training",
    text: `„Gutes Training, Leute!” Joy gibt allen High Five. [Vorname] schlägt ebenfalls ein und macht sich dann mit Kim auf den Heimweg.

„Uff, ich bin richtig k.o. Das war echt nicht ohne heute.“, seufzt Kim. [Vorname] stimmt zu, [poss. 1] Körper fühlt sich schwer und erschöpft an, aber auch ganz schön gut.

„Kommst du am Freitag zur queeren Party?“, fragt Kim irgendwann. „Ich weiß es noch nicht.“, sagt [Vorname]. „Ich hab zwar Zeit, aber ich muss schauen, ob die Energie reicht.“

Kim lacht: „Ja, voll. Ich auch.“ Es ist, was [Vorname] so an Kim mag – Kim versteht immer, dass manchmal die Energie niedrig ist. [Nominativ] will Kim eigentlich schon lange mal nach einem Treffen abseits von Training und Heimweg fragen, aber bisher hat [nominativ] sich noch nicht getraut. Es ist nicht immer leicht für [akkusativ], neue Freund*innen zu finden. [Poss. 3] anderen Freund*innen zufolge sollte [nominativ] sich wirklich keinen Kopf machen – aber so leicht ist das eben nicht immer.

„Hey [Vorname]. Hast du eigentlich Lust, dich mal so zu treffen ohne Training? Also, an einem Tag, wenn genug Energie da ist?“

[Vorname] lächelt: „Ja. Total gerne.“`,
  },

  queerParty: {
    title: "Queere Party",
    text: `„Wo darf ich dir den Stempel hin machen?“ [Vorname] streckte der Person am Empfang [poss. 2] linke Hand hin und bekam einen dunklen Einhornstempel verpasst.
„So, jetzt kannst du rein. Warst du schon mal da?“ [Nominativ] verneint.
„Okay, dann findest du nach dem Gang gleich rechts die Garderobe und daneben den Tisch, wo du dir ein Schild mit deinen Pronomen machen kannst, wenn du magst. Und da gibt’s auch Sticker, mit denen du zeigen kannst, ob du flirten möchtest oder lieber nicht. Gegenüber sind die Toiletten, alle genderneutral natürlich, nach hinten durch sind dann Bar und die beiden Floors. Viel Spaß dir!“

„Cool, danke!“ [Nominativ] geht langsam durch den dunklen Gang. An der Garderobe gibt [nominativ] [poss. 3] Pulli ab und schlendert dann zum Pronomentisch. [Nominativ] schreibt [Bezeichnung] auf ein Stück Kreppband und klebt es auf [poss. 1] Oberteil. Dann fragt [nominativ] sich, ob [dativ] heute nach flirten ist. Vielleicht später. Erst mal alles anschauen gehen.

Auf der Tanzfläche ist noch fast nichts los, aber die Person am Mischpult macht zumindest Musik, die [dativ] definitiv gefällt und [poss. 1] Fuß wippt automatisch im Takt.

„Hey, magst du einfach mit mir den Floor eröffnen? Ich liebe übrigens dein Outfit!“ Ein Mensch mit lila gefärbten Locken hat sich zu [dativ] hingeneigt und schaut nun fragend.

„Danke. Und ja. Lass uns tanzen gehen!“`,
  },

  conversation: {
    title: "Gespräch unter Freund*innen",
    text: `„Aber hast du das neue Poster in [poss. 5] Zimmer gesehen? Ich liiiiiebs, es ist einfach so gay!“ Anti lacht überschwänglich und stößt Nics in die Rippen. Ich muss ebenfalls lachen.

„Leute, es ist einfach ein Poster.“ Anti widerspricht vehement, tut so, als würde Anti Nics zur Seite nehmen und flüstert laut hinter der Hand: „Weißt du, Nics, [Vorname] denkt immer, dass [poss. 1] Kram und so ganz normal ist, aber [nominativ] vergisst immer, wie unglaublich cool und inspirierend [nominativ] ist. Ich hör [poss. 3] Geschichten einfach immer gerne zu und witzig ist [nominativ] halt einfach auch noch, manchmal bin ich echt fertig, wie krass ein Mensch sein kann.“

Nics grinst und flüstert zurück: „Boah ja. Finds auch richtig schlimm, dass [nominativ] das einfach nicht akzeptieren kann. Und ich checks ja, früher haben irgendwelche Leute [dativ] echt viel Scheiße eingeredet, aber das stimmt halt nicht. Ich hab echt wenige Menschen so lieb wie [akkusativ] und finde fast niemanden so beeindruckend.“`,
  },

  fantasy: {
    title: "Fantasy",
    text: `Der Drache betrachtete [akkusativ] lange, bevor er etwas sagte. „[Vorname], du weißt, dass ich deine Abenteuerlust und deinen Mut sehr schätze. Bist du sicher, dass du dafür schon bereit bist? Die Zauber, die auf dich gelegt wurden, sind noch nicht lange her.“

[Nominativ] seufzte. „Ich weiß, Drams. Aber ich will mit. Ich fühle mich gut.“ Fila flatterte zu ihnen und ließ sich auf [poss. 5] Kopf nieder. In den Abendstunden verschmolz die Farbe von Filas Flügeln beinahe mit der Farbe [poss. 6] Haars.

„Worüber redet ihr?“, fragte die Elfe neugierig.

„Ach, Drams will mich nicht mitnehmen. Die übliche Diskussion.“, murmelte [Vorname]. „Ich mach mir einfach Sorgen um dich, irgendwer muss das vielleicht auch mal tun.“, knurrte Drams ungehalten.

Fila runzelte die Stirn. „Aber [poss. 2] Verzauberung war vor drei Tagen, alles hat eingewirkt, normalerweise ist man doch um diese Zeit wieder fit?“

„Nicht du auch noch.“ Der Drache wandte sich um und verschwand in der Höhle, die die drei sich teilten.

Fila verdrehte die Augen und flatterte in einen nahe gelegenen Busch. „Hey, [Vorname]! Zeigst du mir, wie die Verzauberung gewirkt hat? Vielleicht überzeugt Drams das ja noch.“ Dey grinste. Und legte los.`,
  },

  medical: {
    title: "Ärztliche Praxis",
    text: `„[Anrede/Vorname + Nachname], bitte in Zimmer 3.“ Ich folgte der MFA in Zimmer 3 und setzte mich dort auf die bereitstehende Liege. Ich hasste Arzttermine, aber hin und wieder ließ es sich der Gesundheit wegen eben nicht vermeiden.

Durch die offene Tür drangen die Geräusche und Gespräche der Praxis zu mir ins Zimmer. „[Vorname + Nachname] wartet in Zimmer 3. Wir brauchen [poss. 2] Krankenkassenkarte noch einen Moment, sagen Sie [dativ], dass [nominativ] sie noch bei uns abholen muss. Aber behandeln Sie [akkusativ] erst einmal.“

Kurz darauf trat die ärztliche Fachperson ins Zimmer. „Hallo [Anrede/Vorname + Nachname], was kann ich für Sie tun?“`,
  },

  laudation: {
    title: "Laudatio Queerer Nobelpreis",
    text: `Wir vom Queer Lexikon sind stolz, den Queeren Nobelpreis in diesem Jahr an eine Person zu verleihen, die sich seit langem in besonderem Maße für die Queere Community und queere Sichtbarkeit einsetzt. Uns ist mehr als bewusst, was für ein Kampf die bloße Existenz als queere Person in dieser Welt tagtäglich darstellt und sind daher umso glücklicher, dass [nominativ] sich jeden Tag aufs Neue entscheidet, zu bleiben.

Wir möchten [dativ] unsere tiefe Anerkennung dafür aussprechen, Tag für Tag die Hoffnung wieder zu finden, wenn sie verloren gegangen ist und sich weiter für mehr Queerness in der Welt einzusetzen. Nicht den gesellschaftlichen Normen zu entsprechen und dennoch zu sich zu stehen, ist eine Leistung, für die wir [akkusativ] so sehr bewundern.

Besonders hervorheben möchten wir außerdem [poss. 3] Support und tiefe Liebe für [poss. 2] Freund*innen und Wahlfamilie. [Vorname], wir sind so froh, dass du du bist und du bleibst. Du bist genau richtig wie du bist!

Zur Vergabe des Queeren Nobelpreises bitten wir Sie alle nun um den lautesten, warmherzigsten, liebevollsten Applaus für [Vorname + Nachname]!`,
  },

  newspaper: {
    title: "Zeitungsartikel",
    text: `„Ich kanns einfach nicht glauben.“ Das waren die ersten Worte, welche die siegwürdige Person der gestrigen Queeren Nobelpreis‑Verleihung des Queer Lexikons über die Lippen kamen.

[Vorname + Nachname] hatte augenscheinlich nicht mit dem Gewinn gerechnet, obwohl die Begründung der Jury mehr als überzeugend war: [Poss. 1] täglicher Kampf um die bloße Existenz wurde dabei gewürdigt, [poss. 1] stetiger Wille, weiter zu bleiben und die Hoffnung immer wieder zu finden. [Poss. 2] Sichtbarkeit sei bewundernswert, ebenso der Support und die Liebe für [poss. 2] Wahlfamilie und Freund*innen.

Im Gespräch nach der Preisverleihung gibt [Anrede/Vorname + Nachname] sich zurückhaltend, [nominativ] wirkt immer noch überwältigt von der Laudatio und all der Anerkennung. Immer wieder wird das Interview unterbrochen, weil begeisterte Fans [dativ] gratulieren möchten, einige bitten [akkusativ] auch um eine Umarmung und ein Foto.

Das ausführliche Interview mit [Vorname + Nachname] erwartet die Lesenden in unserer Queeren Samstagsausgabe!`,
  },

  meeting: {
    title: "Meeting",
    text: `Montagmorgen, das erste, das wie jede Woche ansteht, ist das Meeting mit dem gesamten Kollegium. Ein Teil von ihnen hat sich online zugeschaltet, andere sitzen zusammen im Büro.

Die Abteilungsleitung eröffnet das Meeting: „Guten Morgen zusammen. Ich hoffe, Sie alle hatten ein erholsames Wochenende. Heute Morgen möchte ich mit dem Hinweis starten, dass [Anrede/Vorname + Nachname] ab sofort die Pronomen [Bezeichnung] und den Vornamen [Vorname] verwendet.“ Die Anwesenden nicken, einige machen sich eine Notiz. Dann geht es weiter.

„Gut. Als nächstes würde ich gerne den Plan für die Woche besprechen. Möchten Sie beginnen, Herr Yilmaz?“ Herr Yilmaz nickt.

„Klar. Ich werde die Daten der letzten Woche später mit [Anrede/Vorname + Nachname] analysieren. [Nominativ] wird sie danach noch final einordnen und [poss. 2] Ergebnisse nachher über das System zur Verfügung stellen. Ich möchte außerdem auch noch mal deutlich machen, dass wir es ganz klar [dativ] zu verdanken haben, dass die Situation der letzten Woche nicht weiter ausgeartet ist.“

Die Abteilungsleitung nickt und sagt: „Dem kann ich mich nur anschließen. Wir haben Ihnen, [Anrede/Vorname + Nachname], viel zu verdanken.“`,
  },

  email: {
    title: "Formelle E‑Mail",
    text: `Guten Tag [Anrede/Vorname + Nachname],

vielen Dank für die Berichtigung Ihrer Daten. Wir haben Sie nun wie folgt in unser System eingetragen:
Anrede: [Anrede]
Name: [Vorname + Nachname]
Pronomen: [Bezeichnung]

Sollten noch weitere Anpassungen nötig sein, lassen Sie es uns gerne wissen, [Anrede/Vorname + Nachname]. Ab nächstem Monat wird im Übrigen auch die Möglichkeit gegeben sein, die Daten selbstständig über unsere App zu ändern.

Mit besten Grüßen
Queere Krankenkasse der Zukunft`,
  },
  declensions: {
    title: "Alle Deklinationen",
    type: "declensions",
    random: false,
    text: "",
  },
};

export default SampleTexts;
