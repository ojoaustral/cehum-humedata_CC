// Last updted 2023-10-22, CC. 

function decodeUplink(input) {
  
  // Nested generic function for byte-to-float conversion. It is designed to convert a 4-byte array into a floating-point number, following the IEEE754 standard.
  function bytesToFloat(bytes) {
    var bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    return sign * m * Math.pow(2, e - 150);
  }

  var data = {};

  // Using the nested generic function and passing specific bytes as arguments
  data.do = bytesToFloat(input.bytes.slice(0, 4));
  data.ph = input.bytes[4] * 14 / 255;
  data.ec = bytesToFloat(input.bytes.slice(5, 9));
  data.tds = bytesToFloat(input.bytes.slice(9, 13));
  data.sal = input.bytes[13] * 42 / 255;
  data.rd = (input.bytes[14] * 0.3 / 255) + 1;
  data.wt = input.bytes[15] * 60 / 255;
  data.ip = (input.bytes[16] * 120 / 255) + 80;
  data.ap = (input.bytes[17] * 40 / 255) + 80;
  data.at = (input.bytes[18] * 80 / 255) - 20;
  data.lon = bytesToFloat(input.bytes.slice(19, 23));
  data.lat = bytesToFloat(input.bytes.slice(23, 27));
  data.it = (input.bytes[27] * 80 / 255) - 20;
  data.ih = input.bytes[28] * 120 / 255;
  data.bl = (input.bytes[29] * 15 / 255);
  data.orp = bytesToFloat(input.bytes.slice(30, 34));
  data.sat = input.bytes[34] * 150 / 255;
  data.do_temp = bytesToFloat(input.bytes.slice(35, 39));
  data.sat_temp = input.bytes[39] * 150 / 255;
  data.ec_temp = bytesToFloat(input.bytes.slice(40, 44));
  data.ph_temp = input.bytes[44] * 14 / 255;
  data.do15 = bytesToFloat(input.bytes.slice(45, 49));
  data.yr = input.bytes[49] + 2000;
  data.mt = input.bytes[50];
  data.dy = input.bytes[51];
  data.hr = input.bytes[52];
  data.mn = input.bytes[53];
  data.sc = input.bytes[54];

  return {
    data: data
  };
}

