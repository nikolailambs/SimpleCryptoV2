export const renderPriceNumber = (x) => {
  if(x >= 1000){
    return(numberWithCommas(parseFloat(x).toFixed(1)))
  }else if(x >= 100){
    return(numberWithCommas(parseFloat(x).toFixed(2)))
  }else if(x >= 10){
    return(numberWithCommas(parseFloat(x).toFixed(3)))
  }else if(x >= 1){
    return(numberWithCommas(parseFloat(x).toFixed(4)))
  }else if(x >= 0){
    return(numberWithCommas(parseFloat(x).toFixed(5)))
  }else{
    return(numberWithCommas(parseFloat(x).toFixed(6)))
  }
}


export const renderPricePrecentage = (x) => {
  if(x >= 1000){
    return(numberWithCommas(parseFloat(x).toFixed(0)))
  }else if(x >= 100){
    return(numberWithCommas(parseFloat(x).toFixed(1)))
  }else{
    return(numberWithCommas(parseFloat(x).toFixed(2)))
  }
}


function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}



export const nFormatter = (num, digits) => {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(num) >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
