// 八字排盘计算库
// 输入：已排好的四柱八字（年月日时，共 8 个字），输出排盘所需的各项数据

// ==================== 基础数据 ====================

// 十天干
export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 十二地支
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const GAN_WUXING = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
// 地支五行
const ZHI_WUXING = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};
// 天干阴阳（阳 true / 阴 false）
const GAN_YANG = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
};

// 五行颜色与图标
export const WUXING_STYLE = {
  木: { color: '#2ba471', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAACIlBMVEUAAAC4pZTu4tC4l3PxzZfGs5/ZzL3w3sWKVB3qr1b3v2f3wGufhm72xnvxxYHxzJTIsZjOvqzVxbPLv7Tj18nu4M1nMwFpOg2GSw2YYil/WjidbjuEY0SsgVGvhFbwtmDwuGObgGazjmeqi2rqt2ymj3m+oYLCpojyyo7Fq5Dw06b13752OwFjNAh4RBF4Rhd4TieLXS97VzWAXTuOaESneEaqfEuQbU3NmFOOb1OWemCzjGK5k22ki3TftHa/n32umofyx4a2oY3Rvaf13LbWzcbYlzvhokjPjC9oNAFmMgFfLwCERAF7PwFjMQHprVSHRgGBQgF0OwFhMAB+QAFwOAHHgSOGRQGCQwHwtl9xOQFlMgF/QQF6PgF4PQFzOgFqNQFeLgDmqVDdnUJ3PAHTkTTKhSfBehpcLQD2vWfvtFx2PAHAeBhtNgHdoEpuNwGtejubZy3EfiKSVhKKSQRrNQH2xHbwvG3vuWfnrVjjp1DRjjLHgyiUWxyOUBDvvnLlsmftt2TstGDaqGDXo1jgo0zWmUPam0Gsdza5fjWtdC7LhytrQxx6Rg9jOA9oOg6MTgttOALz0Z3YuY3fuIHtu3Lyv3H2wXDhs2/quW7Oo2firmHssFm6jVjiqVfHl1XQnFTWnlDLlk7Wmke+ikezgkPPkkHSkDXHiTWfazV0TirCgCmrbiazdCW6diCPWh/Cex2qaRuGUhpxQA10QAxwPgq/SdA8AAAARnRSTlMAPwJfPDMVD7Z9cGxkW1JAOicgHgoH0cbFqZuXjoJ9cnBsa2hmWVFLRkMsF9HLwburo52Xj42HhYGBcnBmXlxWTExGLCAM6Bt+bQAAAoFJREFUSMftlEd7ElEUhieECIEAgpBqjCmaZu+9i4EBHFoglEA0BqIEadJDejcmsffee/1/3svMMLjwAs/jwgXvalh8977fnDNgRYr8R5Ts2rple6m04Ni2SsWQUdfLbS8sd3iz3qoYsujsBm5rIbk1O3GN0nnZccluMNeUFSK6hGvSpmqb2VRfQLCijzTtNWhVxLq8Y6tO1GZMtabl0vxSkr1VlUocBK8YHf3QNFXXvDp3jNVYBe6y0qZqYGrWWTZxN+YKNrpxq0Kh6dMDUwswBUEbvLm6KccYasFdTkW2KaFOv9xqdNOSa3jG1EiaqvrJl1uDLFrhBvNz/mGq1aUfTKmjqDmsdetBRX22qY168KMWqOwqvEuZZUpXVBG7OYjgBmCqzDZlKhIHETnpfhDMMjUAU60DnAAegqhJit9DSbA2lKkNmBroiicRwWM4lLTqF32T90ZGn84vqwjCTk1ljwwRPAArKn74RiLeha+eQOL1xxCsCLuGmlBrswMO4+er296AiyTwzUxVHG5Frg009Y/GFwZoPqeoiu/EOdZGueIbk1/IkAxSFetZqLWBw1iZHT/P8DZIVTyEXBu35tf3L7OT5xjmFh1kxXbU2iz5J8Lh6Fi05yLN4+cvfcNaULFO8vfc6eYn4ViXy+NxJR4OUox75dPeZ/Mh5P+V+H5kpptk4M30xN0Hd+JJD8SV/BQsRX1St6a6Mnx4dCPi7aYJzKE+4s7ojDzDi5vXYwnmnH0SRJDTcoahpYMdlzMcwVCwy8/SlIuwjhhzzBQbQ9LW0EOyXoRhLCFzjJCFoTkl4PEGeXxhJ/whO95AHdOG5YGMw2JaiwR8voAtxYoU+Vf8BupYG2jYx+awAAAAAElFTkSuQmCC' },
  火: { color: '#d9001b', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAC+lBMVEUAAAD14tL13NX0yML10cf12M/35c76vpr1uKLura340rnwu7332svqh433yLL468T318b59sr7sIf6uY35wJL4v6Ptnp/34LPvs7X30L322c70m4Tzoovrj4z6r5b1o5X43Jv50ZztmZf54rH76MP52MH0snj734LumXn5uYHofHz6147655jslZX2vqn2vaj23qr13Knuqar//////tX/+8D/4U3//uz/8Hr/3Ub/2kP/0Dv+wTr9vTb/yS39nCz/9Zv2qo7/84r/6mL7jSX/+Kz5uY73o3/8rHr/5mf2h2L/5Vb+y0D8lR733czwran/8pT/7ID/7W34sm3/4FT/2kf/1T7/yDz6iDn+rS/+qxj8mBj1spv5u4j1onj/6W3/4Vv4l1b3g1P+1Ub7kzv+zzb/xjb9tjX4li39nxX8pA/1rAP6uwL//cjxvb/51bv5waLxopv5vpfxjnr/6nf2gmz3tmD/5lvlUVjtbFb6h0j1j0X/2ED3kjT8qTP+sTH/wzD7kjD9pSz+vSf6kib/wiP+uB7+hBH/7A/dEg3+2gbbAwL///b//er//97259j4+NX41cX36MT0ysHywb3/+Lz3zbr5ya31taX/9aT3ypzumZnsj5X6y474rIf0lYfviIDpdXr7pXf82G/0nW75oGP4l2H6pln2jVT2rVL6wFH6okr4lUn8xkf8v0f8oDbiMDX+tyX9nSL7jh/fIR/8cBv8sgvrYQP07Onxurb1xrX427P/+rH6zbD//6rvpqT60p3woIj7sILrfoD2u33yqn30lHX+6nP7yHH5vnH1iXDoanDsfm/yqWf7z2b+4mTmYWT9xVv+z0njQEHnSjH4ji/8tirkOyD9tRj8vBT+TBP+0xL2gBL5lw7+kwv8wwXlRQH5ywDscAD49c3zu6z//57//4r+8In+3YT723n/+G7nZ2n//2j5tFnoWU75r0H/7T7+3jzveDn//zb4ZjX5dDHugynznif6WyfrYSX90STviQDiKgDgIQBfm0P8AAAAM3RSTlMACgU1JxAXp4ZlUkMfxWAyLyfdyLqLiV9RRRXWwbmvrKGfnGhBPu/q6uXgxqyheHhycm2iTzfpAAAD9klEQVRIx+3VVVAbQRjA8Q0kxUrd3d0lhWgDNNZAoCEhAgmxEoMixaW41lvc3d3q7u7u7u4y0zvazvQl9thOfw93T//Z229n9sB//zwTo4tuKPjZv7+psaHlYLg29+1r1t2oDmneAw63OGVS+xiz6BBz9xnQ9lAZTk6+JWZGhDNJJHcoRGxYtyajoI/hH9trGIlCQUIz3bDOaRl5z2CDwx6kAgqlBxxmQCHV0tCjMelfQCFlWSKA1eYty7bvoZqhuqOgeY001TsafyEla2Pm6L7mG+/5k6lU8vbxADJ0hL4d9vQvI/n4+J5ocPdxryinsg7t6gUg/fogETrXG+FLFrr7MEmnpUGFB8LCKk+XLkNajgeoflTSIF37HFxC9hAyN/sdqXWrL6eHcXlu+esyc8YB0LeugmmlIzQTe3hQmMxCuuxC/XMxVxbnVZLlvwsJEKyY2v0WSO3h5Mp8D+FOvwC6bAWuoZHbGB0lCaxgmZma10a9ZPlpnyzi8OGtHmW5hYF0GS86mhcThW8MC6wKrzuwuxqPC9J+JAhwqGZ9jjigKFASw1u6dAVxBZ7IldDFdZIjQXLG8QHaut6ITeTq9Vsrw+kSrsILDr3wRIfzVWLup9Dd+4XDtQ6n59pNzL0b1+xzgMTi3JbyukKHGNn7K+8C8vIsgPZwzc7iXKd8RWsrEcdww8UScTiiQ3x8ZPuV9qqiXJTWsPfa9X7Fe4vKFY6xUMfAt7TgGLGtjo7x19qTIul5CO1ht7s5AcXHwqPwDCwEr+S7MXiOkKSkpPjwY4OAVohulvvKjteckXI4nAhsM78ZG4FvEQgE12/cEESGWuu830azgs5IMREYDEaeyI/j2Mr5AoGS39GhUoQeHaSr7Dmhhm3bhZCYSMCgI+JUSuXl1NSbitBT04Eu/erRXTCEhAQsGm1LuKRSXk5Ovnr+RcgAneEo6eIuGAKBwA4ORssT+Krm16+i35x9itAdutrDgjFYLGexvT2aI09UXfD0jDwXYgF0mma/BBbMxrBdRUtoaDab0NHwqPpc03A9V8dEG9jyk66uniIbGxr0kl6K8/rcdhToNrbUDuYiotEO2tnZ0Gg0kWeC5vrFEH0X86zShTBnl+UuzvBzucvDgwTNtYvWQI/Zj7ctgmQ7O2dDr4XOC7O3uXzRdDYN0BcOnOo9H5aePv8n7/miqzc7U6YAvaX36nl/Wp1um6q5lXZKb9h73MoFv61atWDl6ifJyZpbbWOAXt1N5v5h3km1Wt3ZZg0MMHDsql/VSm+bj9/S0lLOWhj4o2OdsNux4/6DZ29T76SkNVlbAUOhJn34qr59W33ne0rIHGAcU4thQ8dYmYD//g4/APZab7K5Lb8OAAAAAElFTkSuQmCC' },
  土: { color: '#8b6d03', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAA4VBMVEUAAADPo13TrXHezreylnnZzb6VcEmukXLg1MWkg2DQqGm8pYzBrZjRwbDe0Lvh18yUbEG6oYPavI2/qZLavpTOu6XgyqfQwKy8k1nJoWKnh2WoimrFom7UsXnizq6cdk6beFO5j1efflutjmitjmrXtX/BrJXUu5nexJzPo12WbULKnlrOolzMoFuxh0+uhE2Yb0O7kFOheEfHnFnBllaacUS0iVCke0mQaT/FmVi+k1WsgkyedUa4jVGof0qYcUegdka+lFW9kVSbdU6Ub0bWtHzSrnjUrXC/mF+jgFyxiVe0AUTTAAAAKXRSTlMAdmIcWRSJYQ1yaUY6IhcGkU9FQD4uLCZ5cG1oZFolhYF8eGpoVD46Nuq7/80AAAF8SURBVEjH7ZPXWsJAEEYjBEIxFKWJgL3spveELmB9/wfSKGQC7G7k0s+cu704O//M7nApKf+e8mVeqByu5Yo13/fz5YO9GzWwDPO3ZqUu8G0upG6jLyQV54+TtSpfwxjXiiLHNTvoG0XF12Jiui7+4eJe7KE1kubzCV5B8BaKbLljjJcfEtoQeElhy66CQqyRjh1XjkzDOS+wvOaVvEmn6nhuIAi7OmU12As9MKdBdHwas0o+QFdhWqyr0UWKuqJ3mT1DcWwPm4tYSaFKExvylihPHKwpUUlt2UwqCBOJz8dw6rSCaJehiUdS1PO0myMXLCEg+mtjKDmZkcfTktEedlgSDjzxs/XRPoqrm0MYTzFLEAeIhO3F3vLttk0QT7YN6NKzN4fnAml7S4jIcO50Mmv6pKStXQPekjASVlJ4dxgJOSmFYDqDhUpOCsiuLhyWFP7du0jf4AxdtDRG1gFiMNHpc22wxJc2dYOrdyzxlf4c2dIRi0cuJeXv8glG/oWZ7yFlmwAAAABJRU5ErkJggg==' },
  金: { color: '#ef9104', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABjFBMVEUAAADVvW/LrUnq4Lzs5tG8kwnMsE/r37Tq37jy6Mft5s69kwu/mRjAmhr30Erw01jw3I/t3Zzs3rDp3rrpwhLGpDPz1mnz2nvYxIDn16Lr4sG7kQW/lhHCniPpxyrwyzPwyzn2zkLx0E/z0lXPs1fQt1/SuWf42nbVvnP03Yf335DayIvcy5Py5Krv58u6jwC8kgbowAzqwxrBmx3sxSDvzD3Wtj3IqUDrzELUtUzryVj41mX11mX12G/y2HHs2X724Zj14pzo37+6jwDswhXvxBvqwQ+8kgXwxB3zxiPuwxntwxfyxSHxxR/rwhLVsS7JpCTXsS7LpCO8kQPlxUbtzkHUsTH1xyXyzUDnxUbwzj/3yzbzyS7xyS32yCnzxyjuxybtxBrowA32zkP1zkH1yjD1ySzxyCrpwhK+lAjqxUjqxUf4z0XiuBTluxLFmgb50k/qxkrhwkP2yzngvDnYsjXRrTHLpirowiPDnBzWrxrswxfftBXmvRK/lQrSpwnQpgnOowjLoAjKnwfxWM3JAAAAQ3RSTlMAY4kXAsmDHxsNBMe7uIx7RDckGcGgbFlSMRLNwa+pn5qThX98c2xiX05ISEArCdPNx7m1s5WVk5GGenRwZmJUPjoUUvhmZwAAAexJREFUSMft1VdX4kAYxvEA0SBIE3ZdXdfetuj2vmt7wUBAUVFRaYIKYu+9+8UdGJKJISPIjV7wv5xzfpObJ2eYcuWeQ0NVpbn3Wq4kZ/t6aC3F1b2BiT/vHu9qXgBMbJvlsldXhNP9BARXQy0D0pGhQ1PY1WshA1dCSbNNPOvgfxf8pKEdMFwKJlt78JnmNb/fVVMAdgYwXF3yeJIWjkG9MgI/vvXXTjX4csBwFkFP+F89cg2A4FroJXUT+HIRhn2o8P+qD9WQhdFQVy99MA2Qa2w2PILyRfaOIQsXotHdWppDlxMYcWc624QcDAajzW+pgyFwMuVCrWOHYTDWYqUMRg7nBUFYvwURLnpQMfNgvuOwI9Dr3bgBGcSyTmUwCujcuAYJ+hd92WJtyiGwmmoFPL8CqYB/ZgSXsujzxoapCI8uA/egO1dKZQisxiTBnRPsCHTh3JE+A0OnYwdpuA9dUhHVIbDdpo8AkL4AJRTEXE2UIXSbQBnvn4t7peJNVnXJdqbzoeAkxb/b1KVd+ykPep1y2aZn1OO0FQp4Okr69tC/qZdTfnrKOSz2xaKjKkwrK1Sgo5WjEyUl0PGrhykqO6IYLicSCUezrTAh1JiDnxsf+aDoKo0Z2NhftCC0/YellmVKycCUK/fU3QH9UdPcti0RdwAAAABJRU5ErkJggg==' },
  水: { color: '#1677ff', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABklBMVEUAAACayfWv0/SeyfCGv/Wnz/Oq0PO/2fHL4PR/wPuAuvCYyPWfzPamz/W41/PB2vHI3vPQ4vNttPZvsO55u/l4t/KQwfC81/Jbp+5mrvFwufxytvZ3tvGGvO+Px/qMwPGXyvqcyfOrzvC11vTD2/LG3PJJnu1LnutWpe9ervldrPdmsvd2u/uEwvyJxPul0Pex0/Iiieoykeo7luxBmOpqtvyTxvbN4fNfsv9csf9Xrf1ltP5arv202/+t2P+Zz/9Uq/2Vyvs6mvRNo/Pk8v+x2v+l1P+Wzf+Lx/9ntv9is/9gs/+s1v1qtv1PqPtptPlYrPlRqPlxtvdZq/dGofUvj+rq9f/c7v/Y7P+63v+q1v+e0P+Gxf9/wf90vf9uuv9ruP+dzvuNxvtlsvp2uPdUqPYzl/RkrfJdqvEuk/EkjvAhieocheoXqfCrzvCkzvCViueE0AmpvtCn0P+p1P+FxP94vf9usv9ftPyRyPtlsvuZy/qBv/p3uvlHo/l/vfhttfhLpPh+vfdgrfRCnvQnj/EMfun2xTbDAAAAOHRSTlMAOyU1TywqFAlbUz01LxsSDANoY19aQhd3bWtjXUxKR0I4KB4QDoqHfXp5cGRXUjIisaGXkXFCBV7n9/8AAAIvSURBVEjH7ZRXV9tAEIUtG1u4dxtwITY1EAjpIxn3XnA3HUJP6Om9l/8d7UqyFUU5OdJbDr5PWs1+O7t3Z1bVV19XWN4xZZzVp7cpAolGxKQooYMG/aACMNQAKCpIOeGjAWBOfkpNAxgVb8rlbK4EIM09kJvwELCWzPI4uzsBrObtskDtIcWBO1pZ4EAVeM3L4RZmqC44opYBer5AT9f+Od1CcB/jDrrH9epOp/sLaLjH7UqTBoGWuPleh2tCklNfhyBnzUcQysh1S70UknZyEUYW8NLDkW0hOIDDpIMCvU06IUCQ3Wl8/aEAvEGiv6Y6gGSDjtLIe/RaBL5HVzeFh1Tj4qU4o8SWzna996eymbwAfKtFtVRHn5E/S5dgi9M1rlI5j3LLOQG4r2UdQAqKuUE/BfySzh97mbViD6wxWx2b4c5rEYHh5hZgEcx9nu0/f/ayyy36GHPMtVd48Frc2aZPuTJ/aaHT1EYminwtlQCg6kYn2dvAYYoQgcaD7A4OMO5Yp85ba0+jLwrx9UIZEu1RdMQ3sTJObxSD32IFFKDvoxq/ddaqrK6sLD+JQfVo2orK8SC6jUFxRvX0+2w8vkm1NGjkv7xINd9VKrufUyd38B8inYzl81v0rEVsa2Cymdz90Hbb8cthuP3z4vT4+OT8ckrDuu5Mf00ma22PROUMPX40bLDyLeSc7HQ6d4cCJN9qbhT32KWe4HCYFAxJnVn32768WrVN1Vdf/59+Acf2hBrwSM00AAAAAElFTkSuQmCC' },
};

// 地支藏干（本气、中气、余气）
const ZHI_CANGGAN = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

// 十二长生名称
const CHANGSHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
// 各天干长生所在地支的索引（配合阴阳顺逆遍历）
const CHANGSHENG_START = {
  甲: 11, 丙: 2, 戊: 2, 庚: 5, 壬: 8, // 阳干顺行
  乙: 6, 丁: 9, 己: 9, 辛: 0, 癸: 3, // 阴干逆行
};

// 六十甲子纳音
const NAYIN_LIST = [
  ['甲子', '乙丑', '海中金'], ['丙寅', '丁卯', '炉中火'], ['戊辰', '己巳', '大林木'],
  ['庚午', '辛未', '路旁土'], ['壬申', '癸酉', '剑锋金'], ['甲戌', '乙亥', '山头火'],
  ['丙子', '丁丑', '涧下水'], ['戊寅', '己卯', '城头土'], ['庚辰', '辛巳', '白蜡金'],
  ['壬午', '癸未', '杨柳木'], ['甲申', '乙酉', '泉中水'], ['丙戌', '丁亥', '屋上土'],
  ['戊子', '己丑', '霹雳火'], ['庚寅', '辛卯', '松柏木'], ['壬辰', '癸巳', '长流水'],
  ['甲午', '乙未', '沙中金'], ['丙申', '丁酉', '山下火'], ['戊戌', '己亥', '平地木'],
  ['庚子', '辛丑', '壁上土'], ['壬寅', '癸卯', '金箔金'], ['甲辰', '乙巳', '覆灯火'],
  ['丙午', '丁未', '天河水'], ['戊申', '己酉', '大驿土'], ['庚戌', '辛亥', '钗钏金'],
  ['壬子', '癸丑', '桑柘木'], ['甲寅', '乙卯', '大溪水'], ['丙辰', '丁巳', '沙中土'],
  ['戊午', '己未', '天上火'], ['庚申', '辛酉', '石榴木'], ['壬戌', '癸亥', '大海水'],
];
const NAYIN_MAP = {};
NAYIN_LIST.forEach(([a, b, name]) => {
  NAYIN_MAP[a] = name;
  NAYIN_MAP[b] = name;
});

// ==================== 工具函数 ====================

// 空亡（旬空）：根据干支所在旬得出两个空亡地支
// 同旬内旬首为甲，旬首地支索引 =(地支索引 - 天干索引)，缺失的两位地支即空亡
function getKongwang(gan, zhi) {
  const g = GAN.indexOf(gan);
  const z = ZHI.indexOf(zhi);
  const xunStartZhi = (z - g + 12) % 12; // 旬首地支索引
  const startKw = (xunStartZhi + 10) % 12; // 空亡起始地支索引
  return ZHI[startKw] + ZHI[(startKw + 1) % 12];
}

// 十神：以日主为「我」，判断某天干对日主的十神关系
function getShiShen(dayGan, targetGan) {
  if (dayGan === targetGan) return '比肩';
  const meWx = GAN_WUXING[dayGan];
  const tWx = GAN_WUXING[targetGan];
  const sameYang = GAN_YANG[dayGan] === GAN_YANG[targetGan];
  // 五行生克顺序：木→火→土→金→水→木
  const order = ['木', '火', '土', '金', '水'];
  const mi = order.indexOf(meWx);
  const ti = order.indexOf(tWx);
  if (meWx === tWx) {
    return sameYang ? '比肩' : '劫财';
  }
  if ((mi + 1) % 5 === ti) {
    // 我生者：食伤
    return sameYang ? '食神' : '伤官';
  }
  if ((mi + 2) % 5 === ti) {
    // 我克者：财
    return sameYang ? '偏财' : '正财';
  }
  if ((mi + 3) % 5 === ti) {
    // 克我者：官杀
    return sameYang ? '七杀' : '正官';
  }
  // 生我者：印
  return sameYang ? '偏印' : '正印';
}

// 十二长生：某天干落在某地支的运
function getChangSheng(gan, zhi) {
  const start = CHANGSHENG_START[gan];
  const forward = GAN_YANG[gan]; // 阳干顺行，阴干逆行
  const zi = ZHI.indexOf(zhi);
  let step;
  if (forward) {
    step = (zi - start + 12) % 12;
  } else {
    step = (start - zi + 12) % 12;
  }
  return CHANGSHENG[step];
}

// ==================== 神煞规则 ====================

// 三合局归属：返回地支所属三合局的关键字
function heJu(zhi) {
  if ('申子辰'.includes(zhi)) return '申子辰';
  if ('寅午戌'.includes(zhi)) return '寅午戌';
  if ('巳酉丑'.includes(zhi)) return '巳酉丑';
  return '亥卯未';
}

// 天乙贵人（日干、年干 → 地支）
const TIANYI = {
  甲: '丑未', 戊: '丑未', 庚: '丑未',
  乙: '子申', 己: '子申',
  丙: '亥酉', 丁: '亥酉',
  辛: '午寅',
  壬: '卯巳', 癸: '卯巳',
};
// 太极贵人
const TAIJI = {
  甲: '子午', 乙: '子午',
  丙: '卯酉', 丁: '卯酉',
  戊: '辰戌丑未', 己: '辰戌丑未',
  庚: '寅亥', 辛: '寅亥',
  壬: '巳申', 癸: '巳申',
};
// 文昌贵人
const WENCHANG = {
  甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉', 己: '酉',
  庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};
// 国印贵人
const GUOYIN = {
  甲: '戌', 乙: '亥', 丙: '丑', 戊: '丑', 丁: '寅', 己: '寅',
  庚: '辰', 辛: '巳', 壬: '未', 癸: '申',
};
// 天厨贵人（食神临官位）
const TIANCHU = {
  甲: '巳', 乙: '午', 丙: '巳', 丁: '午', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};
// 词馆
const CIGUAN = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};
// 羊刃（以日干查地支）
const YANGREN = {
  甲: '卯', 乙: '辰', 丙: '午', 丁: '未', 戊: '午',
  己: '未', 庚: '酉', 辛: '戌', 壬: '子', 癸: '丑',
};
// 红艳煞（以日干查地支）
const HONGYAN = {
  甲: '午', 乙: '午', 丙: '寅', 丁: '未', 戊: '辰',
  己: '辰', 庚: '戌', 辛: '酉', 壬: '子', 癸: '申',
};
// 驿马、劫煞、桃花（以年支/日支三合局查）
const YIMA = { 申子辰: '寅', 寅午戌: '申', 巳酉丑: '亥', 亥卯未: '巳' };
const JIESHA = { 申子辰: '巳', 寅午戌: '亥', 巳酉丑: '寅', 亥卯未: '申' };
// 月德贵人（月支三合局 → 天干）
const YUEDE = { 寅午戌: '丙', 申子辰: '壬', 亥卯未: '甲', 巳酉丑: '庚' };
// 德秀贵人（月支三合局 → 可命中的天干集合）
const DEXIU = {
  寅午戌: '丙丁戊癸',
  申子辰: '壬癸戊己丙辛甲己',
  巳酉丑: '庚辛乙庚',
  亥卯未: '甲乙丁壬',
};
// 天德贵人（月支 → 天干或地支）
const TIANDE = {
  寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲',
  申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚',
};
// 天干五合（用于天德合、天干留意）
const GAN_HE = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
// 地支六合（用于天德合、地支留意）
const ZHI_HE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };

// 孤鸾煞（特定日柱）
const GULUAN = ['乙巳', '丁巳', '辛亥', '戊申', '甲寅', '戊午', '壬子', '丙午'];
// 九丑日（特定日柱）
const JIUCHOU = ['戊子', '戊午', '壬子', '壬午', '己酉', '己卯', '乙卯', '乙酉', '辛卯', '辛酉'];

// 计算神煞，返回每柱命中的神煞数组
function calcShenSha(pillars) {
  const keys = ['year', 'month', 'day', 'hour'];
  const result = { year: [], month: [], day: [], hour: [] };
  const dayGan = pillars.day.gan;
  const yearGan = pillars.year.gan;
  const yearZhi = pillars.year.zhi;
  const dayZhi = pillars.day.zhi;
  const monthZhi = pillars.month.zhi;

  const add = (key, name) => {
    if (!result[key].includes(name)) result[key].push(name);
  };

  // —— 以天干为源、命中地支的贵人类 ——
  const ganToZhiRules = [
    ['天乙贵人', TIANYI, [dayGan, yearGan]],
    ['太极贵人', TAIJI, [dayGan, yearGan]],
    ['文昌贵人', WENCHANG, [dayGan, yearGan]],
    ['国印贵人', GUOYIN, [dayGan, yearGan]],
    ['天厨贵人', TIANCHU, [dayGan]],
    ['词馆', CIGUAN, [dayGan, yearGan]],
  ];
  ganToZhiRules.forEach(([name, map, sources]) => {
    sources.forEach((g) => {
      const targets = map[g] || '';
      keys.forEach((k) => {
        if (targets.includes(pillars[k].zhi)) add(k, name);
      });
    });
  });

  // —— 羊刃、红艳（以日干查地支）——
  [['羊刃', YANGREN], ['红艳煞', HONGYAN]].forEach(([name, map]) => {
    const t = map[dayGan];
    keys.forEach((k) => {
      if (pillars[k].zhi === t) add(k, name);
    });
  });

  // —— 驿马、劫煞（以年支、日支三合局查地支）——
  [['驿马', YIMA], ['劫煞', JIESHA]].forEach(([name, map]) => {
    [yearZhi, dayZhi].forEach((z) => {
      const t = map[heJu(z)];
      keys.forEach((k) => {
        if (pillars[k].zhi === t) add(k, name);
      });
    });
  });

  // —— 披麻（年支退三位）——
  const pimaZhi = ZHI[(ZHI.indexOf(yearZhi) - 3 + 12) % 12];
  keys.forEach((k) => {
    if (pillars[k].zhi === pimaZhi) add(k, '披麻');
  });

  // —— 月德贵人（月支三合局 → 天干）——
  const yuede = YUEDE[heJu(monthZhi)];
  keys.forEach((k) => {
    if (pillars[k].gan === yuede) add(k, '月德贵人');
  });

  // —— 德秀贵人（月支三合局 → 天干集合）——
  const dexiu = DEXIU[heJu(monthZhi)];
  keys.forEach((k) => {
    if (dexiu.includes(pillars[k].gan)) add(k, '德秀贵人');
  });

  // —— 天德贵人 / 天德合（月支 → 天德，天德合取其合）——
  const tiande = TIANDE[monthZhi];
  const isGan = GAN.includes(tiande);
  const tiandeHe = isGan ? GAN_HE[tiande] : ZHI_HE[tiande];
  keys.forEach((k) => {
    if (isGan) {
      if (pillars[k].gan === tiande) add(k, '天德贵人');
      if (pillars[k].gan === tiandeHe) add(k, '天德合');
    } else {
      if (pillars[k].zhi === tiande) add(k, '天德贵人');
      if (pillars[k].zhi === tiandeHe) add(k, '天德合');
    }
  });

  // —— 童子煞（春秋见寅子 / 冬夏见卯未辰，查日支、时支）——
  const springAutumn = '寅卯辰申酉戌'.includes(monthZhi);
  const tongziTargets = springAutumn ? '寅子' : '卯未辰';
  ['day', 'hour'].forEach((k) => {
    if (tongziTargets.includes(pillars[k].zhi)) add(k, '童子煞');
  });

  // —— 空亡（各柱自身旬空）——
  keys.forEach((k) => {
    const kw = getKongwang(pillars[k].gan, pillars[k].zhi);
    // 命中本柱以外其它柱地支即算空亡；此处标注：本柱地支落入其它柱旬空
    keys.forEach((k2) => {
      if (k2 !== k && kw.includes(pillars[k2].zhi)) add(k2, '空亡');
    });
  });

  // —— 孤鸾煞、九丑日（日柱专属）——
  const dayGZ = dayGan + dayZhi;
  if (GULUAN.includes(dayGZ)) add('day', '孤鸾煞');
  if (JIUCHOU.includes(dayGZ)) add('day', '九丑日');

  return result;
}

// 各柱自身空亡（显示在「空亡」行）
function calcKongwangRow(pillars) {
  const keys = ['year', 'month', 'day', 'hour'];
  const row = {};
  keys.forEach((k) => {
    row[k] = getKongwang(pillars[k].gan, pillars[k].zhi);
  });
  return row;
}

// ==================== 天干 / 地支留意 ====================

function calcGanNote(pillars) {
  const gans = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  const notes = [];
  const order = ['木', '火', '土', '金', '水'];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const a = gans[i];
      const b = gans[j];
      if (a === b) continue;
      // 相合
      if (GAN_HE[a] === b) {
        const key = `${a}${b}相合`;
        if (!notes.includes(key) && !notes.includes(`${b}${a}相合`)) notes.push(key);
        continue;
      }
      // 相克
      const ai = order.indexOf(GAN_WUXING[a]);
      const bi = order.indexOf(GAN_WUXING[b]);
      if ((ai + 2) % 5 === bi) {
        const key = `${a}${b}相克`;
        if (!notes.includes(key)) notes.push(key);
      } else if ((bi + 2) % 5 === ai) {
        const key = `${b}${a}相克`;
        if (!notes.includes(key)) notes.push(key);
      }
    }
  }
  return notes;
}

// 地支六冲
const ZHI_CHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
// 地支六害
const ZHI_HAI = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉' };
// 地支暗合（藏干相合）
const ZHI_ANHE = [['子', '巳'], ['子', '辰'], ['丑', '寅'], ['卯', '申'], ['午', '亥'], ['寅', '未'], ['卯', '午'], ['寅', '丑']];
// 相刑组合
function isXing(a, b) {
  const groups = ['寅巳申', '丑戌未'];
  for (const g of groups) {
    if (g.includes(a) && g.includes(b) && a !== b) return true;
  }
  // 子卯相刑
  if ((a === '子' && b === '卯') || (a === '卯' && b === '子')) return true;
  // 自刑
  if (a === b && '辰午酉亥'.includes(a)) return true;
  return false;
}

function calcZhiNote(pillars) {
  const zhis = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  const notes = [];
  const push = (s) => { if (!notes.includes(s)) notes.push(s); };
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const a = zhis[i];
      const b = zhis[j];
      if (ZHI_HE[a] === b) push(`${a}${b}六合`);
      if (ZHI_CHONG[a] === b) push(`${a}${b}相冲`);
      if (isXing(a, b)) push(`${a}${b}相刑`);
      if (ZHI_HAI[a] === b) push(`${a}${b}相害`);
      ZHI_ANHE.forEach(([x, y]) => {
        if ((a === x && b === y) || (a === y && b === x)) push(`${a}${b}暗合`);
      });
    }
  }
  return notes;
}

