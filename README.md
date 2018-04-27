## LightMapper [![Build Status](https://travis-ci.org/hajekj14/light-mapper.svg?branch=master)](https://travis-ci.org/hajekj14/light-mapper)

typescript mapper from object to object

### Install

npm install light-mapper

### Use

```javascript

class Target {
    @Mapping({
        requirement: MappingRequirement.REQUIRED,
        from: ['sourceA'],
        transformation: (value: any) => {
            return value + ' transformed by decorator'
        }
    })
    public targetA: string
    @Mapping({
        requirement: MappingRequirement.REQUIRED,
        from: ['sourceB']
    })
    public targetB: string
    @Mapping({
        requirement: MappingRequirement.REQUIRED,
        from: ['sourceC']
    })
    public targetC: string
    @Mapping(MappingRequirement.REQUIRED) public targetD: string
}

class Source {
    public sourceA: string = 'to target A'
    public sourceB: string = 'to target B'
}

const mapper = new LigthMapper()

const result = mapper
    .transform('targetA', value => value + ' transformed A')
    .transform('targetB', value => value + ' transformed B')
    .replace('targetC', 'replaced C')
    .replace('targetD', 'replaced D')
    .map(Target, new Source())

console.log(result)
/* Output
Target {
  targetA: 'to target A transformed by decorator transformed A',
  targetB: 'to target B transformed B',
  targetC: 'replaced C',
  targetD: 'replaced D' }
*/

```
