/**
 * Pre-processors for IDL structures
 */

import {Idl} from '@project-serum/anchor';
import {
  IdlAccount,
  IdlAccountDef,
  IdlAccountItem,
  IdlAccounts,
  IdlEnumVariant,
  IdlField,
  IdlInstruction,
  IdlType,
  IdlTypeArray,
  IdlTypeCOption,
  IdlTypeDef,
  IdlTypeDefined,
  IdlTypeDefTyEnum,
  IdlTypeDefTyStruct,
  IdlTypeOption,
  IdlTypeVec,
} from '@project-serum/anchor/dist/cjs/idl';
import {version} from '../package.json';

/// utils ///

const capitalise = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const snakecase = (value: string): string =>
  value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

/// type predicates

const isAccounts = (accountItem: IdlAccountItem): accountItem is IdlAccounts =>
  (accountItem as IdlAccounts).accounts !== undefined;

const isStruct = (
  type: IdlTypeDefTyEnum | IdlTypeDefTyStruct // TODO when this is released: https://github.com/project-serum/anchor/pull/1918
): type is IdlTypeDefTyStruct => (type as IdlTypeDefTyStruct).kind === 'struct';

const isOption = (type: IdlType): type is IdlTypeOption =>
  (type as IdlTypeOption).option !== undefined;

const isCOption = (type: IdlType): type is IdlTypeCOption =>
  (type as IdlTypeCOption).coption !== undefined;

const isDefined = (type: IdlType): type is IdlTypeDefined =>
  (type as IdlTypeDefined).defined !== undefined;

const isVec = (type: IdlType): type is IdlTypeVec =>
  (type as IdlTypeVec).vec !== undefined;

const isArray = (type: IdlType): type is IdlTypeArray =>
  (type as IdlTypeArray).array !== undefined;

// for enum variant
// TODO when this is released: https://github.com/project-serum/anchor/pull/1918
const isEnumField = (x: IdlField | IdlType): x is IdlField =>
  (x as IdlField).name !== undefined;

/// mappers ////

// TODO handle 'docs' at multiple levels - no in TypeScript Idl?

const mapType = (type: IdlType): string => {
  if (isDefined(type)) return type.defined;
  if (isOption(type)) return `Option<${mapType(type.option)}>`;
  if (isCOption(type)) return `COption<${mapType(type.coption)}>`;
  // TODO Vec
  // TODO [;]

  if (type === 'bytes') return 'Vec<u8>';
  if (type === 'string') return '&str'; // TODO how about "String"
  if (type === 'publicKey') return 'Pubkey';

  return type as string; // covers primitives
};

const mapField = ({name, type}: IdlField) => ({
  name: snakecase(name),
  type: mapType(type),
});

const mapAccount = ({isMut, isSigner, name}: IdlAccount) => {
  const features = [isMut ? 'mut' : null, isSigner ? 'signer' : null].filter(
    x => x !== null
  );

  // TODO pda

  return {
    name: snakecase(name),
    annotation:
      features.length > 0 ? `#[account(${features.join(', ')})]` : null,
  };
};

const mapTypeDefStruct = ({kind, fields}: IdlTypeDefTyStruct) => ({
  kind,
  fields: fields.map(mapField),
});

const mapEnumVariant = ({name, fields}: IdlEnumVariant) => {
  // TODO when this is released: https://github.com/project-serum/anchor/pull/1918
  const namedFields: IdlField[] = [];
  const tupleFields: IdlType[] = [];
  fields?.forEach(x => {
    if (isEnumField(x)) namedFields.push(x);
    else tupleFields.push(x);
  });

  return {
    name,
    namedFields: namedFields.map(mapField),
    tupleFields: tupleFields.map(mapType),
  };
};

const mapTypeDefEnum = ({kind, variants}: IdlTypeDefTyEnum) => ({
  kind,
  variants: variants.map(mapEnumVariant),
});

// cannot infer types due to recursion in mapAccountItem()
type Accounts = {name: string; accounts: (Accounts | Account)[]};
type Account = {name: string; annotation: string | null};

const mapAccountItem = (item: IdlAccountItem): Accounts | Account => {
  if (isAccounts(item))
    return {name: item.name, accounts: item.accounts.map(mapAccountItem)};
  else return mapAccount(item);
};

const mapInstruction = (instruction: IdlInstruction) => ({
  methodName: snakecase(instruction.name),
  contextName: capitalise(instruction.name),
  accounts: instruction.accounts.map(mapAccountItem),
  args: instruction.args.map(mapField),
});

const mapAccountDef = ({name, type}: IdlAccountDef) => ({
  name,
  type: mapTypeDefStruct(type),
});

const typeDefs: string[] = []; // keep track of duplicates

const mapTypeDef = ({name, type}: IdlTypeDef) => {
  // bug in IDL generation that may cause repeating types of the same name
  if (typeDefs.includes(name)) {
    console.warn(
      `⚠️  Found duplicate type [${name}]. Only considering the first one...`
    );
    return null;
  }
  typeDefs.push(name);

  return {
    name,
    type: isStruct(type) ? mapTypeDefStruct(type) : mapTypeDefEnum(type),
  };
};

// TODO mapState()
// TODO mapEvents()
// TODO mapConstants()
// TODO mapMetadata()

export default function map(
  programId: string,
  {name, instructions, accounts, types, errors}: Idl
) {
  return {
    anchorgenVersion: version,
    createdAt: new Date().toISOString(),
    programId,
    name,
    instructions: instructions.map(mapInstruction),
    accounts: accounts?.map(mapAccountDef),
    types: types?.map(mapTypeDef)?.filter(x => x !== null), // deal with duplicate types
    errors,
  };
}
