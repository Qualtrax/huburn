(function () {
    var huburn = angular.module('huburn', ['ngRoute', 'd3'])
    .constant( 'LABEL', {
        'FEATURES': 'FEATURES',
        'ZERO_DEFECTS': 'ZERO DEFECTS',
        'ESCALATIONS': 'ESCALATIONS',
        'FREERANGES': 'FREERANGES',
        'TECHNICAL_DEBT': 'TECHNICAL DEBT',
        'FIRELANES': 'FIRELANES',
        'NEAR_MISSES': 'NEAR MISSES',
        'RESEARCH': 'RESEARCH',
        'BUILD_MACHINE': 'BUILD MACHINE',
        'OTHER': 'OTHER',
        'SCOPE_CHANGES': 'SCOPE CHANGES'
    });
}());