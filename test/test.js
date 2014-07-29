var should = require('chai').should();
var factory = require("../namaniku-factory");

describe('Factory', function() {
    describe('ネストのないファクトリ', function() {
        beforeEach(function() {
            this.Factory = factory.Factory({
                id: factory.Sequence(),
                first_name: 'Bruce',
                last_name: 'Willis',
                full_name: factory.LazyAttribute(function(obj) {
                    return obj.first_name + ' ' + obj.last_name;
                })
            })
        });
        
        it('フィクスチャが作成される', function() {
            var person1 = this.Factory();
            person1.id.should.equal(1);
            person1.first_name.should.equal('Bruce');
            person1.last_name.should.equal('Willis');
            person1.full_name.should.equal('Bruce Willis');

            var person2 = this.Factory();
            person2.id.should.equal(2);
            person2.first_name.should.equal('Bruce');
            person2.last_name.should.equal('Willis');
            person2.full_name.should.equal('Bruce Willis');
        });

        it('属性を上書きできる', function() {
            var person1 = this.Factory({ first_name: 'Connie' });
            person1.id.should.equal(1);
            person1.first_name.should.equal('Connie');
            person1.last_name.should.equal('Willis');
            person1.full_name.should.equal('Connie Willis');

            var person2 = this.Factory({ first_name: 'Rumer' });
            person2.id.should.equal(2);
            person2.first_name.should.equal('Rumer');
            person2.last_name.should.equal('Willis');
            person2.full_name.should.equal('Rumer Willis');

            var person3 = this.Factory({ last_name: 'Wayne' });
            person3.id.should.equal(3);
            person3.first_name.should.equal('Bruce');
            person3.last_name.should.equal('Wayne');
            person3.full_name.should.equal('Bruce Wayne');
        });

        it('属性を追加できる', function() {
            var person = this.Factory({ age: 59 });
            person.age.should.equal(59);
            person.id.should.equal(1);
            person.first_name.should.equal('Bruce');
            person.last_name.should.equal('Willis');
            person.full_name.should.equal('Bruce Willis');
        });

        it('属性の追加と上書きが同時にできる', function() {
            var character = this.Factory({
                id: 100,
                movie: 'Die Hard',
                first_name: 'John',
                last_name: 'McClane',
            });
            character.id.should.equal(100);
            character.movie.should.equal('Die Hard');
            character.first_name.should.equal('John');
            character.last_name.should.equal('McClane');
            character.full_name.should.equal('John McClane');
        });
    });

    describe('ネストしたファクトリ', function() {
        before(function() {
            var MemberFactory = factory.Factory({
                id: factory.Sequence(),
                first_name: 'John',
                last_name: 'Smith',
                name: factory.LazyAttribute(function(obj) {
                    return obj.first_name + ' ' + obj.last_name;
                })
            });
            
            this.Factory = factory.Factory({
                name: 'The A-Team',
                member1: factory.SubFactory(MemberFactory),
                member2: factory.SubFactory(MemberFactory)
            });
        });
        
        it('ファクトリが作成したオブジェクトが属性に追加される', function() {
            var team1 = this.Factory({
                member2: {
                    first_name: 'Templeton',
                    last_name: 'Peck'
                }
            });
            team1.name.should.equal('The A-Team');
            team1.member1.id.should.equal(1);
            team1.member1.name.should.equal('John Smith');
            team1.member2.id.should.equal(1);
            team1.member2.name.should.equal('Templeton Peck');

            var team2 = this.Factory({
                name: 'MP',
                member1: {
                    first_name: 'Roderick',
                    last_name: 'Decker'
                },
                member2: {
                    first_name: 'Colonel',
                    last_name: 'Lynch'
                }
            });
            team2.name.should.equal('MP');
            team2.member1.id.should.equal(2);
            team2.member1.name.should.equal('Roderick Decker');
            team2.member2.id.should.equal(2);
            team2.member2.name.should.equal('Colonel Lynch');
        });
    });
});


describe('Sequence', function() {
    describe('#next', function() {
        before(function() {
            this.Sequence = factory.Sequence();
        });
        
        it('呼び出し毎にインクリメントされる', function() {
            var result1 = this.Sequence.next();
            result1.should.equal(1);

            var result2 = this.Sequence.next();
            result2.should.equal(2);
        }) 
    });

    describe('#next', function() {
        before(function() {
            this.Sequence = factory.Sequence(function(n) {
                return "No. " + n;
            });
        });
        
        it('コールバックにカウンターが渡されて呼ばれる', function() {
            var result1 = this.Sequence.next();
            result1.should.equal("No. 1");

            var result2 = this.Sequence.next();
            result2.should.equal("No. 2");
        }) 
    });
});


describe('LazyAttribute', function() {
    describe('#evaluate', function() {
        before(function() {
            this.LazyAttribute = factory.LazyAttribute(function(obj) {
                return obj.first_name + ' ' + obj.last_name;
            });
        });

        it('コールバックが呼ばれる', function() {
            this.LazyAttribute.evaluate({
                first_name: 'Will',
                last_name: 'Smith'
            }).should.equal('Will Smith');
        });
    });
});
