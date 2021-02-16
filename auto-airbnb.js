var roomInfos = {
  "Deluxe Family Suite" : {
    color : "5",
    roomNum : "1F",
    calId: "tera"
  },
  "Wooden Balcony Room" : {
    color : "9",
    roomNum : "2F",
    calId: "tera"
  },
  "Indigo Twin Room" : {
    color : "9",
    roomNum : 501,
    calId: "kame5f"
  },
  "HOSHI☆Room" : {
    color : "7",
    roomNum : 502,
    calId: "kame5f"
  },
  "Smiling Room" : {
    color : "1",
    roomNum : 503,
    calId: "kame5f"
  },  
  "Lovely Room" : {
    color : "4",
    roomNum : 601,
    calId: "kame6f"
  },
  "Sunny Balcony Room" : {
    color : "11",
    roomNum : 602,
    calId: "kame6f"
  },
  "Fancy Room" : {
    color : "6",
    roomNum : 603,
    calId: "kame6f"
  }
} //部屋名と色番号、部屋番号 

var calIds = { "tera": "cb45eh2g6tdp2mtchq9lobjp88@group.calendar.google.com",
               "kame5f": "1s93j2basap34ppkr9jvvasmc0@group.calendar.google.com",
              "kame6f": "q4cn95asvdlgd8jm3bvipl3pl4@group.calendar.google.com"
}

function mail2Schedule(){
  const gmailData = getGmailData();
  
  for(var i in gmailData){
    createSchedule(gmailData[i]);
  }
}


function createSchedule(reserveData) {
  
  //Gmailから、この形でデータをとってくる
/*  var reserveData = {
    guestName : guestName,
    checkInDate : new Date(checkDate.checkIn.year, checkDate.checkIn.month -1, checkDate.checkIn.day), 
    checkOutDate : new Date(checkDate.checkOut.year, checkDate.checkOut.month -1, checkDate.checkOut.y),
    roomName : includedRoomNames,
    num : num,
    rawText : message.getPlainBody()
    
  } */
  
  var targetRoom = roomInfos[reserveData.roomName]
  //今回使うカレンダーを指定する
  var id = calIds[targetRoom["calId"]]
  var myCal = CalendarApp.getCalendarById(id)
  
  //Googleカレンダーの仕様に合わせて、checkOutDateを1日後ろにずらす
  reserveData.checkOutDate.setDate(reserveData.checkOutDate.getDate()*1 + 1)
  Logger.log([reserveData.checkInDate, reserveData.checkOutDate])
  
  //new Date("2019/06/08"), new Date("2019/06/10")
  //カレンダーにイベントを登録する
  var schedule = myCal.createAllDayEvent(targetRoom.roomNum + " " + reserveData.num + "人 " + serveData.guestName, reserveData.checkInDate, reserveData.checkOutDate);
  //上で登録したイベントに、部屋ごとの色をつける
  schedule.setColor(targetRoom["color"]);
  //schedule.setDescription(reserveData.rawText);  
}

/*
function arrengeDate4Cal(str){
  //  var str ="2018年2月13日"
  if(str){
    Logger.log(str)
    str = str.match(/(.*)年(.*)月(.*)日/);
    str.shift();
    Logger.log(str)
    //new Date(2018,2,13)
    return new Date(str[0],str[1]-1,str[2])
  }else{
    //もし引数のstrが条件に合わない形だったら、とりあえず1900年元日を返す
    return new Date(1900,01,01)
  }
} */

function getGmailData() {
  const query = "-is:starred Airbnb 予約確定";
  const threads = GmailApp.search(query,0,1)
  Logger.log({threads: threads.length})
  const res = [];
  for(var i in threads){
    const thread = threads[i];
    const messages = thread.getMessages();
    Logger.log({messages: messages.length})
    for(var j in messages){
      const message = messages[j];
      if(!message.isStarred()){
        const text = messages[j].getPlainBody().replace(/\n|\r\n|\r/g,"");
        //Logger.log(text);
        const [__,extractedCheckIn] = text.match(/曜日(.*)曜日/);
        const [firstHit,yearCheckIn,monthCheckIn,dayCheckIn] = extractedCheckIn.match(/(.*)年(.*)月(.*?));
        const[_,monthCheckOut,dayCheckOut] = text.match(/曜日(.*)人数/)[0].replace(firstHit,"").match(/年*)月(.*?)日/);
        const [$yearCheckIn,$monthCheckIn,$dayCheckIn,$monthCheckOut,$dayCheckOut] = [yearCheckIn,nthCheckIn,dayCheckIn,monthCheckOut,dayCheckOut].map(forceValidString);
        
        const $yearCheckOut = (Number($monthCheckIn)>Number($monthCheckOut))? Number($yearCheckIn)+1 : mber($yearCheckIn);
        
        const checkDate = {
          checkIn:{
            year:$yearCheckIn,
            month:$monthCheckIn,
            day:$dayCheckIn
          },
          checkOut:{
            year:$yearCheckOut,
            month:$monthCheckOut,
            day:$dayCheckOut
          }
      };
      
      Logger.log({checkDate:checkDate})
      
      //ゲスト名取得
      const [,guestName] = text.match(/新規予約確定です! (.*)さんが/)
      Logger.log(guestName)
      
      //部屋名取得
      const roomNames = Object.keys(roomInfos)
      const includedRoomNames = roomNames.filter(function(roomName){
        return text.indexOf(roomName) >= 0  
      })
      Logger.log({includedRoomNames:includedRoomNames});
      
      //人数取得
      const [,adult, num2] = text.match(/人数(大人)?(\d*)/)
      num = parseInt(num2)
      if (text.match(/子ども(\d*)名/)){
        const [,kid_num] = text.match(/子ども(\d*)名/)
        num = parseInt(num) + parseInt(kid_num)        
      }
      totalNum = String(num)
      if (text.match(/乳幼児(\d*)名/)){
        const [,infantNum] = text.match(/乳幼児(\d*)名/)
        totalNum += "人幼児" + infantNum
      }
      Logger.log({"乳幼児":infantNum})
      Logger.log({"合計人数":num})
      
      var reserveData = {
        guestName : guestName,
        checkInDate : new Date(checkDate.checkIn.year, checkDate.checkIn.month -1, checkDate.checkIn.y), 
        checkOutDate : new Date(checkDate.checkOut.year, checkDate.checkOut.month -1, checkDate.eckOut.day),
        roomName : includedRoomNames,
        num : totalNum,
        rawText : message.getPlainBody()
      }
        
      res.push(reserveData);  
      
      //処理が済んだものにスターをつける
      message.star();      

    }
    }
  }
    return res;
}

function forceValidString(str){
  return encodeURI(str).replace(/%E2%80%8C/g,"").replace("%20","")
}