// ==================== 主入口 ====================

// 校验并解析输入的八字字符串
export function parseBazi(input, gender = 'male') {
  const chars = (input || '').replace(/\s+/g, '').split('');
  if (chars.length !== 8) {
    throw new Error('请输入完整的四柱八字（8 个字，如：己巳丙寅壬子壬寅）');
  }
  const pillars = {
    year: { gan: chars[0], zhi: chars[1] },
    month: { gan: chars[2], zhi: chars[3] },
    day: { gan: chars[4], zhi: chars[5] },
    hour: { gan: chars[6], zhi: chars[7] },
  };
  // 校验干支合法性
  ['year', 'month', 'day', 'hour'].forEach((k) => {
    if (!GAN.includes(pillars[k].gan) || !ZHI.includes(pillars[k].zhi)) {
      throw new Error(`「${pillars[k].gan}${pillars[k].zhi}」不是合法的干支`);
    }
  });
  return compute(pillars, gender);
}

function compute(pillars, gender) {
  const keys = ['year', 'month', 'day', 'hour'];
  const labels = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
  const dayGan = pillars.day.gan;
  const shensha = calcShenSha(pillars);
  const kongwangRow = calcKongwangRow(pillars);

  const columns = keys.map((k) => {
    const { gan, zhi } = pillars[k];
    const cang = ZHI_CANGGAN[zhi];
    return {
      key: k,
      label: labels[k],
      // 主星（天干十神）
      mainStar: k === 'day' ? (gender === 'female' ? '元女' : '元男') : getShiShen(dayGan, gan),
      // 天干
      gan,
      ganWx: GAN_WUXING[gan],
      // 地支
      zhi,
      zhiWx: ZHI_WUXING[zhi],
      // 藏干
      cangGan: cang.map((g) => ({ gan: g, wx: GAN_WUXING[g] })),
      // 副星（藏干十神）
      subStar: cang.map((g) => getShiShen(dayGan, g)),
      // 星运（日主对本柱地支的十二长生）
      xingYun: getChangSheng(dayGan, zhi),
      // 自坐（本柱天干对本柱地支的十二长生）
      ziZuo: getChangSheng(gan, zhi),
      // 空亡
      kongWang: kongwangRow[k],
      // 纳音
      naYin: NAYIN_MAP[gan + zhi] || '',
      // 神煞
      shenSha: shensha[k],
    };
  });

  return {
    columns,
    ganNote: calcGanNote(pillars),
    zhiNote: calcZhiNote(pillars),
  };
}
