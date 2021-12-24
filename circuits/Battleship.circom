include "../node_modules/circomlib/circuits/pedersen.circom";

template ShipHit() {
    signal input target[2];
    signal input ship[4]; //0: x, 1: y, 2: z (ship length), 3: o (orientation)
    signal output out;
    signal horizontal;
    signal vertical;
  
    horizontal <-- (ship[3] == 0 && target[0] == ship[0] && target[1] >= ship[1] && target[1] <= ship[1] + ship[2]);
    vertical <-- (ship[3] == 1 && target[0] >= ship[0] && target[0] <= ship[0] + ship[2] && target[1] == target[1]);
    out <-- (horizontal == 1 || vertical == 1);
}

template Battleship() {
    signal input ships[5][3];
    signal input shipHash[2];
    signal input target[2];
    signal output out;
    
    signal hashCheck;
    signal isInRange;

    // hash check
    component hash = Pedersen(256);
    component n2b = Num2Bits(256);

    var num = 0;
    for (var i = 0; i < 5; i++) {
        num += ships[i][0] * (16**(i*3)) + ships[i][1] * (16**((i*3)+1)) + ships[i][2] * (16**((i*3)+2));
    }
    n2b.in <== num;
    for (var i = 0; i < 256; i++) {
        hash.in[i] <== n2b.out[i];
    }
    assert(shipHash[0] == hash.out[0] && shipHash[1] == hash.out[1]);
    
    // range check
    isInRange <-- (target[0] >= 0 && target[0] <= 9 && target[1] >= 0 && target[1] <= 9);
    assert(isInRange == 1);

    // check for hit
    component ISH[5];
    var lengths[5] = [5, 4, 3, 3, 2];
    for (var i = 0; i < 5; i++) {
        ISH[i] = ShipHit();
        ISH[i].target[0] <== target[0];
        ISH[i].target[1] <== target[1];
        ISH[i].ship[0] <== ships[i][0];
        ISH[i].ship[1] <== ships[i][1];
        ISH[i].ship[2] <== lengths[i];
        ISH[i].ship[3] <== ships[i][2];
    }
    out <-- (ISH[0].out == 1 || ISH[1].out == 1 || ISH[2].out == 1 || ISH[3].out == 1 || ISH[4].out == 1);
    log(out);
}

component main = Battleship();
